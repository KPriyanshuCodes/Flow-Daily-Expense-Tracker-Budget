import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Tag,
  CheckSquare,
  Layers,
  Settings as SettingsIcon,
  Plus,
  X,
} from 'lucide-react';
import { runInitialMigrations } from '@/database/migrations';
import { useCategoryStore } from '@/features/categories/categoryStore';
import { useExpenseStore } from '@/features/expenses/expenseStore';
import { useOtherExpenseStore } from '@/features/otherExpenses/otherExpenseStore';
import { useTodoStore } from '@/features/todos/todoStore';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { calculateMonthlySummary } from '@/utils/calculations';
import { expenseRepository } from '@/database/expenseRepository';
import { otherExpenseRepository } from '@/database/otherExpenseRepository';
import { Expense, Category } from '@/types';

// Views
import { DashboardView } from '@/views/DashboardView';
import { CategoriesView } from '@/views/CategoriesView';
import { TodoView } from '@/views/TodoView';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'todo' | 'settings'>('dashboard');

  // Stores
  const { categories, loadCategories, createCategory, updateCategory, toggleActive, deleteCategory, getUsageCount } =
    useCategoryStore();
  const { expenses, selectedMonthKey, loadExpenses, setSelectedMonthKey, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();
  const { otherExpenses, loadOtherExpenses, addOtherExpense, updateOtherExpense, deleteOtherExpense } =
    useOtherExpenseStore();
  const { todos, loadTodos, addTodo, updateTodo, togglePin, toggleItemCheck, deleteTodo } =
    useTodoStore();
  const { settings, setCurrency, resetAllData } = useSettingsStore();

  // Modals state for regular expenses
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialCategoryIdForExpense, setInitialCategoryIdForExpense] = useState<string | undefined>(undefined);

  // Modals state for OTHER expenses (completely isolated)
  const [isOtherExpenseModalOpen, setIsOtherExpenseModalOpen] = useState(false);
  const [editingOtherExpense, setEditingOtherExpense] = useState<Expense | null>(null);
  const [initialCategoryIdForOtherExpense, setInitialCategoryIdForOtherExpense] = useState<string | undefined>(undefined);

  // Sub-view modal states for Categories and Other Expenses
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isOtherExpensesOpen, setIsOtherExpensesOpen] = useState(false);

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
    loadTodos();
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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-white via-neutral-100/40 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Main Container - Responsive across Mobile, Tablet, Laptop, and Desktop */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl min-h-screen bg-[#F6F6F8]/80 border-x border-neutral-200/50 flex flex-col relative shadow-[0_10px_40px_rgba(0,0,0,0.02)] backdrop-blur-2xl mx-auto">
        {/* Top Header with Light Glass */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between">
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
              onClick={() => handleOpenAddExpense()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5 stroke-2" />
              <span>Add</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={monthlySummary}
              currency={settings.currency}
              selectedMonthKey={selectedMonthKey}
              onSelectMonth={setSelectedMonthKey}
              availableMonthKeys={availableMonthKeys}
              onAddExpense={(catId) => handleOpenAddExpense(catId)}
              onViewCategoryHistory={handleOpenCategoryHistoryById}
            />
          )}

          {activeTab === 'todo' && (
            <TodoView
              todos={todos}
              onAddTodo={addTodo}
              onUpdateTodo={updateTodo}
              onTogglePin={togglePin}
              onToggleCheck={toggleItemCheck}
              onDeleteTodo={deleteTodo}
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
              todos={todos}
              onManageCategories={() => setIsManageCategoriesOpen(true)}
              onOpenOtherExpenses={() => setIsOtherExpensesOpen(true)}
            />
          )}
        </main>

        {/* Main Navigation Bar: Dashboard | Add Expense | To-Do | Settings */}
        <nav className="sticky bottom-0 z-30 bg-white/85 backdrop-blur-xl border-t border-neutral-200/60 px-3 sm:px-8 py-2 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] justify-center ${
              activeTab === 'dashboard'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs tracking-tight">Dashboard</span>
          </button>

          <button
            onClick={() => handleOpenAddExpense()}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer group active:scale-95 min-h-[48px] justify-center"
            title="Add Expense"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-900 group-hover:bg-neutral-800 text-white flex items-center justify-center shadow-xs transition-colors">
              <Plus className="w-4 h-4 stroke-2" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-neutral-900 tracking-tight">
              Add Expense
            </span>
          </button>

          <button
            onClick={() => setActiveTab('todo')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] justify-center ${
              activeTab === 'todo'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs tracking-tight">To-Do</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-h-[48px] justify-center ${
              activeTab === 'settings'
                ? 'text-neutral-900 font-bold scale-105'
                : 'text-neutral-400 hover:text-neutral-600 font-medium'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] sm:text-xs tracking-tight">Settings</span>
          </button>
        </nav>

        {/* Other Expenses Sub-View Overlay Modal */}
        {isOtherExpensesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/30 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md sm:max-w-2xl md:max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(28,25,23,0.12)] overflow-hidden border border-white/95 flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">Other Expenses</h2>
                    <p className="text-[11px] text-neutral-500 font-normal">
                      Separate transactions outside monthly budget
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOtherExpensesOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 sm:p-6 flex-1">
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
              </div>
            </div>
          </div>
        )}

        {/* Manage Categories Sub-View Overlay Modal */}
        {isManageCategoriesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/30 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md sm:max-w-2xl md:max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(28,25,23,0.12)] overflow-hidden border border-white/95 flex flex-col max-h-[92vh]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-white/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">Manage Categories</h2>
                    <p className="text-[11px] text-neutral-500 font-normal">
                      Customize icons, names, and active status
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsManageCategoriesOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-4 sm:p-6 flex-1">
                <CategoriesView
                  categories={categories}
                  getUsageCount={getUsageCount}
                  onCreateCategory={handleOpenAddCategory}
                  onEditCategory={handleOpenEditCategory}
                  onToggleActive={toggleActive}
                  onDeleteCategory={handleRequestDeleteCategory}
                  onViewHistory={handleOpenCategoryHistory}
                />
              </div>
            </div>
          </div>
        )}

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
