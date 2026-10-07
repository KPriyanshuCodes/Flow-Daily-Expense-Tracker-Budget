import { create } from 'zustand';
import { Category } from '@/types';
import { categoryRepository } from '@/database/categoryRepository';
import { useExpenseStore } from '@/features/expenses/expenseStore';
import { useOtherExpenseStore } from '@/features/otherExpenses/otherExpenseStore';

interface CategoryState {
  categories: Category[];
  loadCategories: () => void;
  createCategory: (data: { name: string; icon: string; color: string }) => Category;
  updateCategory: (id: string, updates: Partial<{ name: string; icon: string; color: string }>) => boolean;
  toggleActive: (id: string) => boolean;
  deleteCategory: (id: string) => { success: boolean; error?: string; deletedExpensesCount?: number };
  getUsageCount: (id: string) => number;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: categoryRepository.getAll(),

  loadCategories: () => {
    set({ categories: categoryRepository.getAll() });
  },

  createCategory: (data) => {
    const newCat = categoryRepository.create(data);
    set({ categories: categoryRepository.getAll() });
    return newCat;
  },

  updateCategory: (id, updates) => {
    const updated = categoryRepository.update(id, updates);
    if (updated) {
      set({ categories: categoryRepository.getAll() });
      return true;
    }
    return false;
  },

  toggleActive: (id) => {
    const toggled = categoryRepository.toggleActive(id);
    if (toggled) {
      set({ categories: categoryRepository.getAll() });
      return true;
    }
    return false;
  },

  deleteCategory: (id) => {
    const res = categoryRepository.delete(id);
    if (res.success) {
      set({ categories: categoryRepository.getAll() });
      // Keep in-memory expense stores perfectly synchronized
      try {
        useExpenseStore.getState().loadExpenses();
        useOtherExpenseStore.getState().loadOtherExpenses();
      } catch (e) {
        console.error('Error synchronizing expense stores after category deletion:', e);
      }
    }
    return res;
  },

  getUsageCount: (id) => {
    return categoryRepository.getUsageCount(id);
  },
}));
