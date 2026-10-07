import { create } from 'zustand';
import { Expense } from '@/types';
import { otherExpenseRepository } from '@/database/otherExpenseRepository';

interface OtherExpenseState {
  otherExpenses: Expense[];
  loadOtherExpenses: () => void;
  addOtherExpense: (data: { amount: number; name?: string; description?: string; categoryId?: string; date: string; note?: string }) => Expense;
  updateOtherExpense: (
    id: string,
    updates: Partial<{ amount: number; name?: string; description?: string; categoryId?: string; date: string; note?: string }>
  ) => boolean;
  deleteOtherExpense: (id: string) => boolean;
}

export const useOtherExpenseStore = create<OtherExpenseState>((set) => ({
  otherExpenses: otherExpenseRepository.getAll(),

  loadOtherExpenses: () => {
    set({ otherExpenses: otherExpenseRepository.getAll() });
  },

  addOtherExpense: (data) => {
    const newExp = otherExpenseRepository.create(data);
    set({ otherExpenses: otherExpenseRepository.getAll() });
    return newExp;
  },

  updateOtherExpense: (id, updates) => {
    const updated = otherExpenseRepository.update(id, updates);
    if (updated) {
      set({ otherExpenses: otherExpenseRepository.getAll() });
      return true;
    }
    return false;
  },

  deleteOtherExpense: (id) => {
    const success = otherExpenseRepository.delete(id);
    if (success) {
      set({ otherExpenses: otherExpenseRepository.getAll() });
    }
    return success;
  },
}));
