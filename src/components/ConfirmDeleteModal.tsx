import React from 'react';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { formatDatePretty } from '@/utils/date';

export interface DeleteTarget {
  type: 'expense' | 'other_expense' | 'category' | 'other_category';
  id: string;
  name?: string;
  amount?: number;
  date?: string;
  categoryName?: string;
  note?: string;
  usageCount?: number;
}

interface ConfirmDeleteModalProps {
  target: DeleteTarget | null;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  target,
  currency,
  onConfirm,
  onCancel,
}) => {
  if (!target) return null;

  const isExpense = target.type === 'expense' || target.type === 'other_expense';
  const isCategory = target.type === 'category' || target.type === 'other_category';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/90 p-5 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-800 shrink-0">
            <Trash2 className="w-5 h-5 text-neutral-800" />
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            {target.type === 'other_category'
              ? 'Delete Other Category?'
              : isCategory
              ? 'Delete Category?'
              : target.type === 'other_expense'
              ? 'Delete Other Expense?'
              : 'Delete Expense?'}
          </h3>

          {/* Details for Expense */}
          {isExpense && (
            <div className="mt-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">
                  {target.categoryName || 'Expense'}
                </span>
                <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                  {target.amount !== undefined ? formatCurrency(target.amount, currency) : ''}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {target.date ? formatDatePretty(target.date) : ''}
                {target.note ? ` · ${target.note}` : ''}
              </div>
            </div>
          )}

          {/* Details for Category */}
          {isCategory && (
            <div className="mt-2 flex flex-col gap-2">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/60">
                <span className="text-sm font-bold text-neutral-900 block">
                  {target.name}
                </span>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {target.usageCount !== undefined && target.usageCount > 0
                    ? `Linked to ${target.usageCount} expense record${target.usageCount === 1 ? '' : 's'}`
                    : 'No linked expenses'}
                </span>
              </div>

              {target.usageCount !== undefined && target.usageCount > 0 ? (
                <div className="p-2.5 bg-neutral-100/70 rounded-xl border border-neutral-200/60 text-[11px] text-neutral-600 leading-normal flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-neutral-700 shrink-0 mt-0.5" />
                  <span>
                    This category and its <strong className="text-neutral-900 font-semibold">{target.usageCount} linked expense{target.usageCount === 1 ? '' : 's'}</strong> will be permanently removed. Unrelated categories and expenses will not be affected.
                  </span>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  This category has no expenses and will be permanently removed.
                </p>
              )}
            </div>
          )}

          {isExpense && (
            <p className="text-xs text-neutral-500 mt-2">
              This record will be permanently deleted and all totals will update immediately.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-black shadow-xs transition-all active:scale-95 cursor-pointer text-center"
          >
            {isCategory ? 'Delete Category' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
