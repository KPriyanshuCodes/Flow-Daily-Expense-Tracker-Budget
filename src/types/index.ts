export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean; // Soft-deactivation safety
  createdAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  date: string; // YYYY-MM-DD
  monthKey: string; // YYYY-MM
  note?: string;
  name?: string; // Optional name/description for Other Expenses
  isOther?: boolean; // Tag for Other Expenses
  createdAt: string;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface MonthlySummary {
  monthKey: string; // e.g. "2026-10"
  monthLabel: string; // e.g. "October 2026"
  totalSpent: number;
  transactionCount: number;
  dailyAverage: number;
  daysInMonth: number;
  highestCategory?: {
    name: string;
    amount: number;
    percentage: number;
    icon: string;
    color: string;
  };
  categories: CategorySummary[];
}

export interface Settings {
  currency: string;
  currencyPosition: 'prefix' | 'suffix';
}

export interface TodoChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type TodoType = 'text' | 'checklist';

export interface Todo {
  id: string;
  title: string;
  type: TodoType;
  content?: string;
  items?: TodoChecklistItem[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}
