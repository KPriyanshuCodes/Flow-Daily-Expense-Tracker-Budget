import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Pin, CheckSquare, FileText } from 'lucide-react';
import { Todo, TodoType } from '@/types';
import { TodoCard } from '@/components/todos/TodoCard';
import { FullScreenTodoEditor } from '@/components/todos/FullScreenTodoEditor';

interface TodoViewProps {
  todos: Todo[];
  onAddTodo: (data: {
    title: string;
    type: 'text' | 'checklist';
    content?: string;
    items?: { id: string; text: string; completed: boolean }[];
    isPinned?: boolean;
  }) => Todo | void;
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

  // Full-Screen Note Editor state
  // activeTodoId: string ID of the opened note, or 'new' when creating a new note
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const [newNoteInitialType, setNewNoteInitialType] = useState<TodoType>('text');

  // Currently opened note (if editing an existing one)
  const activeTodo = useMemo(() => {
    if (!activeTodoId || activeTodoId === 'new') return null;
    return todos.find((t) => t.id === activeTodoId) || null;
  }, [todos, activeTodoId]);

  // Filter tasks based on search
  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return todos;

    return todos.filter((todo) => {
      if (todo.title && todo.title.toLowerCase().includes(q)) return true;
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

  // Separate pinned and unpinned notes
  const pinnedTodos = useMemo(
    () => filteredTodos.filter((t) => t.isPinned),
    [filteredTodos]
  );
  const unpinnedTodos = useMemo(
    () => filteredTodos.filter((t) => !t.isPinned),
    [filteredTodos]
  );

  const handleOpenNewNote = (type: TodoType = 'text') => {
    setNewNoteInitialType(type);
    setActiveTodoId('new');
  };

  const handleSelectTodo = (todo: Todo) => {
    setActiveTodoId(todo.id);
  };

  const handleSaveInEditor = (data: {
    title: string;
    type: TodoType;
    content?: string;
    items?: { id: string; text: string; completed: boolean }[];
    isPinned?: boolean;
  }) => {
    if (activeTodoId && activeTodoId !== 'new') {
      onUpdateTodo(activeTodoId, data);
    } else if (activeTodoId === 'new') {
      // Create new note
      const created = onAddTodo(data);
      if (created && typeof created === 'object' && 'id' in created) {
        setActiveTodoId(created.id);
      }
    }
  };

  const handleDeleteInEditor = (id: string) => {
    onDeleteTodo(id);
    setActiveTodoId(null);
  };

  // If a note is opened, transition to the DEDICATED FULL-SCREEN NOTE EDITOR
  if (activeTodoId !== null) {
    return (
      <FullScreenTodoEditor
        todo={activeTodo}
        initialType={newNoteInitialType}
        onSave={handleSaveInEditor}
        onDelete={handleDeleteInEditor}
        onClose={() => setActiveTodoId(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-28 relative">
      {/* Search Header */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search notes and checklists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E5E2] shadow-2xs text-xs text-[#1A1A1A] placeholder-[#8A8A8A] focus:outline-none focus:border-[#C47A2C] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#1A1A1A] p-0.5 cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Create Note Bar */}
      <div
        onClick={() => handleOpenNewNote('text')}
        className="bg-[#FFFFFF] hover:bg-[#FAFAF8] border border-[#E5E5E2] rounded-2xl p-3 sm:px-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center justify-between gap-3 cursor-pointer transition-all text-[#8A8A8A] group"
      >
        <span className="text-xs sm:text-sm font-medium text-[#8A8A8A] group-hover:text-[#1A1A1A] transition-colors">
          Take a note...
        </span>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenNewNote('checklist')}
            className="p-1.5 rounded-xl hover:bg-[#F2F2EF] text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors cursor-pointer flex items-center gap-1"
            title="New checklist"
          >
            <CheckSquare className="w-4 h-4 text-[#C47A2C]" />
          </button>
          <button
            type="button"
            onClick={() => handleOpenNewNote('text')}
            className="p-1.5 rounded-xl hover:bg-[#F2F2EF] text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            title="New text note"
          >
            <FileText className="w-4 h-4 text-[#C47A2C]" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {todos.length === 0 ? (
        /* Empty State: No Notes Yet */
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 mt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center text-[#C47A2C] mb-1">
            <CheckSquare className="w-6 h-6 stroke-1.5" />
          </div>
          <h3 className="font-bold text-sm text-[#1A1A1A]">
            No notes or tasks yet
          </h3>
          <p className="text-xs text-[#8A8A8A] max-w-xs leading-relaxed">
            Capture thoughts, create checklists, and pin important items. Tap any note to open it full-screen.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => handleOpenNewNote('text')}
              className="px-4 py-2.5 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-2" />
              <span>New Note</span>
            </button>
            <button
              onClick={() => handleOpenNewNote('checklist')}
              className="px-4 py-2.5 rounded-xl bg-[#FAFAF8] border border-[#E5E5E2] hover:bg-[#F2F2EF] text-[#1A1A1A] text-xs font-semibold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#C47A2C]" />
              <span>New Checklist</span>
            </button>
          </div>
        </div>
      ) : filteredTodos.length === 0 ? (
        /* Empty State: Search yielded no matches */
        <div className="bg-[#FFFFFF] border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.03)] rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 mt-2">
          <p className="text-xs text-[#8A8A8A]">
            No notes found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-[#C47A2C] hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Grid Display of Note Cards */
        <div className="flex flex-col gap-6">
          {/* Pinned Section */}
          {pinnedTodos.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5 text-[#C47A2C] fill-current" />
                <span className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider">
                  Pinned ({pinnedTodos.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                {pinnedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={handleSelectTodo}
                    onTogglePin={onTogglePin}
                    onToggleCheck={onToggleCheck}
                    onDelete={onDeleteTodo}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Normal / Unpinned Notes Section */}
          {unpinnedTodos.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {pinnedTodos.length > 0 && (
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[11px] font-bold text-[#8A8A8A] uppercase tracking-wider">
                    Others ({unpinnedTodos.length})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
                {unpinnedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onEdit={handleSelectTodo}
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

      {/* Floating Action Button (FAB) in Burnt Amber */}
      <button
        onClick={() => handleOpenNewNote('text')}
        className="fixed sm:absolute bottom-6 right-5 z-20 w-13 h-13 rounded-2xl bg-[#C47A2C] hover:bg-[#B36E25] text-white shadow-[0_8px_25px_rgba(196,122,44,0.35)] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer group"
        title="Create new note"
      >
        <Plus className="w-6 h-6 stroke-2 transition-transform group-hover:rotate-90 duration-200" />
      </button>
    </div>
  );
};

export default TodoView;
