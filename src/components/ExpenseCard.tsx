import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { formatDatePretty } from '@/utils/date';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseCardProps {
  expense: Expense;
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  currency,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="group bg-[#FFFFFF] hover:bg-[#FAFAF8] rounded-2xl p-3.5 border border-[#E5E5E2] hover:border-[#D5D5D0] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all flex items-center justify-between gap-3">
      {/* Category Icon & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#1A1A1A]">
          <CategoryIcon name={expense.categoryIcon || 'ShoppingCart'} size={16} />
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate">
              {expense.categoryName || 'General'}
            </h4>
            <span className="text-[11px] font-normal text-[#8A8A8A]">
              · {formatDatePretty(expense.date)}
            </span>
          </div>
          {expense.note && (
            <p className="text-xs text-[#8A8A8A] truncate mt-0.5 font-normal">
              {expense.note}
            </p>
          )}
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-sm font-bold font-mono text-[#1A1A1A] tracking-tight tabular-nums">
          {formatCurrency(expense.amount, currency)}
        </span>

        <div className="flex items-center gap-0.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF] transition-colors cursor-pointer"
            title="Edit Expense"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF] transition-colors cursor-pointer"
            title="Delete Expense"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
