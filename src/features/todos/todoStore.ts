import { create } from 'zustand';
import { Todo, TodoChecklistItem } from '@/types';
import { todoRepository } from '@/database/todoRepository';

interface TodoState {
  todos: Todo[];
  loadTodos: () => void;
  addTodo: (data: {
    title: string;
    type: 'text' | 'checklist';
    content?: string;
    items?: TodoChecklistItem[];
    isPinned?: boolean;
  }) => Todo;
  updateTodo: (
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ) => Todo | undefined;
  togglePin: (id: string) => void;
  toggleItemCheck: (todoId: string, itemId: string) => void;
  deleteTodo: (id: string) => boolean;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: todoRepository.getAll(),

  loadTodos: () => {
    set({ todos: todoRepository.getAll() });
  },

  addTodo: (data) => {
    const newTodo = todoRepository.create(data);
    set({ todos: todoRepository.getAll() });
    return newTodo;
  },

  updateTodo: (id, updates) => {
    const updated = todoRepository.update(id, updates);
    if (updated) {
      set({ todos: todoRepository.getAll() });
    }
    return updated;
  },

  togglePin: (id: string) => {
    todoRepository.togglePin(id);
    set({ todos: todoRepository.getAll() });
  },

  toggleItemCheck: (todoId: string, itemId: string) => {
    todoRepository.toggleItemCheck(todoId, itemId);
    set({ todos: todoRepository.getAll() });
  },

  deleteTodo: (id: string) => {
    const success = todoRepository.delete(id);
    if (success) {
      set({ todos: todoRepository.getAll() });
    }
    return success;
  },
}));
