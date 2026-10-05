import React from 'react';
import { Plus, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { MonthlySummary } from '@/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { generateMonthList } from '@/utils/date';

interface DashboardViewProps {
  summary: MonthlySummary;
  currency: string;
  selectedMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  availableMonthKeys: string[];
  onAddExpense: (categoryId?: string) => void;
  onViewCategoryHistory?: (categoryId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  currency,
  selectedMonthKey,
  onSelectMonth,
  availableMonthKeys,
  onAddExpense,
  onViewCategoryHistory,
}) => {
  // Navigation for months
  const months = generateMonthList(availableMonthKeys);
  const currentIndex = months.findIndex((m) => m.key === selectedMonthKey);

  const handlePrevMonth = () => {
    if (currentIndex < months.length - 1) {
      onSelectMonth(months[currentIndex + 1].key);
    }
  };

  const handleNextMonth = () => {
    if (currentIndex > 0) {
      onSelectMonth(months[currentIndex - 1].key);
    }
  };

  // Only categories that have expenses in this selected month
  const activeCategories = summary.categories
    .filter((c) => c.totalAmount > 0)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-24">
      {/* Monthly Navigation Header: October 2026 ← → */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
            {summary.monthLabel}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              disabled={currentIndex >= months.length - 1}
              className="p-1.5 rounded-xl bg-white border border-neutral-200/60 text-neutral-600 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-600 transition-colors cursor-pointer shadow-2xs"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNextMonth}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-xl bg-white border border-neutral-200/60 text-neutral-600 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-600 transition-colors cursor-pointer shadow-2xs"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <span className="text-xs text-neutral-500 font-medium">
          {summary.transactionCount} {summary.transactionCount === 1 ? 'expense' : 'expenses'}
        </span>
      </div>

      {/* Hero: Total Spending Glass Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Total Spending
          </span>
          <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200/60">
            {summary.monthLabel}
          </span>
        </div>

        <div className="mt-3 flex items-baseline">
          <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight font-mono tabular-nums">
            {formatCurrency(summary.totalSpent, currency)}
          </span>
        </div>

        {/* Primary Add Expense CTA */}
        <button
          onClick={() => onAddExpense()}
          className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-2" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Category Spending Section - Shows ONLY categories with expenses */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Category Spending
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">
            {activeCategories.length} {activeCategories.length === 1 ? 'active category' : 'active categories'}
          </span>
        </div>

        {activeCategories.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2.5">
            <p className="text-xs text-neutral-400">
              No expenses recorded for this month yet.
            </p>
            <button
              onClick={() => onAddExpense()}
              className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer min-h-[44px] flex items-center"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {activeCategories.map((item) => (
              <div
                key={item.categoryId}
                onClick={() => onViewCategoryHistory && onViewCategoryHistory(item.categoryId)}
                className="p-3 sm:p-3.5 rounded-2xl bg-neutral-50/70 hover:bg-white border border-neutral-200/50 hover:border-neutral-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-2.5 group"
                title="View detailed expense history"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Category Icon & Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200/60 flex items-center justify-center text-neutral-800 shrink-0 shadow-2xs">
                      <CategoryIcon name={item.categoryIcon || 'ShoppingCart'} size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-xs sm:text-sm font-semibold text-neutral-900 block truncate group-hover:text-neutral-700 transition-colors">
                        {item.categoryName}
                      </span>
                      <span className="text-[11px] text-neutral-400 tabular-nums block truncate">
                        {item.transactionCount} {item.transactionCount === 1 ? 'entry' : 'entries'}
                        {item.percentage > 0 ? ` · ${item.percentage}%` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Amount Spent & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-neutral-900 tabular-nums">
                      {formatCurrency(item.totalAmount, currency)}
                    </span>

                    {/* Quick Add Button for this category */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddExpense(item.categoryId);
                      }}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white hover:bg-neutral-900 hover:text-white text-neutral-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-neutral-200/50 shadow-2xs"
                      title={`Quick add expense in ${item.categoryName}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-2" />
                    </button>

                    {/* View History icon */}
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-neutral-400 group-hover:text-neutral-900 flex items-center justify-center transition-colors"
                      title="View history"
                    >
                      <History className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Minimal Grey Progress Bar */}
                {item.percentage > 0 && (
                  <div className="w-full h-1 rounded-full bg-neutral-200/70 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-800 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
