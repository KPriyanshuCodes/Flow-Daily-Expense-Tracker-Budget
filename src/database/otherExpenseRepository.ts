import { storage, DB_STORAGE_KEYS } from './database';
import { Expense, CategorySummary } from '@/types';
import { getMonthKey } from '@/utils/date';
import { otherCategoryRepository } from './otherCategoryRepository';

export const otherExpenseRepository = {
  getAll(): Expense[] {
    const rawItems = storage.get<Expense[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const items = Array.isArray(rawItems) ? rawItems : [];
    const otherCategories = otherCategoryRepository.getAll();
    const catMap = new Map(otherCategories.map((c) => [c.id, c]));

    return items
      .map((e) => {
        const cat = e.categoryId ? catMap.get(e.categoryId) : undefined;
        const displayName = (e.name || cat?.name || e.note || 'Other Expense').trim();
        return {
          ...e,
          name: displayName,
          note: e.note || undefined,
          categoryName: cat?.name || e.categoryName || 'Other Expense',
          categoryIcon: cat?.icon || e.categoryIcon || 'Layers',
          categoryColor: cat?.color || e.categoryColor || '#71717a',
          isOther: true,
        };
      })
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  },

  getById(id: string): Expense | undefined {
    const cleanId = String(id || '').trim();
    return this.getAll().find((e) => String(e.id).trim() === cleanId);
  },

  create(data: {
    amount: number;
    categoryId?: string;
    name?: string;
    description?: string;
    date: string;
    note?: string;
  }): Expense {
    const rawItems = storage.get<Expense[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const items = Array.isArray(rawItems) ? rawItems : [];
    const monthKey = getMonthKey(data.date);
    const catId = data.categoryId || 'other';
    const cat = otherCategoryRepository.getById(catId);
    const customName = data.name?.trim() || data.description?.trim();
    const expName = customName || cat?.name || data.note?.trim() || 'Other Expense';

    const newExpense: Expense = {
      id: `oth-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(data.amount * 100) / 100,
      categoryId: catId,
      name: expName,
      date: data.date,
      monthKey,
      note: data.note?.trim() || undefined,
      categoryName: cat?.name || 'Other Expense',
      categoryIcon: cat?.icon || 'Layers',
      categoryColor: cat?.color || '#71717a',
      isOther: true,
      createdAt: new Date().toISOString(),
    };

    items.push(newExpense);
    storage.set(DB_STORAGE_KEYS.OTHER_EXPENSES, items);

    return newExpense;
  },

  update(
    id: string,
    updates: Partial<{
      amount: number;
      categoryId?: string;
      name?: string;
      description?: string;
      date: string;
      note?: string;
    }>
  ): Expense | null {
    const cleanId = String(id || '').trim();
    const rawItems = storage.get<Expense[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const items = Array.isArray(rawItems) ? rawItems : [];
    const idx = items.findIndex((e) => String(e.id).trim() === cleanId);
    if (idx === -1) return null;

    const current = items[idx];
    const newDate = updates.date ?? current.date;
    const newMonthKey = updates.date ? getMonthKey(updates.date) : current.monthKey;
    const newCatId = updates.categoryId ?? current.categoryId;
    const cat = otherCategoryRepository.getById(newCatId);

    const newName =
      updates.name !== undefined
        ? (updates.name.trim() || cat?.name || 'Other Expense')
        : updates.description !== undefined
        ? (updates.description.trim() || cat?.name || 'Other Expense')
        : current.name || cat?.name || 'Other Expense';

    items[idx] = {
      ...current,
      ...updates,
      categoryId: newCatId,
      name: newName,
      amount: updates.amount !== undefined ? Math.round(updates.amount * 100) / 100 : current.amount,
      monthKey: newMonthKey,
      date: newDate,
      note: updates.note !== undefined ? updates.note.trim() || undefined : current.note,
      categoryName: cat?.name || current.categoryName || 'Other Expense',
      categoryIcon: cat?.icon || current.categoryIcon || 'Layers',
      categoryColor: cat?.color || current.categoryColor || '#71717a',
      isOther: true,
    };

    storage.set(DB_STORAGE_KEYS.OTHER_EXPENSES, items);

    return items[idx];
  },

  delete(id: string): boolean {
    const cleanId = String(id || '').trim();
    const items = storage.get<Expense[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const filtered = items.filter((e) => String(e.id).trim() !== cleanId);
    if (filtered.length === items.length) return false;
    storage.set(DB_STORAGE_KEYS.OTHER_EXPENSES, filtered);
    return true;
  },

  getCategoryTotals(filteredExpenses?: Expense[]): CategorySummary[] {
    const expenses = filteredExpenses ?? this.getAll();
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    const categories = otherCategoryRepository.getAll();
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const catTotalMap = new Map<string, { total: number; count: number }>();
    expenses.forEach((e) => {
      const existing = catTotalMap.get(e.categoryId) || { total: 0, count: 0 };
      catTotalMap.set(e.categoryId, {
        total: existing.total + e.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(catTotalMap.entries())
      .map(([catId, data]) => {
        const cat = catMap.get(catId);
        const percentage = totalSpent > 0 ? Math.round((data.total / totalSpent) * 1000) / 10 : 0;
        return {
          categoryId: catId,
          categoryName: cat?.name || 'Other Expense',
          categoryIcon: cat?.icon || 'Layers',
          categoryColor: cat?.color || '#71717a',
          totalAmount: data.total,
          percentage,
          transactionCount: data.count,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);
  },
};
