import React from 'react';
import { Plus, ChevronLeft, ChevronRight, History } from 'lucide-react';
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

  // Build unified category map that aggregates monthly expenses and other expenses
  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      icon: string;
      color: string;
      monthlyAmount: number;
      monthlyCount: number;
      otherAmount: number;
      otherCount: number;
    }
  >();

  // Initialize with known categories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      monthlyAmount: 0,
      monthlyCount: 0,
      otherAmount: 0,
      otherCount: 0,
    });
  });

  // Populate monthly expenses from summary
  summary.categories.forEach((sumCat) => {
    const existing = categoryMap.get(sumCat.categoryId);
    if (existing) {
      existing.monthlyAmount = sumCat.totalAmount;
      existing.monthlyCount = sumCat.transactionCount;
    } else {
      categoryMap.set(sumCat.categoryId, {
        id: sumCat.categoryId,
        name: sumCat.categoryName,
        icon: sumCat.categoryIcon,
        color: sumCat.categoryColor,
        monthlyAmount: sumCat.totalAmount,
        monthlyCount: sumCat.transactionCount,
        otherAmount: 0,
        otherCount: 0,
      });
    }
  });

  // Populate Other Expenses into their respective categories
  otherExpenses.forEach((oe) => {
    const catId = oe.categoryId || 'other';
    const existing = categoryMap.get(catId);
    if (existing) {
      existing.otherAmount += oe.amount;
      existing.otherCount += 1;
    } else {
      categoryMap.set(catId, {
        id: catId,
        name: oe.categoryName || 'Other Expenses',
        icon: oe.categoryIcon || 'Layers',
        color: oe.categoryColor || '#737373',
        monthlyAmount: 0,
        monthlyCount: 0,
        otherAmount: oe.amount,
        otherCount: 1,
      });
    }
  });

  // Filter to show ONLY categories that currently have at least one expense entry
  // Hide categories that have zero expenses
  const activeCategorySpendingList = Array.from(categoryMap.values())
    .map((item) => {
      const totalAmount = item.monthlyAmount + item.otherAmount;
      const totalCount = item.monthlyCount + item.otherCount;
      const percentage =
        summary.totalSpent > 0 && item.monthlyAmount > 0
          ? Math.round((item.monthlyAmount / summary.totalSpent) * 100)
          : 0;

      return {
        ...item,
        totalAmount,
        totalCount,
        percentage,
      };
    })
    .filter((item) => item.totalCount > 0);

  // Sort by highest total amount first, then alphabetical
  activeCategorySpendingList.sort((a, b) => {
    if (b.totalAmount !== a.totalAmount) return b.totalAmount - a.totalAmount;
    return a.name.localeCompare(b.name);
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

      {/* Expense Categories List (Only displays categories with at least 1 expense) */}
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

        {!hasCategories && activeCategorySpendingList.length === 0 ? (
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
        ) : activeCategorySpendingList.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2.5">
            <p className="text-xs text-neutral-400">
              No expenses recorded for this month yet.
            </p>
            <button
              onClick={() => onAddExpense()}
              className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
            >
              + Add First Expense
            </button>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-100/80">
            {activeCategorySpendingList.map((item) => (
              <div
                key={item.id}
                onClick={() => onViewCategoryHistory && onViewCategoryHistory(item.id)}
                className="py-3 px-1 -mx-1 rounded-2xl hover:bg-white/60 transition-all cursor-pointer flex flex-col gap-2 group"
                title="View Category History"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Category Icon & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center text-neutral-800 shrink-0">
                      <CategoryIcon name={item.icon || 'ShoppingCart'} size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-neutral-900 block truncate group-hover:text-neutral-700 transition-colors">
                          {item.name}
                        </span>
                        {item.otherCount > 0 && item.monthlyCount === 0 && (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md border border-neutral-200/60">
                            Other
                          </span>
                        )}
                      </div>

                      {/* Subtitle / breakdown */}
                      <span className="text-[11px] text-neutral-400 tabular-nums block truncate">
                        {item.monthlyCount > 0 && item.otherCount > 0
                          ? `${item.monthlyCount} monthly (${formatCurrency(item.monthlyAmount, currency)}) · ${item.otherCount} other (${formatCurrency(item.otherAmount, currency)})`
                          : item.otherCount > 0
                          ? `${item.otherCount} ${item.otherCount === 1 ? 'other expense' : 'other expenses'}`
                          : `${item.monthlyCount} ${item.monthlyCount === 1 ? 'entry' : 'entries'}${item.percentage > 0 ? ` · ${item.percentage}%` : ''}`}
                      </span>
                    </div>
                  </div>

                  {/* Amount Spent & Quick Add Action */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-sm font-bold font-mono text-neutral-900 tabular-nums">
                      {formatCurrency(item.totalAmount, currency)}
                    </span>

                    {/* Quick Add Button for this category */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddExpense(item.id);
                      }}
                      className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-700 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title={`Quick add expense in ${item.name}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-2" />
                    </button>

                    {/* Category History shortcut */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewCategoryHistory) onViewCategoryHistory(item.id);
                      }}
                      className="w-8 h-8 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition-all cursor-pointer"
                      title="View history"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Minimal Grey Progress Bar */}
                {item.percentage > 0 && (
                  <div className="w-full h-1 rounded-full bg-neutral-100 overflow-hidden">
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

