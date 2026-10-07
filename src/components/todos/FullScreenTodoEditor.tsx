import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Pin,
  Trash2,
  Check,
  Plus,
  X,
  FileText,
  CheckSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Todo, TodoChecklistItem, TodoType } from '@/types';

interface FullScreenTodoEditorProps {
  todo: Todo | null; // null means creating a new note
  initialType?: TodoType;
  onSave: (data: {
    title: string;
    type: TodoType;
    content?: string;
    items?: TodoChecklistItem[];
    isPinned?: boolean;
  }) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const FullScreenTodoEditor: React.FC<FullScreenTodoEditorProps> = ({
  todo,
  initialType = 'text',
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(todo?.title || '');
  const [type, setType] = useState<TodoType>(todo?.type || initialType);
  const [content, setContent] = useState(todo?.content || '');
  const [items, setItems] = useState<TodoChecklistItem[]>(
    todo?.items ? JSON.parse(JSON.stringify(todo.items)) : []
  );
  const [isPinned, setIsPinned] = useState(todo?.isPinned || false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const itemInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on initial mount
  useEffect(() => {
    if (!todo) {
      // New note: focus title
      titleInputRef.current?.focus();
    }
  }, [todo]);

  // Save changes to localStorage / store automatically
  const persistChanges = useCallback(
    (
      newTitle: string,
      newType: TodoType,
      newContent: string,
      newItems: TodoChecklistItem[],
      newPinned: boolean
    ) => {
      // If note is completely empty and was never saved, don't spam empty saves
      if (!newTitle.trim() && !newContent.trim() && newItems.length === 0 && !todo) {
        return;
      }

      onSave({
        title: newTitle,
        type: newType,
        content: newType === 'text' ? newContent : undefined,
        items: newType === 'checklist' ? newItems : undefined,
        isPinned: newPinned,
      });
    },
    [onSave, todo]
  );

  // Title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    persistChanges(val, type, content, items, isPinned);
  };

  // Content change (for text notes)
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    persistChanges(title, type, val, items, isPinned);
  };

  // Pin toggle
  const handleTogglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    persistChanges(title, type, content, items, nextPinned);
  };

  // Type toggle (convert between text and checklist)
  const handleToggleType = () => {
    const nextType: TodoType = type === 'text' ? 'checklist' : 'text';
    let nextContent = content;
    let nextItems = [...items];

    if (nextType === 'checklist') {
      // Convert text lines to checklist items if items was empty
      if (nextItems.length === 0 && content.trim()) {
        const lines = content.split('\n').filter((l) => l.trim().length > 0);
        nextItems = lines.map((line) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          text: line.trim(),
          completed: false,
        }));
      }
    } else {
      // Convert checklist items to text paragraphs
      if (!content.trim() && items.length > 0) {
        nextContent = items.map((i) => (i.completed ? `[✓] ${i.text}` : i.text)).join('\n');
      }
    }

    setType(nextType);
    setContent(nextContent);
    setItems(nextItems);
    persistChanges(title, nextType, nextContent, nextItems, isPinned);
  };

  // Checklist: Add item at specific index
  const handleAddChecklistItem = (afterIndex?: number, initialText: string = '') => {
    const newItem: TodoChecklistItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: initialText,
      completed: false,
    };

    let nextItems = [...items];
    if (afterIndex !== undefined && afterIndex >= 0 && afterIndex < nextItems.length) {
      nextItems.splice(afterIndex + 1, 0, newItem);
    } else {
      // Insert before completed items, or at the end of active items
      const firstCompletedIdx = nextItems.findIndex((i) => i.completed);
      if (firstCompletedIdx !== -1) {
        nextItems.splice(firstCompletedIdx, 0, newItem);
      } else {
        nextItems.push(newItem);
      }
    }

    setItems(nextItems);
    setFocusedItemId(newItem.id);
    persistChanges(title, type, content, nextItems, isPinned);

    // Focus newly added item
    setTimeout(() => {
      const el = itemInputRefs.current[newItem.id];
      if (el) {
        el.focus();
        el.select();
      }
    }, 20);
  };

  // Checklist: Update item text
  const handleUpdateItemText = (id: string, text: string) => {
    const nextItems = items.map((i) => (i.id === id ? { ...i, text } : i));
    setItems(nextItems);
    persistChanges(title, type, content, nextItems, isPinned);
  };

  // Checklist: Toggle item checkmark
  const handleToggleItemCheck = (id: string) => {
    const nextItems = items.map((i) =>
      i.id === id ? { ...i, completed: !i.completed } : i
    );
    setItems(nextItems);
    persistChanges(title, type, content, nextItems, isPinned);
  };

  // Checklist: Remove item
  const handleRemoveChecklistItem = (id: string, focusPrevIndex?: number) => {
    const nextItems = items.filter((i) => i.id !== id);
    setItems(nextItems);
    persistChanges(title, type, content, nextItems, isPinned);

    if (focusPrevIndex !== undefined && focusPrevIndex >= 0 && nextItems[focusPrevIndex]) {
      const prevId = nextItems[focusPrevIndex].id;
      setTimeout(() => {
        itemInputRefs.current[prevId]?.focus();
      }, 20);
    }
  };

  // Handle keyboard navigation in checklist
  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    item: TodoChecklistItem
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddChecklistItem(index);
    } else if (e.key === 'Backspace' && item.text === '') {
      e.preventDefault();
      handleRemoveChecklistItem(item.id, index - 1);
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const prevId = items[index - 1]?.id;
      if (prevId) itemInputRefs.current[prevId]?.focus();
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault();
      const nextId = items[index + 1]?.id;
      if (nextId) itemInputRefs.current[nextId]?.focus();
    }
  };

  // Delete note
  const handleDelete = () => {
    if (todo && onDelete) {
      onDelete(todo.id);
    }
    onClose();
  };

  // Handle Back
  const handleBack = () => {
    // If empty note, clean up
    if (!title.trim() && !content.trim() && items.length === 0 && todo && onDelete) {
      onDelete(todo.id);
    } else {
      persistChanges(title, type, content, items, isPinned);
    }
    onClose();
  };

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);

  return (
    <div className="fixed inset-0 z-50 bg-[#F6F6F8] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Dedicated Full-Screen Top Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-neutral-200/60 px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Top-Left: Back Arrow */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Back to notes"
          >
            <ArrowLeft className="w-5 h-5 stroke-2" />
            <span className="text-xs font-semibold hidden sm:inline text-neutral-700">Notes</span>
          </button>
        </div>

        {/* Center: Format Switcher (Note vs Checklist) */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/60">
          <button
            type="button"
            onClick={handleToggleType}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              type === 'text'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Convert to standard text note"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>

          <button
            type="button"
            onClick={handleToggleType}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              type === 'checklist'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
            title="Convert to checklist with interactive checkboxes"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Checklist</span>
          </button>
        </div>

        {/* Top-Right: Actions (Pin & Delete) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleTogglePin}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isPinned
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title={isPinned ? 'Pinned note (click to unpin)' : 'Pin note to top'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
          </button>

          {todo && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Full-Screen Editable Body */}
      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col p-4 sm:p-8 md:p-10 overflow-y-auto">
        {/* Large Clean Editable Title Area */}
        <input
          ref={titleInputRef}
          type="text"
          placeholder="Title"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (type === 'text') {
                contentTextareaRef.current?.focus();
              } else {
                if (items.length > 0) {
                  itemInputRefs.current[items[0].id]?.focus();
                } else {
                  handleAddChecklistItem();
                }
              }
            }
          }}
          className="w-full text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-900 placeholder:text-neutral-300 bg-transparent border-none outline-none leading-tight mb-4 tracking-tight"
        />

        {/* Format: Standard Text Note */}
        {type === 'text' && (
          <textarea
            ref={contentTextareaRef}
            placeholder="Note..."
            value={content}
            onChange={handleContentChange}
            className="w-full flex-1 min-h-[50vh] text-base sm:text-lg text-neutral-800 placeholder:text-neutral-400 bg-transparent border-none outline-none resize-none leading-relaxed font-normal"
          />
        )}

        {/* Format: Interactive Checklist Note */}
        {type === 'checklist' && (
          <div className="flex flex-col gap-2 flex-1 pb-16">
            {/* Active / Uncompleted Items */}
            <div className="flex flex-col gap-1.5">
              {activeItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-1 px-1.5 rounded-xl hover:bg-neutral-100/60 transition-colors group"
                >
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleItemCheck(item.id)}
                    className="w-5 h-5 rounded-md border border-neutral-300 hover:border-neutral-800 bg-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="Mark as completed"
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-3 text-neutral-900" />}
                  </button>

                  {/* Editable Item Text */}
                  <input
                    ref={(el) => {
                      itemInputRefs.current[item.id] = el;
                    }}
                    type="text"
                    value={item.text}
                    placeholder="List item..."
                    onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                    onKeyDown={(e) => handleItemKeyDown(e, idx, item)}
                    className="flex-1 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-300 bg-transparent outline-none font-medium leading-normal"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="p-1 rounded-lg text-neutral-300 hover:text-neutral-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Row for Checklist */}
            <div className="flex items-center gap-3 py-1.5 px-1.5 mt-1">
              <div className="w-5 h-5 rounded-md border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 shrink-0">
                <Plus className="w-3.5 h-3.5 stroke-2" />
              </div>
              <input
                ref={newItemInputRef}
                type="text"
                placeholder="List item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    handleAddChecklistItem(undefined, e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
                onFocus={() => {
                  if (activeItems.length === 0) {
                    handleAddChecklistItem();
                  }
                }}
                className="flex-1 text-sm sm:text-base text-neutral-900 placeholder:text-neutral-400 bg-transparent outline-none font-normal"
              />
            </div>

            {/* Completed Items Section */}
            {completedItems.length > 0 && (
              <div className="mt-6 pt-4 border-t border-neutral-200/60 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider cursor-pointer hover:text-neutral-800 transition-colors w-fit py-1"
                >
                  {showCompleted ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>
                    {completedItems.length} Completed {completedItems.length === 1 ? 'item' : 'items'}
                  </span>
                </button>

                {showCompleted && (
                  <div className="flex flex-col gap-1.5 pl-1 animate-in fade-in duration-150">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 py-1 px-1.5 rounded-xl hover:bg-neutral-100/60 transition-colors group opacity-60 hover:opacity-100"
                      >
                        {/* Checked Box */}
                        <button
                          type="button"
                          onClick={() => handleToggleItemCheck(item.id)}
                          className="w-5 h-5 rounded-md bg-neutral-900 border border-neutral-900 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                          title="Mark as uncompleted"
                        >
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        </button>

                        {/* Strikethrough Text */}
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => handleUpdateItemText(item.id, e.target.value)}
                          className="flex-1 text-sm sm:text-base line-through text-neutral-400 bg-transparent outline-none font-normal"
                        />

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(item.id)}
                          className="p-1 rounded-lg text-neutral-300 hover:text-neutral-800 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
