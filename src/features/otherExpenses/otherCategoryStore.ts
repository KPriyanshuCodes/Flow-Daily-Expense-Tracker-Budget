import { create } from 'zustand';
import { Category } from '@/types';
import { otherCategoryRepository } from '@/database/otherCategoryRepository';
import { useOtherExpenseStore } from './otherExpenseStore';

interface OtherCategoryState {
  otherCategories: Category[];
  loadOtherCategories: () => void;
  createOtherCategory: (data: { name: string; icon: string; color: string }) => Category;
  updateOtherCategory: (id: string, updates: Partial<{ name: string; icon: string; color: string }>) => boolean;
  toggleActiveOtherCategory: (id: string) => boolean;
  deleteOtherCategory: (id: string) => { success: boolean; error?: string; deletedExpensesCount?: number };
  getUsageCount: (id: string) => number;
}

export const useOtherCategoryStore = create<OtherCategoryState>((set) => ({
  otherCategories: otherCategoryRepository.getAll(),

  loadOtherCategories: () => {
    set({ otherCategories: otherCategoryRepository.getAll() });
  },

  createOtherCategory: (data) => {
    const newCat = otherCategoryRepository.create(data);
    set({ otherCategories: otherCategoryRepository.getAll() });
    return newCat;
  },

  updateOtherCategory: (id, updates) => {
    const updated = otherCategoryRepository.update(id, updates);
    if (updated) {
      set({ otherCategories: otherCategoryRepository.getAll() });
      useOtherExpenseStore.getState().loadOtherExpenses();
      return true;
    }
    return false;
  },

  toggleActiveOtherCategory: (id) => {
    const toggled = otherCategoryRepository.toggleActive(id);
    if (toggled) {
      set({ otherCategories: otherCategoryRepository.getAll() });
      return true;
    }
    return false;
  },

  deleteOtherCategory: (id) => {
    const res = otherCategoryRepository.delete(id);
    if (res.success) {
      set({ otherCategories: otherCategoryRepository.getAll() });
      useOtherExpenseStore.getState().loadOtherExpenses();
    }
    return res;
  },

  getUsageCount: (id) => {
    return otherCategoryRepository.getUsageCount(id);
  },
}));
