import React from 'react';
import { X, ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import { Category, Expense } from '@/types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { formatDateWithMonthDay } from '@/utils/date';

interface CategoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  expenses: Expense[];
  currency: string;
  onAddExpenseForCategory?: (categoryId: string) => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const CategoryHistoryModal: React.FC<CategoryHistoryModalProps> = ({
  isOpen,
  onClose,
  category,
  expenses,
  currency,
  onAddExpenseForCategory,
  onEditExpense,
  onDeleteExpense,
  onDeleteCategory,
}) => {
  if (!isOpen || !category) return null;

  // Filter and sort expenses for this category by date descending
  const categoryExpenses = expenses
    .filter((e) => e.categoryId === category.id)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

  const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-[#FFFFFF] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-[#EAEAEA] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA] bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 -ml-1 rounded-xl text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs bg-[#FFFFFF] border border-[#E5E5E2] text-[#1A1A1A]"
            >
              <CategoryIcon name={category.icon} size={20} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#1A1A1A] leading-tight">
                  {category.name}
                </h2>
                {!category.isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F0F0ED] text-[#8A8A8A]">
                    Deactivated
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8A8A] font-medium">Expense History</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onDeleteCategory && (
              <button
                onClick={() => {
                  onDeleteCategory(category.id);
                  onClose();
                }}
                className="p-2 rounded-xl text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
                title="Delete this category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Total Spent Banner */}
        <div className="p-5 bg-[#FAFAF8] border-b border-[#EAEAEA]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">
              Total Spent in {category.name}
            </span>
            <span className="text-xs font-semibold text-[#8A8A8A] bg-[#FFFFFF] px-2.5 py-0.5 rounded-full border border-[#E5E5E2] shadow-2xs">
              {categoryExpenses.length} {categoryExpenses.length === 1 ? 'expense' : 'expenses'}
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#1A1A1A] tracking-tight font-mono">
            {formatCurrency(totalSpent, currency)}
          </div>
        </div>

        {/* Action: Add Expense for this category */}
        {category.isActive && onAddExpenseForCategory && (
          <div className="px-5 py-3 border-b border-[#EAEAEA] bg-[#FFFFFF] flex items-center justify-between">
            <span className="text-xs text-[#8A8A8A] font-medium">Log a new purchase:</span>
            <button
              onClick={() => {
                onClose();
                onAddExpenseForCategory(category.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-2" />
              Add Expense
            </button>
          </div>
        )}

        {/* Expenses List */}
        <div className="overflow-y-auto p-4 flex flex-col gap-2.5 flex-1">
          {categoryExpenses.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8A8A8A]">
              No expenses recorded under this category yet.
            </div>
          ) : (
            categoryExpenses.map((expense) => (
              <div
                key={expense.id}
                className="group bg-[#FAFAF8] hover:bg-[#F2F2EF] rounded-2xl p-3.5 border border-[#E5E5E2] shadow-2xs transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {formatDateWithMonthDay(expense.date)}
                    </span>
                    {expense.note && (
                      <span className="text-xs text-[#8A8A8A] truncate">• {expense.note}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm font-extrabold text-[#1A1A1A] font-mono">
                    {formatCurrency(expense.amount, currency)}
                  </span>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEditExpense && (
                      <button
                        onClick={() => {
                          onClose();
                          onEditExpense(expense);
                        }}
                        className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteExpense && (
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
