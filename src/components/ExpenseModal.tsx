import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, FileText, Check, Plus } from 'lucide-react';
import { Category, Expense } from '@/types';
import { AmountInput } from './AmountInput';
import { CategoryIcon } from './CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { getTodayFormatted, getYesterdayFormatted, formatDateFull, getMonthKey, formatMonthLabel } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { amount: number; categoryId: string; date: string; note?: string }) => void;
  categories: Category[];
  editingExpense?: Expense | null;
  currency: string;
  initialCategoryId?: string;
  onCreateCategory?: (data: { name: string; icon: string; color: string }) => Category;
  title?: string;
  subtitle?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingExpense,
  currency,
  initialCategoryId,
  onCreateCategory,
  title,
  subtitle,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayFormatted());
  const [note, setNote] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  // Create another category state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newlyCreatedCatName, setNewlyCreatedCatName] = useState<string | null>(null);

  useEffect(() => {
    if (editingExpense) {
      setAmountStr(editingExpense.amount.toString());
      setSelectedCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
    } else {
      setAmountStr('');
      const defaultCatId = initialCategoryId || categories.find((c) => c.isActive)?.id || '';
      setSelectedCategoryId(defaultCatId);
      setDate(getTodayFormatted());
      setNote('');
    }
    setAmountError('');
    setCategoryError('');
    setDateError('');
    setIsCreatingCategory(false);
    setNewlyCreatedCatName(null);
  }, [editingExpense, isOpen, categories, initialCategoryId]);

  if (!isOpen) return null;

  // For new expense, show only active categories. For editing, also allow the existing category.
  const visibleCategories = categories.filter(
    (c) => c.isActive || (editingExpense && c.id === editingExpense.categoryId)
  );

  const parsedCurrentAmount = parseFloat(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Please enter a valid positive amount.');
      hasError = true;
    } else {
      setAmountError('');
    }

    if (!selectedCategoryId) {
      setCategoryError('Please select a category or create a new one.');
      hasError = true;
    } else {
      setCategoryError('');
    }

    const selectedDate = (date || '').trim();
    if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
      setDateError('Please select a valid date.');
      hasError = true;
    } else {
      setDateError('');
    }

    if (hasError) return;

    onSave({
      amount: parsedAmount,
      categoryId: selectedCategoryId,
      date: selectedDate,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const today = getTodayFormatted();
  const yesterday = getYesterdayFormatted();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(28,25,23,0.12)] overflow-hidden border border-white/90 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/60">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              {title || (editingExpense ? 'Edit Expense' : 'Add New Expense')}
            </h2>
            {(subtitle || editingExpense) && (
              <p className="text-[11px] text-neutral-500 font-normal">
                {subtitle || (editingExpense ? 'Manually edit amount and details' : 'Enter amount and details')}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex flex-col gap-5">
          {/* Normal Amount input */}
          <div className="flex flex-col">
            <AmountInput
              value={amountStr}
              onChange={(val) => {
                setAmountStr(val);
                if (amountError) setAmountError('');
              }}
              currency={currency}
              error={amountError}
            />
          </div>

          {/* Category Picker Section with Create Option */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-700" />
                Select Category
              </label>
              <div className="flex items-center gap-2">
                {categoryError && (
                  <span className="text-[11px] font-medium text-neutral-800">{categoryError}</span>
                )}
                {onCreateCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="text-xs font-semibold text-neutral-900 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-neutral-200"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-2" />
                    <span>New Category</span>
                  </button>
                )}
              </div>
            </div>

            {visibleCategories.length === 0 ? (
              <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-center flex flex-col items-center">
                <p className="text-xs text-neutral-700 font-medium mb-2">
                  No active categories available.
                </p>
                {onCreateCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-2" />
                    Create First Category
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                {visibleCategories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (categoryError) setCategoryError('');
                        setNewlyCreatedCatName(null);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-100 shadow-xs ring-1 ring-neutral-900'
                          : 'border-neutral-200/60 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform bg-neutral-100 border border-neutral-200/50 text-neutral-800"
                      >
                        <CategoryIcon name={cat.icon} size={16} />
                      </div>
                      <span
                        className={`text-xs font-semibold truncate w-full ${
                          isSelected ? 'text-neutral-900 font-bold' : 'text-neutral-700'
                        }`}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}

                {/* + Add New Category Card inside grid */}
                {onCreateCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 transition-all text-center cursor-pointer group"
                    title="Create another category"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 bg-neutral-100 border border-neutral-200 text-neutral-500 group-hover:text-neutral-900 shadow-2xs transition-colors">
                      <Plus className="w-4 h-4 stroke-2" />
                    </div>
                    <span className="text-xs font-semibold truncate w-full text-neutral-600 group-hover:text-neutral-900">
                      + Add New
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Notification when a category is newly created */}
            {newlyCreatedCatName && (
              <div className="mt-2 text-xs font-semibold text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-neutral-900 stroke-2 shrink-0" />
                <span>Created & selected "{newlyCreatedCatName}"</span>
              </div>
            )}
          </div>

          {/* Date Selector with Previous Date Support */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-700" />
                Expense Date
              </label>
              {date !== today && (
                <span className="text-[10px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200">
                  {date === yesterday ? 'Yesterday' : 'Past Date'}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDate(today);
                    if (dateError) setDateError('');
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    date === today
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDate(yesterday);
                    if (dateError) setDateError('');
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    date === yesterday
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  Yesterday
                </button>

                {/* Native Date Picker allowing any previous date */}
                <div className="relative flex-1">
                  <input
                    type="date"
                    max={today}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      if (dateError) setDateError('');
                    }}
                    className={`w-full px-3 py-1.5 text-xs font-semibold rounded-xl border bg-white text-neutral-900 focus:outline-none transition-colors cursor-pointer ${
                      dateError
                        ? 'border-neutral-900'
                        : date !== today && date !== yesterday
                        ? 'border-neutral-900 ring-1 ring-neutral-900/20 text-neutral-900'
                        : 'border-neutral-200 focus:border-neutral-900'
                    }`}
                    title="Select any date"
                  />
                </div>
              </div>

              {/* Dynamic date feedback */}
              <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-normal">
                  <span>
                    Selected: <strong className="text-neutral-900 font-semibold">{formatDateFull(date || today)}</strong>
                  </span>
                  {date === today && (
                    <span className="text-neutral-700 font-medium">Today's Spend</span>
                  )}
                </div>

                {/* Previous month indicator notice */}
                {date && getMonthKey(date) !== getMonthKey() && (
                  <div className="text-[11px] font-medium text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                    <Calendar className="w-3 h-3 shrink-0 text-neutral-700" />
                    <span>
                      Recording for {formatMonthLabel(getMonthKey(date))} (will appear in {formatMonthLabel(getMonthKey(date))} spending)
                    </span>
                  </div>
                )}
              </div>

              {dateError && (
                <p className="text-neutral-700 text-xs font-medium">{dateError}</p>
              )}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5 text-neutral-700" />
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Milk, grocery trip, lunch"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={80}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={visibleCategories.length === 0}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-2" />
              {editingExpense
                ? `Update Expense (${formatCurrency(parsedCurrentAmount, currency)})`
                : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>

      {/* Sub-modal: Create Another Category without losing expense draft */}
      {isCreatingCategory && onCreateCategory && (
        <CategoryModal
          isOpen={isCreatingCategory}
          zIndex="z-60"
          onClose={() => setIsCreatingCategory(false)}
          onSave={(catData) => {
            const created = onCreateCategory(catData);
            if (created && created.id) {
              setSelectedCategoryId(created.id);
              setNewlyCreatedCatName(created.name);
              if (categoryError) setCategoryError('');
            }
            setIsCreatingCategory(false);
          }}
        />
      )}
    </div>
  );
};
