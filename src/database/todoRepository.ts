import { storage, DB_STORAGE_KEYS } from './database';
import { Todo, TodoChecklistItem } from '@/types';

export const todoRepository = {
  getAll(): Todo[] {
    const raw = storage.get<Todo[]>(DB_STORAGE_KEYS.TODOS, []);
    if (!raw || raw.length === 0) {
      return [];
    }

    return raw.sort((a, b) => {
      // Pinned items first
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      // Then newest updated first
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });
  },

  getById(id: string): Todo | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  create(data: {
    title: string;
    type: 'text' | 'checklist';
    content?: string;
    items?: TodoChecklistItem[];
    isPinned?: boolean;
  }): Todo {
    const todos = storage.get<Todo[]>(DB_STORAGE_KEYS.TODOS, []);
    const now = new Date().toISOString();

    const newTodo: Todo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim() || 'Untitled',
      type: data.type,
      content: data.type === 'text' ? data.content?.trim() : undefined,
      items: data.type === 'checklist' ? (data.items || []) : undefined,
      isPinned: !!data.isPinned,
      createdAt: now,
      updatedAt: now,
    };

    todos.unshift(newTodo);
    storage.set(DB_STORAGE_KEYS.TODOS, todos);
    return newTodo;
  },

  update(
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ): Todo | undefined {
    const todos = storage.get<Todo[]>(DB_STORAGE_KEYS.TODOS, []);
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const existing = todos[index];
    const updated: Todo = {
      ...existing,
      ...updates,
      title: updates.title !== undefined ? (updates.title.trim() || 'Untitled') : existing.title,
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updated;
    storage.set(DB_STORAGE_KEYS.TODOS, todos);
    return updated;
  },

  togglePin(id: string): Todo | undefined {
    const todo = this.getById(id);
    if (!todo) return undefined;
    return this.update(id, { isPinned: !todo.isPinned });
  },

  toggleItemCheck(todoId: string, itemId: string): Todo | undefined {
    const todo = this.getById(todoId);
    if (!todo || !todo.items) return undefined;

    const updatedItems = todo.items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    return this.update(todoId, { items: updatedItems });
  },

  delete(id: string): boolean {
    const todos = storage.get<Todo[]>(DB_STORAGE_KEYS.TODOS, []);
    const filtered = todos.filter((t) => t.id !== id);
    if (filtered.length === todos.length) return false;

    storage.set(DB_STORAGE_KEYS.TODOS, filtered);
    return true;
  },

  import(todos: Todo[]): void {
    storage.set(DB_STORAGE_KEYS.TODOS, todos);
  },
};
