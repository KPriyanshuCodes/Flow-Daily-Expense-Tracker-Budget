import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Tag,
  Receipt,
  Layers,
  Settings as SettingsIcon,
  Plus,
} from 'lucide-react';
import { runInitialMigrations } from '@/database/migrations';
import { useCategoryStore } from '@/features/categories/categoryStore';
import { useExpenseStore } from '@/features/expenses/expenseStore';
import { useOtherExpenseStore } from '@/features/otherExpenses/otherExpenseStore';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { calculateMonthlySummary } from '@/utils/calculations';
import { expenseRepository } from '@/database/expenseRepository';
import { otherExpenseRepository } from '@/database/otherExpenseRepository';
import { Expense, Category } from '@/types';

// Views
import { DashboardView } from '@/views/DashboardView';
import { CategoriesView } from '@/views/CategoriesView';
import { SummaryView } from '@/views/SummaryView';
import { OtherExpensesView } from '@/views/OtherExpensesView';
import { SettingsView } from '@/views/SettingsView';

// Modals
import { ExpenseModal } from '@/components/ExpenseModal';
import { CategoryModal } from '@/components/CategoryModal';
import { CategoryHistoryModal } from '@/components/CategoryHistoryModal';
import { ConfirmDeleteModal, DeleteTarget } from '@/components/ConfirmDeleteModal';
import { AppLogo } from '@/components/AppLogo';
import { PWAInstallButton } from '@/components/PWAInstallButton';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'summary' | 'other' | 'categories' | 'settings'>('dashboard');

  // Stores
  const { categories, loadCategories, createCategory, updateCategory, toggleActive, deleteCategory, getUsageCount } =
    useCategoryStore();
  const { expenses, selectedMonthKey, loadExpenses, setSelectedMonthKey, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();
  const { otherExpenses, loadOtherExpenses, addOtherExpense, updateOtherExpense, deleteOtherExpense } =
    useOtherExpenseStore();
  const { settings, setCurrency, resetAllData } = useSettingsStore();

  // Modals state for regular expenses
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialCategoryIdForExpense, setInitialCategoryIdForExpense] = useState<string | undefined>(undefined);

  // Modals state for OTHER expenses (completely isolated)
  const [isOtherExpenseModalOpen, setIsOtherExpenseModalOpen] = useState(false);
  const [editingOtherExpense, setEditingOtherExpense] = useState<Expense | null>(null);
  const [initialCategoryIdForOtherExpense, setInitialCategoryIdForOtherExpense] = useState<string | undefined>(undefined);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Category Expense History modal state
  const [categoryForHistory, setCategoryForHistory] = useState<Category | null>(null);

  // Safe In-App Deletion confirmation state
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    runInitialMigrations();
    loadCategories();
    loadExpenses();
    loadOtherExpenses();
  }, []);

  // Compute live aggregations for current selected month (Only uses regular expenses!)
  const monthlySummary = calculateMonthlySummary(selectedMonthKey, expenses, categories);
  const currentMonthExpenses = expenses.filter((e) => e.monthKey === selectedMonthKey);
  const availableMonthKeys = expenseRepository.getAvailableMonthKeys();

  // Handlers for regular expense
  const handleOpenAddExpense = (catId?: string) => {
    setEditingExpense(null);
    setInitialCategoryIdForExpense(catId);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setInitialCategoryIdForExpense(undefined);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (data: { amount: number; categoryId: string; date: string; note?: string }) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
    } else {
      addExpense(data);
    }
  };

  const handleRequestDeleteExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    if (exp) {
      setDeleteTarget({
        type: 'expense',
        id: exp.id,
        amount: exp.amount,
        date: exp.date,
        categoryName: exp.categoryName,
        note: exp.note,
      });
    }
  };

  // Handlers for OTHER expense (isolated from monthly calculations)
  const handleOpenAddOtherExpense = (catId?: string) => {
    setEditingOtherExpense(null);
    setInitialCategoryIdForOtherExpense(catId);
    setIsOtherExpenseModalOpen(true);
  };

  const handleOpenEditOtherExpense = (expense: Expense) => {
    setEditingOtherExpense(expense);
    setInitialCategoryIdForOtherExpense(undefined);
    setIsOtherExpenseModalOpen(true);
  };

  const handleSaveOtherExpense = (data: { amount: number; categoryId: string; date: string; note?: string }) => {
    if (editingOtherExpense) {
      updateOtherExpense(editingOtherExpense.id, data);
    } else {
      addOtherExpense(data);
    }
  };

  const handleRequestDeleteOtherExpense = (id: string) => {
    const exp = otherExpenses.find((e) => e.id === id);
    if (exp) {
      setDeleteTarget({
        type: 'other_expense',
        id: exp.id,
        amount: exp.amount,
        date: exp.date,
        categoryName: exp.categoryName,
        note: exp.note,
      });
    }
  };

  // Handlers for category
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (data: { name: string; icon: string; color: string }) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
      if (categoryForHistory && categoryForHistory.id === editingCategory.id) {
        setCategoryForHistory({ ...categoryForHistory, ...data });
      }
    } else {
      createCategory(data);
    }
  };

  const handleRequestDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) {
      setDeleteTarget({
        type: 'category',
        id: cat.id,
        name: cat.name,
        usageCount: getUsageCount(cat.id),
      });
    }
  };

  // Safe confirmed deletion execution
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'expense') {
      deleteExpense(deleteTarget.id);
    } else if (deleteTarget.type === 'other_expense') {
      deleteOtherExpense(deleteTarget.id);
    } else if (deleteTarget.type === 'category') {
      deleteCategory(deleteTarget.id);
      // Reload both expense collections so reassigned expenses reflect immediately
      loadExpenses();
      loadOtherExpenses();
      if (categoryForHistory && categoryForHistory.id === deleteTarget.id) {
        setCategoryForHistory(null);
      }
    }

    setDeleteTarget(null);
  };

  const handleOpenCategoryHistory = (cat: Category) => {
    setCategoryForHistory(cat);
  };

  const handleOpenCategoryHistoryById = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) {
      setCategoryForHistory(cat);
    }
  };

  const hasActiveCategories = categories.some((c) => c.isActive);

  // Other Expenses aggregations
  const otherCategoryTotals = otherExpenseRepository.getCategoryTotals(otherExpenses);
  const totalOtherAmount = otherExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#F6F6F8] text-neutral-900 flex justify-center selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      {/* Subtle ambient glass backlight */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-white via-neutral-100/40 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-lg min-h-screen bg-[#F6F6F8]/80 border-x border-neutral-200/50 flex flex-col relative shadow-[0_10px_40px_rgba(0,0,0,0.02)] backdrop-blur-2xl">
        {/* Top Header with Light Glass */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo className="w-9 h-9 shadow-xs" />
            <div>
              <h1 className="text-base font-extrabold text-neutral-900 tracking-tight leading-tight lowercase">
                flow
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />
            <button
              onClick={() => {
                if (!hasActiveCategories) {
                  handleOpenAddCategory();
                } else if (activeTab === 'other') {
                  handleOpenAddOtherExpense();
                } else {
                  handleOpenAddExpense();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-2" />
              <span>{hasActiveCategories ? 'Add' : 'New Cat'}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={monthlySummary}
              recentExpenses={currentMonthExpenses.slice(0, 10)}
              currency={settings.currency}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
              availableMonthKeys={availableMonthKeys}
              hasCategories={hasActiveCategories}
              categories={categories}
              onAddExpense={(catId) => handleOpenAddExpense(catId)}
              onEditExpense={handleOpenEditExpense}
              onDeleteExpense={handleRequestDeleteExpense}
              onNavigateToSummary={() => setActiveTab('summary')}
              onNavigateToCategories={() => setActiveTab('categories')}
              onViewCategoryHistory={handleOpenCategoryHistoryById}
              otherExpenses={otherExpenses}
              otherTotalAmount={totalOtherAmount}
              onNavigateToOther={() => setActiveTab('other')}
              onAddOtherExpense={handleOpenAddOtherExpense}
              onEditOtherExpense={handleOpenEditOtherExpense}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryView
              summary={monthlySummary}
              monthExpenses={currentMonthExpenses}
              currency={settings.currency}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
              availableMonthKeys={availableMonthKeys}
              onEditExpense={handleOpenEditExpense}
              onDeleteExpense={handleRequestDeleteExpense}
              onViewCategoryHistory={handleOpenCategoryHistoryById}
            />
          )}

          {activeTab === 'other' && (
            <OtherExpensesView
              otherExpenses={otherExpenses}
              categories={categories}
              currency={settings.currency}
              categoryTotals={otherCategoryTotals}
              totalAmount={totalOtherAmount}
              onAddOtherExpense={(catId) => handleOpenAddOtherExpense(catId)}
              onEditOtherExpense={handleOpenEditOtherExpense}
              onDeleteOtherExpense={handleRequestDeleteOtherExpense}
              onCreateCategory={handleOpenAddCategory}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              getUsageCount={getUsageCount}
              onCreateCategory={handleOpenAddCategory}
              onEditCategory={handleOpenEditCategory}
              onToggleActive={toggleActive}
              onDeleteCategory={handleRequestDeleteCategory}
              onViewHistory={handleOpenCategoryHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSetCurrency={setCurrency}
              onResetAllData={resetAllData}
              categories={categories}
              expenses={expenses}
              otherExpenses={otherExpenses}
            />
          )}
        </main>

        {/* Bottom Navigation Bar with 5 destinations */}
        <nav className="sticky bottom-0 z-30 bg-white/80 backdrop-blur-xl border-t border-neutral-200/60 px-2 py-2 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('other')}
            className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'other'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Other</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <Tag className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Settings</span>
          </button>
        </nav>

        {/* Regular Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSave={handleSaveExpense}
          categories={categories}
          editingExpense={editingExpense}
          currency={settings.currency}
          initialCategoryId={initialCategoryIdForExpense}
          onCreateCategory={createCategory}
        />

        {/* OTHER Expense Modal (Totally isolated) */}
        <ExpenseModal
          isOpen={isOtherExpenseModalOpen}
          onClose={() => setIsOtherExpenseModalOpen(false)}
          onSave={handleSaveOtherExpense}
          categories={categories}
          editingExpense={editingOtherExpense}
          currency={settings.currency}
          initialCategoryId={initialCategoryIdForOtherExpense}
          onCreateCategory={createCategory}
          title={editingOtherExpense ? 'Edit Other Expense' : 'Add Other Expense'}
          subtitle="Recorded separately · Excluded from monthly budget"
        />

        {/* Category Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          editingCategory={editingCategory}
        />

        {/* Category Expense History Modal */}
        <CategoryHistoryModal
          isOpen={!!categoryForHistory}
          onClose={() => setCategoryForHistory(null)}
          category={categoryForHistory}
          expenses={expenses}
          currency={settings.currency}
          onAddExpenseForCategory={(catId) => handleOpenAddExpense(catId)}
          onEditExpense={handleOpenEditExpense}
          onDeleteExpense={handleRequestDeleteExpense}
        />

        {/* In-App Deletion Confirmation Modal */}
        <ConfirmDeleteModal
          target={deleteTarget}
          currency={settings.currency}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
};

export default App;
