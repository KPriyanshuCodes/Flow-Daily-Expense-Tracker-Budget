import { storage, DB_STORAGE_KEYS } from './database';
import { Settings } from '@/types';

// Static demo category IDs or prefixes that should be removed if present
const DEMO_CATEGORY_PREFIXES = ['demo', 'sample', 'default', 'cat-demo', 'cat-initial', 'cat-default'];
const DEMO_CATEGORY_EXACT_IDS = new Set([
  'cat-groceries',
  'cat-fuel',
  'cat-dining',
  'cat-food',
  'cat-utilities',
  'cat-entertainment',
  'cat-bills',
  'cat-shopping',
  'cat-health',
  'cat-transport',
  'cat-1',
  'cat-2',
  'cat-3',
  'cat-4',
  'cat-5',
  'cat-6',
  'cat-7',
  'cat-8',
]);

export function runInitialMigrations(): void {
  try {
    // 1. Clean up any leftover demo categories from storage
    const rawCategories = storage.get<any[]>(DB_STORAGE_KEYS.CATEGORIES, []);
    const existingCategories = Array.isArray(rawCategories) ? rawCategories : [];
    const cleanCategories = existingCategories.filter((c) => {
      if (!c || !c.id) return false;
      const idStr = String(c.id).toLowerCase().trim();
      if (DEMO_CATEGORY_EXACT_IDS.has(idStr)) return false;
      if (DEMO_CATEGORY_PREFIXES.some((prefix) => idStr.startsWith(prefix))) return false;
      return true;
    });
    if (cleanCategories.length !== existingCategories.length) {
      storage.set(DB_STORAGE_KEYS.CATEGORIES, cleanCategories);
    }

    const validCategoryIds = new Set(cleanCategories.map((c) => String(c.id).trim()));

    // 2. Clean up any leftover demo expenses or orphaned expenses from deleted categories
    const rawExpenses = storage.get<any[]>(DB_STORAGE_KEYS.EXPENSES, []);
    const existingExpenses = Array.isArray(rawExpenses) ? rawExpenses : [];
    const cleanExpenses = existingExpenses.filter((e) => {
      if (!e || !e.id) return false;
      const idStr = String(e.id).toLowerCase().trim();
      if (idStr.startsWith('demo') || idStr.startsWith('sample') || idStr.startsWith('default')) return false;
      // Must link to a currently existing category
      if (!e.categoryId || !validCategoryIds.has(String(e.categoryId).trim())) return false;
      return true;
    });
    if (cleanExpenses.length !== existingExpenses.length) {
      storage.set(DB_STORAGE_KEYS.EXPENSES, cleanExpenses);
    }

    // 3. Clean up any leftover demo other categories and other expenses
    const rawOtherCats = storage.get<any[]>(DB_STORAGE_KEYS.OTHER_CATEGORIES, []);
    const existingOtherCats = Array.isArray(rawOtherCats) ? rawOtherCats : [];
    const cleanOtherCats = existingOtherCats.filter((c) => {
      if (!c || !c.id) return false;
      const idStr = String(c.id).toLowerCase().trim();
      if (DEMO_CATEGORY_EXACT_IDS.has(idStr)) return false;
      if (DEMO_CATEGORY_PREFIXES.some((prefix) => idStr.startsWith(prefix))) return false;
      return true;
    });
    if (cleanOtherCats.length !== existingOtherCats.length) {
      storage.set(DB_STORAGE_KEYS.OTHER_CATEGORIES, cleanOtherCats);
    }

    const rawOtherExpenses = storage.get<any[]>(DB_STORAGE_KEYS.OTHER_EXPENSES, []);
    const existingOtherExpenses = Array.isArray(rawOtherExpenses) ? rawOtherExpenses : [];
    const cleanOther = existingOtherExpenses.filter((e) => {
      if (!e || !e.id) return false;
      const idStr = String(e.id).toLowerCase().trim();
      if (idStr.startsWith('demo') || idStr.startsWith('sample') || idStr.startsWith('default')) return false;
      return true;
    });
    if (cleanOther.length !== existingOtherExpenses.length) {
      storage.set(DB_STORAGE_KEYS.OTHER_EXPENSES, cleanOther);
    }

    // 4. Clean up any leftover demo todos from storage
    const rawTodos = storage.get<any[]>(DB_STORAGE_KEYS.TODOS, []);
    const existingTodos = Array.isArray(rawTodos) ? rawTodos : [];
    const cleanTodos = existingTodos.filter((t) => {
      if (!t || !t.id) return false;
      const idStr = String(t.id).toLowerCase().trim();
      if (idStr.startsWith('todo-initial-') || idStr.startsWith('demo') || idStr.startsWith('sample') || idStr.startsWith('default')) {
        return false;
      }
      return true;
    });
    if (cleanTodos.length !== existingTodos.length) {
      storage.set(DB_STORAGE_KEYS.TODOS, cleanTodos);
    }
    localStorage.removeItem('flow_todos_seeded_v1');

    // 5. Ensure initialized state with zero demo data
    const isInitialized = storage.get<boolean>(DB_STORAGE_KEYS.INITIALIZED, false);
    if (!isInitialized) {
      storage.set(DB_STORAGE_KEYS.CATEGORIES, cleanCategories);
      storage.set(DB_STORAGE_KEYS.OTHER_CATEGORIES, cleanOtherCats);
      storage.set(DB_STORAGE_KEYS.EXPENSES, cleanExpenses);
      storage.set(DB_STORAGE_KEYS.OTHER_EXPENSES, cleanOther);
      storage.set(DB_STORAGE_KEYS.TODOS, cleanTodos);

      const defaultSettings: Settings = {
        currency: '₹',
        currencyPosition: 'prefix',
      };
      storage.set(DB_STORAGE_KEYS.SETTINGS, defaultSettings);
      storage.set(DB_STORAGE_KEYS.INITIALIZED, true);
    }
  } catch (err) {
    console.error('Error running initial migrations:', err);
  }
}
