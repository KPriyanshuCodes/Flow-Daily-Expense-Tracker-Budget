import React, { useState, useEffect, useRef } from 'react';
import { X, Pin, Plus, Trash2, Check, FileText, CheckSquare } from 'lucide-react';
import { Todo, TodoChecklistItem, TodoType } from '@/types';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    type: TodoType;
    content?: string;
    items?: TodoChecklistItem[];
    isPinned?: boolean;
  }) => void;
  onDelete?: (id: string) => void;
  editingTodo?: Todo | null;
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTodo,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TodoType>('text');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<TodoChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  const newItemInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setType(editingTodo.type);
      setContent(editingTodo.content || '');
      setItems(editingTodo.items ? [...editingTodo.items] : []);
      setIsPinned(editingTodo.isPinned);
    } else {
      setTitle('');
      setType('text');
      setContent('');
      setItems([]);
      setIsPinned(false);
    }
    setNewItemText('');
    setError('');
  }, [editingTodo, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const text = newItemText.trim();
    if (!text) return;

    const newItem: TodoChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      completed: false,
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemText('');
    setTimeout(() => newItemInputRef.current?.focus(), 50);
  };

  const handleToggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i))
    );
  };

  const handleUpdateItemText = (itemId: string, newText: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, text: newText } : i))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If there's pending text in the checklist input, add it before saving
    let finalItems = [...items];
    if (type === 'checklist' && newItemText.trim()) {
      finalItems.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: newItemText.trim(),
        completed: false,
      });
    }

    const finalTitle = title.trim();
    if (!finalTitle && !content.trim() && finalItems.length === 0) {
      setError('Please add a title, note, or checklist items.');
      return;
    }

    onSave({
      title: finalTitle || (type === 'checklist' ? 'Checklist' : 'Note'),
      type,
      content: type === 'text' ? content.trim() : undefined,
      items: type === 'checklist' ? finalItems : undefined,
      isPinned,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(28,25,23,0.12)] overflow-hidden border border-white/90 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/60">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              {editingTodo ? 'Edit Task' : 'New Task / Note'}
            </h2>
            <p className="text-[11px] text-neutral-500 font-normal">
              {type === 'checklist' ? 'Manage interactive items' : 'Quick note & thoughts'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPinned
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
              title={isPinned ? 'Pinned to top' : 'Pin to top'}
            >
              <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-4">
          {/* Format Switcher: Text vs Checklist */}
          <div className="flex items-center p-1 rounded-2xl bg-neutral-100/90 border border-neutral-200/50">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'text'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>

            <button
              type="button"
              onClick={() => setType('checklist')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'checklist'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
          </div>

          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-base font-bold text-neutral-900 placeholder:text-neutral-400 bg-transparent border-b border-neutral-200 focus:border-neutral-900 pb-2 outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Content: Text mode */}
          {type === 'text' ? (
            <div>
              <textarea
                placeholder="Take a note, write details, or organize ideas..."
                rows={5}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError('');
                }}
                className="w-full text-xs text-neutral-800 placeholder:text-neutral-400 bg-neutral-50/80 p-3.5 rounded-2xl border border-neutral-200/60 focus:outline-none focus:border-neutral-900 leading-relaxed transition-colors resize-none"
              />
            </div>
          ) : (
            /* Content: Checklist mode */
            <div className="flex flex-col gap-2">
              {/* Existing Items */}
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-neutral-50/80 p-2 rounded-xl border border-neutral-200/50 group"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.id)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        item.completed
                          ? 'bg-neutral-900 border-neutral-900 text-white'
                          : 'border-neutral-300 bg-white hover:border-neutral-900'
                      }`}
                    >
                      {item.completed && <Check className="w-2.5 h-2.5 stroke-3" />}
                    </button>

                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                      className={`flex-1 text-xs bg-transparent outline-none ${
                        item.completed
                          ? 'line-through text-neutral-400'
                          : 'text-neutral-800 font-medium'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-400 hover:text-neutral-900 p-1 rounded-lg opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Remove item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Checklist Item Input */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <input
                    ref={newItemInputRef}
                    type="text"
                    placeholder="+ List item..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-neutral-800 font-medium">{error}</p>}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {editingTodo && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingTodo.id);
                  onClose();
                }}
                className="p-3 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 active:scale-98 shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-2" />
              <span>{editingTodo ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
