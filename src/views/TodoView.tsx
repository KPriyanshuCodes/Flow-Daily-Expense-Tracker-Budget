import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Pin, CheckSquare } from 'lucide-react';
import { Todo } from '@/types';
import { TodoCard } from '@/components/todos/TodoCard';
import { TodoModal } from '@/components/todos/TodoModal';

interface TodoViewProps {
  todos: Todo[];
  onAddTodo: (data: {
    title: string;
    type: 'text' | 'checklist';
    content?: string;
    items?: { id: string; text: string; completed: boolean }[];
    isPinned?: boolean;
  }) => void;
  onUpdateTodo: (
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ) => void;
  onTogglePin: (id: string) => void;
  onToggleCheck: (todoId: string, itemId: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoView: React.FC<TodoViewProps> = ({
  todos,
  onAddTodo,
  onUpdateTodo,
  onTogglePin,
  onToggleCheck,
  onDeleteTodo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Filter tasks based on search
  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return todos;

    return todos.filter((todo) => {
      if (todo.title.toLowerCase().includes(q)) return true;
      if (todo.content && todo.content.toLowerCase().includes(q)) return true;
      if (
        todo.items &&
        todo.items.some((item) => item.text.toLowerCase().includes(q))
      ) {
        return true;
      }
      return false;
    });
  }, [todos, searchQuery]);

  // Separate pinned and unpinned
  const pinnedTodos = useMemo(
    () => filteredTodos.filter((t) => t.isPinned),
    [filteredTodos]
  );
  const unpinnedTodos = useMemo(
    () => filteredTodos.filter((t) => !t.isPinned),
    [filteredTodos]
  );

  const handleOpenCreate = () => {
    setEditingTodo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: {
    title: string;
    type: 'text' | 'checklist';
    content?: string;
    items?: { id: string; text: string; completed: boolean }[];
    isPinned?: boolean;
  }) => {
    if (editingTodo) {
      onUpdateTodo(editingTodo.id, data);
    } else {
      onAddTodo(data);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-28 relative">
      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search notes and checklists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {todos.length === 0 ? (
        /* Empty State: No Todos Yet */
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-700 mb-1">
            <CheckSquare className="w-6 h-6 stroke-1.5" />
          </div>
          <h3 className="font-bold text-sm text-neutral-900">
            No tasks or notes yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
            Capture thoughts, create checklists, and pin important items in a clean Flow card layout.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-2" />
            <span>Create First Task</span>
          </button>
        </div>
      ) : filteredTodos.length === 0 ? (
        /* Empty State: Search yielded no matches */
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 mt-2">
          <p className="text-xs text-neutral-500">
            No tasks found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-neutral-900 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Grid Display of Cards */
        <div className="flex flex-col gap-6">
          {/* Pinned Section */}
          {pinnedTodos.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5 text-neutral-500 fill-current" />
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Pinned ({pinnedTodos.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                {pinnedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={handleOpenEdit}
                    onTogglePin={onTogglePin}
                    onToggleCheck={onToggleCheck}
                    onDelete={onDeleteTodo}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unpinned / Others Section */}
          {unpinnedTodos.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {pinnedTodos.length > 0 && (
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Others ({unpinnedTodos.length})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                {unpinnedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={handleOpenEdit}
                    onTogglePin={onTogglePin}
                    onToggleCheck={onToggleCheck}
                    onDelete={onDeleteTodo}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleOpenCreate}
        className="fixed sm:absolute bottom-20 right-5 z-20 w-13 h-13 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white shadow-[0_8px_25px_rgba(0,0,0,0.15)] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group"
        title="Create new task or note"
      >
        <Plus className="w-6 h-6 stroke-2 transition-transform group-hover:rotate-90 duration-200" />
      </button>

      {/* Create / Edit Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveModal}
        onDelete={onDeleteTodo}
        editingTodo={editingTodo}
      />
    </div>
  );
};
