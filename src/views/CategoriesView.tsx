import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Category } from '@/types';
import { CategoryCard } from '@/components/CategoryCard';
import { EmptyState } from '@/components/EmptyState';

interface CategoriesViewProps {
  categories: Category[];
  getUsageCount: (id: string) => number;
  onCreateCategory: () => void;
  onEditCategory: (category: Category) => void;
  onToggleActive: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onViewHistory?: (category: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  getUsageCount,
  onCreateCategory,
  onEditCategory,
  onToggleActive,
  onDeleteCategory,
  onViewHistory,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'deactivated'>('active');

  const activeCategories = categories.filter((c) => c.isActive);
  const deactivatedCategories = categories.filter((c) => !c.isActive);

  const displayedCategories =
    filterTab === 'active'
      ? activeCategories
      : filterTab === 'deactivated'
      ? deactivatedCategories
      : categories;

  return (
    <div className="flex flex-col gap-5 pb-24">
      {/* Header with Add Button & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E5E5E2] p-1 rounded-2xl w-fit shadow-2xs">
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'active'
                ? 'bg-[#C47A2C] text-white shadow-xs'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            Active ({activeCategories.length})
          </button>
          <button
            onClick={() => setFilterTab('deactivated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'deactivated'
                ? 'bg-[#C47A2C] text-white shadow-xs'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            Deactivated ({deactivatedCategories.length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#C47A2C] text-white shadow-xs'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            All ({categories.length})
          </button>
        </div>

        <button
          onClick={onCreateCategory}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-2" />
          New Category
        </button>
      </div>

      {/* Categories List */}
      {displayedCategories.length === 0 ? (
        <EmptyState
          title={
            categories.length === 0
              ? 'No Categories Yet'
              : filterTab === 'deactivated'
              ? 'No Deactivated Categories'
              : 'No Active Categories'
          }
          description={
            categories.length === 0
              ? 'Create your first expense category (e.g. Groceries, Fuel, Utilities) to start tracking your daily spend.'
              : filterTab === 'deactivated'
              ? 'All your categories are currently active and available for tracking.'
              : 'Create or reactivate a category to start logging expenses.'
          }
          actionLabel={filterTab !== 'deactivated' ? 'Create First Category' : undefined}
          onAction={filterTab !== 'deactivated' ? onCreateCategory : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {displayedCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              usageCount={getUsageCount(cat.id)}
              onEdit={onEditCategory}
              onToggleActive={onToggleActive}
              onDelete={onDeleteCategory}
              onViewHistory={onViewHistory}
            />
          ))}
        </div>
      )}
    </div>
  );
};
