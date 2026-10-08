import React from 'react';
import { Pencil, Power, Trash2, ChevronRight } from 'lucide-react';
import { Category } from '@/types';
import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: Category;
  usageCount: number;
  onEdit: (category: Category) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onViewHistory?: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  usageCount,
  onEdit,
  onToggleActive,
  onDelete,
  onViewHistory,
}) => {
  return (
    <div
      onClick={() => onViewHistory && onViewHistory(category)}
      className={`rounded-2xl p-4 border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
        category.isActive
          ? 'bg-[#FFFFFF] border-[#E5E5E2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:bg-[#FAFAF8] hover:border-[#D5D5D0]'
          : 'bg-[#FAFAF8]/80 border-[#EBEBE8] opacity-60 hover:opacity-80'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center shrink-0 text-[#1A1A1A] transition-transform group-hover:scale-105">
          <CategoryIcon name={category.icon} size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate transition-colors">
              {category.name}
            </h4>
            {!category.isActive && (
              <span className="text-[10px] font-medium tracking-tight px-1.5 py-0.5 rounded bg-[#F0F0ED] text-[#8A8A8A]">
                Inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#8A8A8A] mt-0.5 font-normal">
            <span>
              {usageCount} {usageCount === 1 ? 'expense' : 'expenses'}
            </span>
            <span>·</span>
            <span className="text-[#C47A2C] font-medium group-hover:underline">
              View History
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(category);
          }}
          className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF] transition-colors cursor-pointer"
          title="Edit Category"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Soft-deactivation toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(category.id);
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            category.isActive
              ? 'text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF]'
              : 'text-[#B8B8B8] hover:text-[#8A8A8A] hover:bg-[#F2F2EF]'
          }`}
          title={category.isActive ? 'Deactivate' : 'Reactivate'}
        >
          <Power className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(category.id);
          }}
          className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F2F2EF] transition-colors cursor-pointer"
          title="Delete category"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <ChevronRight className="w-4 h-4 text-[#C0C0BA] group-hover:text-[#1A1A1A] group-hover:translate-x-0.5 transition-all ml-0.5" />
      </div>
    </div>
  );
};
