import React, { useState, useEffect } from 'react';
import {
  Menu,
  LayoutDashboard,
  Tag,
  CheckSquare,
  Settings as SettingsIcon,
  Layers,
  X,
} from 'lucide-react';
import { runInitialMigrations } from '@/database/migrations';
import { useCategoryStore } from '@/features/categories/categoryStore';
import { useExpenseStore } from '@/features/expenses/expenseStore';
import { useOtherExpenseStore } from '@/features/otherExpenses/otherExpenseStore';
import { useOtherCategoryStore } from '@/features/otherExpenses/otherCategoryStore';
import { useTodoStore } from '@/features/todos/todoStore';
import { useSettingsStore } from '@/features/settings/settingsStore';
import { calculateMonthlySummary } from '@/utils/calculations';
import { expenseRepository } from '@/database/expenseRepository';
import { categoryRepository } from '@/database/categoryRepository';
import { otherExpenseRepository } from '@/database/otherExpenseRepository';
import { otherCategoryRepository } from '@/database/otherCategoryRepository';
import { Expense, Category } from '@/types';

// Views
import { DashboardView } from '@/views/DashboardView';
import { CategoriesView } from '@/views/CategoriesView';
import { OtherExpensesView } from '@/views/OtherExpensesView';
import { TodoView } from '@/views/TodoView';
import { SettingsView } from '@/views/SettingsView';

// Modals
import { ExpenseModal } from '@/components/ExpenseModal';
import { OtherExpenseModal } from '@/components/OtherExpenseModal';
import { CategoryModal } from '@/components/CategoryModal';
import { CategoryHistoryModal } from '@/components/CategoryHistoryModal';
import { ConfirmDeleteModal, DeleteTarget } from '@/components/ConfirmDeleteModal';
import { AppLogo } from '@/components/AppLogo';
import { PWAInstallButton } from '@/components/PWAInstallButton';

export const App: React.FC = () => {
  // Main view state controlled purely via Hamburger menu (No visible navigation buttons)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'todo' | 'other_expenses' | 'settings'>('dashboard');

  // Hamburger Menu Drawer state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Stores for Personal Expenses & Categories
  const { categories, loadCategories, createCategory, updateCategory, toggleActive, deleteCategory, getUsageCount } =
    useCategoryStore();
  const { expenses, selectedMonthKey, loadExpenses, setSelectedMonthKey, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();

  // Stores for Other Expenses & Other Categories (Completely Independent System)
  const { otherCategories, loadOtherCategories, createOtherCategory, updateOtherCategory, deleteOtherCategory, getUsageCount: getOtherUsageCount } =
    useOtherCategoryStore();
  const { otherExpenses, loadOtherExpenses, addOtherExpense, updateOtherExpense, deleteOtherExpense } =
    useOtherExpenseStore();

  // Stores for To-Do & Settings
  const { todos, loadTodos, addTodo, updateTodo, togglePin, toggleItemCheck, deleteTodo } =
    useTodoStore();
  const { settings, setCurrency, resetAllData } = useSettingsStore();

  // Personal Expense Modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [initialCategoryIdForExpense, setInitialCategoryIdForExpense] = useState<string | undefined>(undefined);

  // Other Expense Modal state
  const [isOtherExpenseModalOpen, setIsOtherExpenseModalOpen] = useState(false);
  const [editingOtherExpense, setEditingOtherExpense] = useState<Expense | null>(null);
  const [initialCategoryIdForOtherExpense, setInitialCategoryIdForOtherExpense] = useState<string | undefined>(undefined);

  // Other Category Modal state
  const [isOtherCategoryModalOpen, setIsOtherCategoryModalOpen] = useState(false);
  const [editingOtherCategory, setEditingOtherCategory] = useState<Category | null>(null);

  // Sub-view modal state for Personal Category Management (accessible via Settings)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

  // Personal Category modal state for creating/editing personal categories
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
    loadOtherCategories();
    loadExpenses();
    loadOtherExpenses();
    loadTodos();
  }, []);

  // Compute live aggregations for current selected month (Only uses personal expenses!)
  const monthlySummary = calculateMonthlySummary(selectedMonthKey, expenses, categories);
  const availableMonthKeys = expenseRepository.getAvailableMonthKeys();

  // Compute live aggregations for Other Expenses
  const otherCategoryTotals = otherExpenseRepository.getCategoryTotals(otherExpenses);
  const otherTotalAmount = otherExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Handlers for Personal Expenses
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

  const handleSavePersonalExpense = (data: { amount: number; categoryId: string; date: string; note?: string }) => {
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

  // Handlers for Other Expenses
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

  const handleSaveOtherExpense = (data: {
    amount: number;
    name?: string;
    categoryId?: string;
    date: string;
    note?: string;
  }) => {
    if (editingOtherExpense) {
      updateOtherExpense(editingOtherExpense.id, data);
    } else {
      addOtherExpense(data);
    }
  };

  const handleRequestDeleteOtherExpense = (id: string) => {
    const exp = otherExpenses.find((e) => e.id === id);
    if (exp) {
      const displayName =
        exp.name && exp.categoryName && exp.name.trim().toLowerCase() !== exp.categoryName.trim().toLowerCase()
          ? `${exp.name} (${exp.categoryName})`
          : exp.categoryName || exp.name || 'Other Expense';

      setDeleteTarget({
        type: 'other_expense',
        id: exp.id,
        amount: exp.amount,
        date: exp.date,
        categoryName: displayName,
        note: exp.note,
      });
    }
  };

  // Handlers for Personal Categories
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
    const cleanId = String(id || '').trim();
    const cat = categories.find((c) => String(c.id).trim() === cleanId) || categoryRepository.getById(cleanId);
    if (cat) {
      setDeleteTarget({
        type: 'category',
        id: cat.id,
        name: cat.name,
        usageCount: getUsageCount(cat.id),
      });
    } else {
      deleteCategory(cleanId);
      loadCategories();
      loadExpenses();
    }
  };

  // Handlers for Other Categories
  const handleOpenAddOtherCategory = () => {
    setEditingOtherCategory(null);
    setIsOtherCategoryModalOpen(true);
  };

  const handleOpenEditOtherCategory = (cat: Category) => {
    setEditingOtherCategory(cat);
    setIsOtherCategoryModalOpen(true);
  };

  const handleSaveOtherCategory = (data: { name: string; icon: string; color: string }) => {
    if (editingOtherCategory) {
      updateOtherCategory(editingOtherCategory.id, data);
    } else {
      createOtherCategory(data);
    }
  };

  const handleRequestDeleteOtherCategory = (id: string) => {
    const cleanId = String(id || '').trim();
    const cat = otherCategories.find((c) => String(c.id).trim() === cleanId) || otherCategoryRepository.getById(cleanId);
    if (cat) {
      setDeleteTarget({
        type: 'other_category',
        id: cat.id,
        name: cat.name,
        usageCount: getOtherUsageCount(cat.id),
      });
    } else {
      deleteOtherCategory(cleanId);
      loadOtherCategories();
      loadOtherExpenses();
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
      loadCategories();
      loadExpenses();
      if (categoryForHistory && String(categoryForHistory.id).trim() === String(deleteTarget.id).trim()) {
        setCategoryForHistory(null);
      }
      if (editingCategory && String(editingCategory.id).trim() === String(deleteTarget.id).trim()) {
        setEditingCategory(null);
        setIsCategoryModalOpen(false);
      }
    } else if (deleteTarget.type === 'other_category') {
      deleteOtherCategory(deleteTarget.id);
      loadOtherCategories();
      loadOtherExpenses();
      if (editingOtherCategory && String(editingOtherCategory.id).trim() === String(deleteTarget.id).trim()) {
        setEditingOtherCategory(null);
        setIsOtherCategoryModalOpen(false);
      }
    }

    setDeleteTarget(null);
  };

  const handleOpenCategoryHistoryById = (categoryId: string) => {
    const cleanId = String(categoryId || '').trim();
    const cat = categories.find((c) => String(c.id).trim() === cleanId);
    if (cat) {
      setCategoryForHistory(cat);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8] text-neutral-900 flex justify-center selection:bg-neutral-900 selection:text-white relative overflow-x-hidden">
      {/* Subtle ambient glass backlight */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-white via-neutral-100/40 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Main Container - Responsive across Mobile, Tablet, Laptop, and Desktop */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl min-h-screen bg-[#F6F6F8] border-x border-neutral-200/50 flex flex-col relative shadow-[0_10px_40px_rgba(0,0,0,0.02)] mx-auto">
        {/* Top Header with Light Glass & Clean Three-Line Hamburger Menu (☰) */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            title="Flow - Home"
          >
            <AppLogo className="w-9 h-9 shadow-xs group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="text-base font-extrabold text-neutral-900 tracking-tight leading-tight lowercase">
                flow
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* Clean Three-Line Hamburger Menu Button (☰) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-neutral-100 border border-neutral-200/70 text-neutral-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              aria-label="Open menu"
              title="Menu"
            >
              <Menu className="w-5 h-5 stroke-2" />
            </button>
          </div>
        </header>

        {/* Hamburger Menu Drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-full max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-2xl h-full shadow-2xl border-l border-neutral-200/70 flex flex-col z-10 animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
                <div
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 cursor-pointer"
                >
                  <AppLogo className="w-8 h-8 shadow-xs" />
                  <span className="text-base font-extrabold text-neutral-900 tracking-tight lowercase">
                    flow
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Navigation Links */}
              <div className="p-4 flex flex-col gap-1.5 flex-1 overflow-y-auto">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-neutral-900 text-white font-bold shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm">Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('todo');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    activeTab === 'todo'
                      ? 'bg-neutral-900 text-white font-bold shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5" />
                    <span className="text-sm">To-Do</span>
                  </div>
                  {todos.length > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        activeTab === 'todo'
                          ? 'bg-neutral-800 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {todos.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('other_expenses');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    activeTab === 'other_expenses'
                      ? 'bg-neutral-900 text-white font-bold shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5" />
                    <span className="text-sm">Other Expenses</span>
                  </div>
                  {otherExpenses.length > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        activeTab === 'other_expenses'
                          ? 'bg-neutral-800 text-white'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {otherExpenses.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-neutral-900 text-white font-bold shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="w-5 h-5" />
                    <span className="text-sm">Settings</span>
                  </div>
                </button>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-neutral-100/80 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-400">
                <span>flow · minimal spending</span>
                <span className="font-mono">{settings.currency}</span>
              </div>
            </div>
          </div>
        )}

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

          {activeTab === 'other_expenses' && (
            <OtherExpensesView
              otherExpenses={otherExpenses}
              otherCategories={otherCategories}
              currency={settings.currency}
              categoryTotals={otherCategoryTotals}
              totalAmount={otherTotalAmount}
              onAddOtherExpense={handleOpenAddOtherExpense}
              onEditOtherExpense={handleOpenEditOtherExpense}
              onDeleteOtherExpense={handleRequestDeleteOtherExpense}
              onCreateOtherCategory={handleOpenAddOtherCategory}
              onEditOtherCategory={handleOpenEditOtherCategory}
              onDeleteOtherCategory={handleRequestDeleteOtherCategory}
              onBackToDashboard={() => setActiveTab('dashboard')}
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
            />
          )}
        </main>

        {/* Manage Categories Sub-View Overlay Modal (Personal Categories) */}
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
                  onViewHistory={(cat) => handleOpenCategoryHistoryById(cat.id)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Personal Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
            setInitialCategoryIdForExpense(undefined);
          }}
          onSavePersonal={handleSavePersonalExpense}
          categories={categories}
          editingExpense={editingExpense}
          currency={settings.currency}
          initialCategoryId={initialCategoryIdForExpense}
          onCreateCategory={createCategory}
        />

        {/* Other Expense Modal */}
        <OtherExpenseModal
          isOpen={isOtherExpenseModalOpen}
          onClose={() => {
            setIsOtherExpenseModalOpen(false);
            setEditingOtherExpense(null);
            setInitialCategoryIdForOtherExpense(undefined);
          }}
          onSave={handleSaveOtherExpense}
          otherCategories={otherCategories}
          editingExpense={editingOtherExpense}
          currency={settings.currency}
          initialCategoryId={initialCategoryIdForOtherExpense}
          onCreateCategory={createOtherCategory}
        />

        {/* Personal Category Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          editingCategory={editingCategory}
          onDelete={handleRequestDeleteCategory}
        />

        {/* Other Category Modal */}
        <CategoryModal
          isOpen={isOtherCategoryModalOpen}
          onClose={() => {
            setIsOtherCategoryModalOpen(false);
            setEditingOtherCategory(null);
          }}
          onSave={handleSaveOtherCategory}
          editingCategory={editingOtherCategory}
          onDelete={handleRequestDeleteOtherCategory}
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
          onDeleteCategory={handleRequestDeleteCategory}
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
