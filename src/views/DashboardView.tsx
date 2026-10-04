import React from 'react';
import { Plus, ChevronLeft, ChevronRight, History, Layers } from 'lucide-react';
import { MonthlySummary, Expense, Category } from '@/types';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { generateMonthList } from '@/utils/date';

interface DashboardViewProps {
  summary: MonthlySummary;
  recentExpenses?: Expense[];
  currency: string;
  selectedMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  availableMonthKeys: string[];
  hasCategories: boolean;
  categories?: Category[];
  onAddExpense: (categoryId?: string) => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onNavigateToSummary: () => void;
  onNavigateToCategories: () => void;
  onViewCategoryHistory?: (categoryId: string) => void;
  otherExpenses?: Expense[];
  otherTotalAmount?: number;
  onNavigateToOther?: () => void;
  onAddOtherExpense?: (categoryId?: string) => void;
  onEditOtherExpense?: (expense: Expense) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  currency,
  selectedMonthKey,
  onSelectMonth,
  availableMonthKeys,
  hasCategories,
  categories = [],
  onAddExpense,
  onNavigateToSummary,
  onNavigateToCategories,
  onViewCategoryHistory,
  otherExpenses = [],
  otherTotalAmount = 0,
  onNavigateToOther,
  onAddOtherExpense,
  onEditOtherExpense,
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

  // Active categories with monthly spent amounts
  const activeCategories = categories.filter((c) => c.isActive);

  // Map category spent amounts for this month
  const categorySpendingList = activeCategories.map((cat) => {
    const catSummary = summary.categories.find((c) => c.categoryId === cat.id);
    const amount = catSummary ? catSummary.totalAmount : 0;
    const percentage =
      summary.totalSpent > 0 ? Math.round((amount / summary.totalSpent) * 100) : 0;
    const count = catSummary ? catSummary.transactionCount : 0;

    return {
      category: cat,
      amount,
      percentage,
      count,
    };
  });

  // Also include any category from summary that has expenses this month but isn't in activeCategories
  summary.categories.forEach((sumCat) => {
    if (!activeCategories.some((c) => c.id === sumCat.categoryId)) {
      categorySpendingList.push({
        category: {
          id: sumCat.categoryId,
          name: sumCat.categoryName,
          icon: sumCat.categoryIcon,
          color: sumCat.categoryColor,
          isActive: false,
          createdAt: '',
        },
        amount: sumCat.totalAmount,
        percentage: sumCat.percentage,
        count: sumCat.transactionCount,
      });
    }
  });

  // Sort by highest amount spent first, then alphabetical
  categorySpendingList.sort((a, b) => {
    if (b.amount !== a.amount) return b.amount - a.amount;
    return a.category.name.localeCompare(b.category.name);
  });

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Month Navigation Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            disabled={currentIndex >= months.length - 1}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-neutral-700 tracking-tight">
            {summary.monthLabel}
          </span>

          <button
            onClick={handleNextMonth}
            disabled={currentIndex <= 0}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onNavigateToSummary}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          View Activity →
        </button>
      </div>

      {/* Hero: Total Spending Glass Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
            Total Spending
          </span>
          <span className="text-xs text-neutral-400 tabular-nums">
            {summary.transactionCount} {summary.transactionCount === 1 ? 'expense' : 'expenses'}
          </span>
        </div>

        <div className="mt-2 flex items-baseline">
          <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight font-mono tabular-nums">
            {formatCurrency(summary.totalSpent, currency)}
          </span>
        </div>

        {/* Primary Add Expense CTA */}
        <button
          onClick={() => onAddExpense()}
          className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 active:scale-[0.99] text-white text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-2" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense Categories List */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Categories
          </span>
          <button
            onClick={onNavigateToCategories}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Manage
          </button>
        </div>

        {!hasCategories ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
            <p className="text-xs text-neutral-500">
              No categories yet. Create your first category to start tracking.
            </p>
            <button
              onClick={onNavigateToCategories}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Create Category
            </button>
          </div>
        ) : categorySpendingList.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-neutral-400">All categories are currently deactivated.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-100/80">
            {categorySpendingList.map(({ category, amount, percentage, count }) => (
              <div
                key={category.id}
                onClick={() => onViewCategoryHistory && onViewCategoryHistory(category.id)}
                className="py-3 px-1 -mx-1 rounded-2xl hover:bg-white/60 transition-all cursor-pointer flex flex-col gap-2 group"
                title="View Category History"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Category Icon & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-800 shrink-0">
                      <CategoryIcon name={category.icon} size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-neutral-900 block truncate group-hover:text-neutral-700 transition-colors">
                        {category.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 tabular-nums">
                        {count > 0
                          ? `${count} ${count === 1 ? 'entry' : 'entries'} · ${percentage}%`
                          : 'No expenses yet'}
                      </span>
                    </div>
                  </div>

                  {/* Amount Spent & Quick Add Action */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                      {formatCurrency(amount, currency)}
                    </span>

                    {/* Quick Add Button for this category */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddExpense(category.id);
                      }}
                      className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title={`Quick add expense in ${category.name}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-2" />
                    </button>

                    {/* Category History shortcut */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewCategoryHistory) onViewCategoryHistory(category.id);
                      }}
                      className="w-8 h-8 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition-all cursor-pointer"
                      title="View history"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Minimal Grey Progress Bar */}
                {amount > 0 && (
                  <div className="w-full h-1 rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-800 transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(3, percentage))}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other Expenses Card (Kept separate from regular monthly expenses) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-700" />
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Other Expenses
            </span>
            <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
              Non-Monthly
            </span>
          </div>
          {onNavigateToOther && (
            <button
              onClick={onNavigateToOther}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              View All →
            </button>
          )}
        </div>

        {otherExpenses.length === 0 ? (
          <div className="py-4 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-neutral-400">
              No other expenses yet
            </p>
            {onAddOtherExpense && (
              <button
                onClick={() => onAddOtherExpense()}
                className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
              >
                + Add Other Expense
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-extrabold text-neutral-900 tracking-tight font-mono tabular-nums">
                  {formatCurrency(otherTotalAmount, currency)}
                </span>
                <span className="text-xs text-neutral-400 ml-2">
                  ({otherExpenses.length} {otherExpenses.length === 1 ? 'entry' : 'entries'})
                </span>
              </div>
              {onAddOtherExpense && (
                <button
                  onClick={() => onAddOtherExpense()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-2" />
                  <span>Add</span>
                </button>
              )}
            </div>

            {/* List top/recent other expenses */}
            <div className="flex flex-col divide-y divide-neutral-100/80 pt-1">
              {otherExpenses.slice(0, 3).map((expense) => (
                <div
                  key={expense.id}
                  onClick={() => {
                    if (onEditOtherExpense) {
                      onEditOtherExpense(expense);
                    } else if (onNavigateToOther) {
                      onNavigateToOther();
                    }
                  }}
                  className="py-2.5 px-1 -mx-1 rounded-xl hover:bg-white/60 transition-all cursor-pointer flex items-center justify-between group"
                  title="Click to edit other expense"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-800 shrink-0">
                      <CategoryIcon name={expense.categoryIcon || 'Layers'} size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-neutral-900 block truncate group-hover:text-neutral-700">
                        {expense.categoryName || 'Other Expense'}
                      </span>
                      <span className="text-[11px] text-neutral-400 block truncate">
                        {expense.note ? expense.note : expense.date}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-xs font-bold font-mono text-neutral-900 tabular-nums">
                      {formatCurrency(expense.amount, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
