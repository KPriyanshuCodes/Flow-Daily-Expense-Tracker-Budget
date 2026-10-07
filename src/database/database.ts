const DB_STORAGE_KEYS = {
  CATEGORIES: 'dailyspend_categories_v1',
  OTHER_CATEGORIES: 'dailyspend_other_categories_v1',
  EXPENSES: 'dailyspend_expenses_v1',
  OTHER_EXPENSES: 'dailyspend_other_expenses_v1',
  TODOS: 'dailyspend_todos_v1',
  SETTINGS: 'dailyspend_settings_v1',
  INITIALIZED: 'dailyspend_initialized_v1',
};

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
    }
  },
  clearAll: (): void => {
    try {
      Object.values(DB_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};

export { DB_STORAGE_KEYS };
