import { storage, DB_STORAGE_KEYS } from './database';
import { Category, Expense } from '@/types';

export const otherCategoryRepository = {
  getAll(): Category[] {
    const raw = storage.get<Category[]>(DB_STORAGE_KEYS.OTHER_CATEGORIES, []);
    return Array.isArray(raw) ? raw : [];
  },

  getActive(): Category[] {
    return this.getAll().filter((c) => c.isActive !== false);
  },

  getById(id: string): Category | undefined {
    const cleanId = String(id || '').trim();
    return this.getAll().find((c) => String(c.id).trim() === cleanId);
  },

  create(data: { name: string; icon: string; color: string }): Category {
    const categories = this.getAll();
    const newCategory: Category = {
      id: `othcat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      icon: data.icon || 'Layers',
      color: data.color || '#64748b',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    storage.set(DB_STORAGE_KEYS.OTHER_CATEGORIES, categories);
    return newCategory;
  },

  update(id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Category | null {
    const cleanId = String(id || '').trim();
    const categories = this.getAll();
    const idx = categories.findIndex((c) => String(c.id).trim() === cleanId);
    if (idx === -1) return null;

    categories[idx] = {
      ...categories[idx],
      ...updates,
      name: updates.name !== undefined ? updates.name.trim() : categories[idx].name,
    };
    storage.set(DB_STORAGE_KEYS.OTHER_CATEGORIES, categories);
    return categories[idx];
  },

  toggleActive(id: string): Category | null {
    const cleanId = String(id || '').trim();
    const categories = this.getAll();
    const idx = categories.findIndex((c) => String(c.id).trim() === cleanId);
    if (idx === -1) return null;

    categories[idx].isActive = !categories[idx].isActive;
    storage.set(DB_STORAGE_KEYS.OTHER_CATEGORIES, categories);
    return categories[idx];
  },

  getUsageCount(categoryId: string): number {
    const cleanId = String(categoryId || '').trim();
    const rawOtherExpenses = storage.get<Expense[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const otherExpenses = Array.isArray(rawOtherExpenses) ? rawOtherExpenses : [];
    return otherExpenses.filter((e) => String(e.categoryId).trim() === cleanId).length;
  },

  // Delete Other Category cleanly without touching personal categories or personal expenses
  delete(id: string): { success: boolean; error?: string; deletedExpensesCount?: number } {
    const cleanId = String(id || '').trim();
    if (!cleanId) {
      return { success: false, error: 'Category ID is missing or invalid.' };
    }

    const categories = this.getAll();
    const remainingCategories = categories.filter((c) => String(c.id).trim() !== cleanId);
    storage.set(DB_STORAGE_KEYS.OTHER_CATEGORIES, remainingCategories);

    // Delete any other expenses linked to this deleted other category
    const rawOther = storage.get<Expense[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const otherExpenses = Array.isArray(rawOther) ? rawOther : [];
    const remainingOther = otherExpenses.filter((e) => String(e.categoryId).trim() !== cleanId);
    const deletedCount = otherExpenses.length - remainingOther.length;
    storage.set(DB_STORAGE_KEYS.OTHER_EXPENSES, remainingOther);

    return {
      success: true,
      deletedExpensesCount: deletedCount,
    };
  },
};
