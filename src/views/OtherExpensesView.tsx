import React, { useState } from 'react';
import { Plus, Search, Layers, Pencil, Trash2, ArrowLeft, Filter, Tag, X } from 'lucide-react';
import { Expense, Category, CategorySummary } from '@/types';
import { EmptyState } from '@/components/EmptyState';
import { CategoryIcon } from '@/components/CategoryIcon';
import { formatCurrency } from '@/utils/currency';
import { formatDatePretty } from '@/utils/date';

interface OtherExpensesViewProps {
  otherExpenses: Expense[];
  otherCategories: Category[];
  currency: string;
  categoryTotals: CategorySummary[];
  totalAmount: number;
  onAddOtherExpense: (categoryId?: string) => void;
  onEditOtherExpense: (expense: Expense) => void;
  onDeleteOtherExpense: (id: string) => void;
  onCreateOtherCategory: () => void;
  onEditOtherCategory: (category: Category) => void;
  onDeleteOtherCategory: (id: string) => void;
  onBackToDashboard?: () => void;
}

export const OtherExpensesView: React.FC<OtherExpensesViewProps> = ({
  otherExpenses,
  otherCategories,
  currency,
  categoryTotals,
  totalAmount,
  onAddOtherExpense,
  onEditOtherExpense,
  onDeleteOtherExpense,
  onCreateOtherCategory,
  onEditOtherCategory,
  onDeleteOtherCategory,
  onBackToDashboard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [isManagingCategories, setIsManagingCategories] = useState(false);

  const filteredExpenses = otherExpenses.filter((e) => {
    const matchesSearch =
      (e.note && e.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.name && e.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.categoryName && e.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.amount.toString().includes(searchQuery);

    const matchesCategory =
      selectedFilterCategory === 'all' || e.categoryId === selectedFilterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-24">
      {/* Top Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-1.5 -ml-1 rounded-xl bg-[#FFFFFF] border border-[#E5E5E2] text-[#1A1A1A] hover:bg-[#F2F2EF] shadow-2xs transition-colors cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A] tracking-tight leading-tight">
              Other Expenses
            </h2>
            <p className="text-[11px] text-[#8A8A8A] font-normal">
              Separate expense system · Not included in Personal Spending
            </p>
          </div>
        </div>

        <button
          onClick={() => onAddOtherExpense()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer min-h-[36px]"
        >
          <Plus className="w-3.5 h-3.5 stroke-2" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Hero: Total Other Expenses Glass Card */}
      <div className="bg-[#FFFFFF] border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-3xl p-5 sm:p-6 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#C47A2C]" />
            <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
              Total Other Spending
            </span>
          </div>
          <span className="text-xs text-[#8A8A8A] tabular-nums">
            {otherExpenses.length} {otherExpenses.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="mt-3 flex items-baseline">
          <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1A1A] tracking-tight font-mono tabular-nums">
            {formatCurrency(totalAmount, currency)}
          </span>
        </div>

        <p className="text-[11px] text-[#8A8A8A] mt-2 leading-relaxed">
          Completely independent from personal categories and monthly budget calculations.
        </p>

        {/* Primary Add Action */}
        <button
          onClick={() => onAddOtherExpense()}
          className="mt-5 w-full py-3.5 px-4 rounded-2xl bg-[#C47A2C] hover:bg-[#B36E25] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-2" />
          <span>+ Add Other Expense</span>
        </button>
      </div>

      {/* Other Expense Categories Section */}
      <div className="bg-[#FFFFFF] border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-3xl p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#F0F0ED]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C47A2C]" />
            <span className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider">
              Other Categories ({otherCategories.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {otherCategories.length > 0 && (
              <button
                onClick={() => setIsManagingCategories(!isManagingCategories)}
                className="text-xs font-medium text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                {isManagingCategories ? 'Done Managing' : 'Manage Categories'}
              </button>
            )}
            <button
              onClick={onCreateOtherCategory}
              className="text-xs font-semibold text-[#C47A2C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Category</span>
            </button>
          </div>
        </div>

        {otherCategories.length === 0 ? (
          <div className="py-6 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-[#8A8A8A]">
              No other categories created yet. (e.g. Travel, Gifts, Miscellaneous)
            </p>
            <button
              onClick={onCreateOtherCategory}
              className="text-xs font-semibold text-[#C47A2C] hover:underline cursor-pointer"
            >
              + Create Other Category
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Category breakdown cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherCategories.map((cat) => {
                const totalItem = categoryTotals.find((t) => t.categoryId === cat.id);
                const catSpent = totalItem?.totalAmount ?? 0;
                const catCount = totalItem?.transactionCount ?? 0;
                const isFiltered = selectedFilterCategory === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (!isManagingCategories) {
                        setSelectedFilterCategory(isFiltered ? 'all' : cat.id);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                      isFiltered
                        ? 'border-[#C47A2C] bg-[#C47A2C]/10 text-[#C47A2C] shadow-xs ring-1 ring-[#C47A2C]'
                        : 'border-[#EBEBE8] bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A]'
                    } ${!isManagingCategories ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isFiltered ? 'bg-[#C47A2C] text-white' : 'bg-[#FFFFFF] border border-[#E5E5E2] text-[#1A1A1A]'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold truncate block">
                          {cat.name}
                        </span>
                        <span
                          className={`text-[10px] tabular-nums block ${
                            isFiltered ? 'text-[#C47A2C]' : 'text-[#8A8A8A]'
                          }`}
                        >
                          {catCount} {catCount === 1 ? 'entry' : 'entries'} · {formatCurrency(catSpent, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Edit / Delete if managing, else quick add */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isManagingCategories ? (
                        <>
                          <button
                            onClick={() => onEditOtherCategory(cat)}
                            className="p-1 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#E5E5E2] transition-colors cursor-pointer"
                            title="Edit category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOtherCategory(cat.id)}
                            className="p-1 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#E5E5E2] transition-colors cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onAddOtherExpense(cat.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                            isFiltered
                              ? 'bg-[#C47A2C] text-white hover:bg-[#B36E25]'
                              : 'bg-[#FFFFFF] hover:bg-[#C47A2C] hover:text-white text-[#8A8A8A] border border-[#E5E5E2] shadow-2xs'
                          }`}
                          title={`Add expense in ${cat.name}`}
                        >
                          <Plus className="w-3 h-3 stroke-2" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expense History Section */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Expense History
            </span>
            <span className="text-xs text-[#8A8A8A] font-medium tabular-nums">
              ({filteredExpenses.length})
            </span>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search note or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E5E5E2] bg-[#FFFFFF] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#C47A2C] transition-all"
            />
          </div>
        </div>

        {/* Filter badge if active */}
        {selectedFilterCategory !== 'all' && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-[#8A8A8A] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#C47A2C]" />
              Filtered by:
            </span>
            <span className="text-xs font-semibold text-[#1A1A1A] bg-[#C47A2C]/10 px-2.5 py-0.5 rounded-lg border border-[#C47A2C]/20 flex items-center gap-1.5">
              {otherCategories.find((c) => c.id === selectedFilterCategory)?.name || 'Category'}
              <button
                onClick={() => setSelectedFilterCategory('all')}
                className="hover:text-black font-bold cursor-pointer"
                title="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        {filteredExpenses.length === 0 ? (
          <EmptyState
            title={otherExpenses.length === 0 ? 'No Other Expenses Yet' : 'No Matching Expenses'}
            description={
              otherExpenses.length === 0
                ? 'Record non-personal purchases or special expenses here without affecting your regular monthly budget.'
                : 'Try adjusting your search query or category filter.'
            }
            actionLabel={otherExpenses.length === 0 ? 'Add First Other Expense' : undefined}
            onAction={otherExpenses.length === 0 ? () => onAddOtherExpense() : undefined}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filteredExpenses.map((expense) => {
              const hasCustomDescription =
                Boolean(expense.name) &&
                Boolean(expense.categoryName) &&
                expense.name?.trim().toLowerCase() !== expense.categoryName?.trim().toLowerCase();

              const displayTitle = hasCustomDescription
                ? expense.name
                : expense.categoryName || 'Other Expense';

              return (
                <div
                  key={expense.id}
                  className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#EAEAEA] shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate">
                        {displayTitle}
                      </span>
                      {hasCustomDescription && expense.categoryName && (
                        <span className="text-[10px] font-medium bg-[#FAFAF8] text-[#8A8A8A] px-2 py-0.5 rounded-md border border-[#E5E5E2] shrink-0">
                          {expense.categoryName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8A8A8A] mt-0.5">
                      <span>{formatDatePretty(expense.date)}</span>
                      {expense.note && expense.note !== expense.name && (
                        <>
                          <span>·</span>
                          <span className="truncate">{expense.note}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-[#1A1A1A] tabular-nums">
                      {formatCurrency(expense.amount, currency)}
                    </span>

                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onEditOtherExpense(expense)}
                        className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF] transition-colors cursor-pointer"
                        title="Edit expense"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteOtherExpense(expense.id)}
                        className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF] transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherExpensesView;
