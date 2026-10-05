import React from 'react';
import { Pin, Trash2, Check, FileText, CheckSquare } from 'lucide-react';
import { Todo } from '@/types';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onTogglePin: (id: string) => void;
  onToggleCheck: (todoId: string, itemId: string) => void;
  onDelete: (id: string) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo,
  onEdit,
  onTogglePin,
  onToggleCheck,
  onDelete,
}) => {
  const isChecklist = todo.type === 'checklist';
  const checklistItems = todo.items || [];
  const completedCount = checklistItems.filter((i) => i.completed).length;
  const totalCount = checklistItems.length;

  // Show up to 5 checklist items on card to keep it compact
  const displayItems = checklistItems.slice(0, 5);
  const remainingCount = totalCount - displayItems.length;

  return (
    <div
      onClick={() => onEdit(todo)}
      className="group relative bg-white/75 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-neutral-300/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.04)] rounded-3xl p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer text-left overflow-hidden"
    >
      {/* Top Header: Title and Quick Actions */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isChecklist ? (
            <CheckSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          )}
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight truncate leading-snug">
            {todo.title}
          </h3>
        </div>

        {/* Pin and Delete Controls */}
        <div className="flex items-center gap-1 shrink-0 -mr-1 -mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(todo.id);
            }}
            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              todo.isPinned
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 opacity-60 group-hover:opacity-100'
            }`}
            title={todo.isPinned ? 'Unpin task' : 'Pin to top'}
          >
            <Pin className={`w-3.5 h-3.5 ${todo.isPinned ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body: Text or Checklist */}
      <div className="flex-1 mb-3">
        {isChecklist ? (
          <div className="flex flex-col gap-1.5">
            {displayItems.map((item) => (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCheck(todo.id, item.id);
                }}
                className="flex items-start gap-2 py-0.5 group/item cursor-pointer text-left"
              >
                <div
                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    item.completed
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'border-neutral-300 group-hover/item:border-neutral-800 bg-white'
                  }`}
                >
                  {item.completed && <Check className="w-2.5 h-2.5 stroke-3" />}
                </div>
                <span
                  className={`text-xs leading-snug transition-colors line-clamp-2 ${
                    item.completed
                      ? 'line-through text-neutral-400'
                      : 'text-neutral-700 font-normal'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}

            {remainingCount > 0 && (
              <p className="text-[11px] text-neutral-400 font-medium pl-6 pt-0.5">
                +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-neutral-600 font-normal leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {todo.content || <span className="italic text-neutral-400">Empty note</span>}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100/80 text-[10px] text-neutral-400 font-medium">
        <span>
          {isChecklist ? (
            `${completedCount}/${totalCount} completed`
          ) : (
            new Date(todo.updatedAt || todo.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })
          )}
        </span>

        {isChecklist && totalCount > 0 && (
          <div className="w-14 h-1.5 rounded-full bg-neutral-100 overflow-hidden ml-2">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round((completedCount / totalCount) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
