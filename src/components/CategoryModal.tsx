import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Category } from '@/types';
import { AVAILABLE_ICONS } from '@/constants/defaults';
import { CATEGORY_COLORS } from '@/constants/colors';
import { CategoryIcon } from './CategoryIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string }) => void;
  editingCategory?: Category | null;
  onDelete?: (id: string) => void;
  zIndex?: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
  onDelete,
  zIndex = 'z-50',
}) => {
  const [name, setName] = useState<string>('');
  const [icon, setIcon] = useState<string>('ShoppingCart');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0].value);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon);
      setColor(editingCategory.color);
    } else {
      setName('');
      setIcon('ShoppingCart');
      setColor(CATEGORY_COLORS[0].value);
    }
    setError('');
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    onSave({
      name: name.trim(),
      icon,
      color,
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#FFFFFF] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-[#EAEAEA] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] bg-[#FAFAF8]">
          <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A] tracking-tight">
            {editingCategory ? 'Edit Category' : 'Create Custom Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-5">
          {/* Preview Badge */}
          <div className="flex items-center justify-center py-2">
            <div
              className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xs border bg-[#FAFAF8]"
              style={{
                backgroundColor: `${color}15`,
                borderColor: `${color}40`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs text-white"
                style={{ backgroundColor: color }}
              >
                <CategoryIcon name={icon} size={20} />
              </div>
              <span className="font-extrabold text-base text-[#1A1A1A]">
                {name.trim() || 'Category Name'}
              </span>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1.5">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Subscriptions, Gym, Coffee"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              maxLength={30}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none transition-colors ${
                error ? 'border-[#C47A2C]' : 'border-[#E5E5E2] focus:border-[#C47A2C]'
              }`}
              autoFocus
            />
            {error && <p className="text-[#C47A2C] text-xs font-medium mt-1">{error}</p>}
          </div>

          {/* Color palette */}
          <div>
            <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-2">
              Select Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                    color === c.value ? 'scale-115 ring-2 ring-offset-2 ring-offset-[#FFFFFF] ring-[#1A1A1A]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {color === c.value && <Check className="w-4 h-4 text-white stroke-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-2">
              Select Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C47A2C] text-white shadow-xs'
                        : 'bg-[#FAFAF8] text-[#8A8A8A] hover:bg-[#F2F2EF] hover:text-[#1A1A1A] border border-[#E5E5E2]'
                    }`}
                    title={iconName}
                  >
                    <CategoryIcon name={iconName} size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            {editingCategory && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingCategory.id);
                  onClose();
                }}
                className="p-3 rounded-xl text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] transition-colors cursor-pointer border border-[#E5E5E2]"
                title="Delete category"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#1A1A1A] bg-[#FAFAF8] hover:bg-[#F2F2EF] transition-colors cursor-pointer border border-[#E5E5E2]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#C47A2C] hover:bg-[#B36E25] shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {editingCategory ? 'Update' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
