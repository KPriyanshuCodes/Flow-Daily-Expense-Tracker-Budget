import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, FileText, Check, Plus, Layers } from 'lucide-react';
import { Category, Expense } from '@/types';
import { AmountInput } from './AmountInput';
import { CategoryIcon } from './CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { getTodayFormatted, getYesterdayFormatted, formatDateFull, getMonthKey, formatMonthLabel } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePersonal?: (data: { amount: number; categoryId: string; date: string; note?: string }) => void;
  onSaveOther?: (data: { amount: number; name: string; date: string; note?: string }) => void;
  // Fallback single save handler if needed
  onSave?: (data: { amount: number; categoryId: string; date: string; note?: string; name?: string; isOther?: boolean }) => void;
  categories: Category[];
  editingExpense?: Expense | null;
  currency: string;
  initialCategoryId?: string;
  initialIsOther?: boolean;
  onCreateCategory?: (data: { name: string; icon: string; color: string }) => Category;
  title?: string;
  subtitle?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSavePersonal,
  onSaveOther,
  onSave,
  categories,
  editingExpense,
  currency,
  initialCategoryId,
  initialIsOther = false,
  onCreateCategory,
  title,
  subtitle,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  // expenseType: 'personal' or 'other'
  const [expenseType, setExpenseType] = useState<'personal' | 'other'>('personal');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [otherName, setOtherName] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayFormatted());
  const [note, setNote] = useState<string>('');

  const [amountError, setAmountError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [otherNameError, setOtherNameError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  // Sub-modal state for creating a new personal category
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newlyCreatedCatName, setNewlyCreatedCatName] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingExpense) {
      setAmountStr(editingExpense.amount.toString());
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');

      const isOtherItem =
        editingExpense.isOther ||
        editingExpense.id.startsWith('oth-') ||
        editingExpense.categoryId === 'other' ||
        !categories.some((c) => c.id === editingExpense.categoryId);

      if (isOtherItem) {
        setExpenseType('other');
        setSelectedCategoryId('');
        setOtherName(editingExpense.name || editingExpense.note || 'Other Expense');
      } else {
        setExpenseType('personal');
        setSelectedCategoryId(editingExpense.categoryId);
        setOtherName('');
      }
    } else {
      setAmountStr('');
      setDate(getTodayFormatted());
      setNote('');

      if (initialIsOther) {
        setExpenseType('other');
        setSelectedCategoryId('');
        setOtherName('');
      } else {
        setExpenseType('personal');
        const defaultCatId = initialCategoryId || categories.find((c) => c.isActive)?.id || '';
        setSelectedCategoryId(defaultCatId);
        setOtherName('');
      }
    }

    setAmountError('');
    setCategoryError('');
    setOtherNameError('');
    setDateError('');
    setIsCreatingCategory(false);
    setNewlyCreatedCatName(null);
  }, [editingExpense, isOpen, categories, initialCategoryId, initialIsOther]);

  if (!isOpen) return null;

  // For new personal expense, show active categories. When editing, also show the existing one.
  const visibleCategories = categories.filter(
    (c) => c.isActive || (editingExpense && c.id === editingExpense.categoryId)
  );

  const parsedCurrentAmount = parseFloat(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Validate amount
    const parsedAmount = parseFloat(amountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Please enter a valid positive amount.');
      hasError = true;
    } else {
      setAmountError('');
    }

    // Validate date
    const selectedDate = (date || '').trim();
    if (!selectedDate || isNaN(new Date(selectedDate).getTime())) {
      setDateError('Please select a valid date.');
      hasError = true;
    } else {
      setDateError('');
    }

    // Validate category or other name based on type
    if (expenseType === 'personal') {
      if (!selectedCategoryId) {
        setCategoryError('Please select a category or choose Other Expense.');
        hasError = true;
      } else {
        setCategoryError('');
      }
    } else {
      const trimmedName = otherName.trim();
      if (!trimmedName) {
        setOtherNameError('Please enter a name or description for this other expense.');
        hasError = true;
      } else {
        setOtherNameError('');
      }
    }

    if (hasError) return;

    if (expenseType === 'other') {
      const cleanName = otherName.trim();
      if (onSaveOther) {
        onSaveOther({
          amount: parsedAmount,
          name: cleanName,
          date: selectedDate,
          note: note.trim() || undefined,
        });
      } else if (onSave) {
        onSave({
          amount: parsedAmount,
          categoryId: 'other',
          date: selectedDate,
          name: cleanName,
          note: note.trim() || undefined,
          isOther: true,
        });
      }
    } else {
      if (onSavePersonal) {
        onSavePersonal({
          amount: parsedAmount,
          categoryId: selectedCategoryId,
          date: selectedDate,
          note: note.trim() || undefined,
        });
      } else if (onSave) {
        onSave({
          amount: parsedAmount,
          categoryId: selectedCategoryId,
          date: selectedDate,
          note: note.trim() || undefined,
          isOther: false,
        });
      }
    }

    onClose();
  };

  const today = getTodayFormatted();
  const yesterday = getYesterdayFormatted();

  const isEditingOther = editingExpense && (editingExpense.isOther || editingExpense.id.startsWith('oth-'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(28,25,23,0.12)] overflow-hidden border border-white/90 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-100 bg-white/60">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              {title || (editingExpense ? (isEditingOther ? 'Edit Other Expense' : 'Edit Personal Expense') : 'Add Expense')}
            </h2>
            <p className="text-[11px] text-neutral-500 font-normal">
              {subtitle || (expenseType === 'other'
                ? 'Recorded separately · Excluded from Personal Spending'
                : 'Track towards your monthly personal budget')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
          {/* Step 1: Amount input */}
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

          {/* Step 2: Category Selector (Includes Personal Categories + Other Expense Option) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-700" />
                Category / Type
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

            {/* Category Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
              {/* Normal Personal Categories */}
              {visibleCategories.map((cat) => {
                const isSelected = expenseType === 'personal' && cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setExpenseType('personal');
                      setSelectedCategoryId(cat.id);
                      if (categoryError) setCategoryError('');
                      if (otherNameError) setOtherNameError('');
                      setNewlyCreatedCatName(null);
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-100 shadow-xs ring-1 ring-neutral-900'
                        : 'border-neutral-200/60 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform bg-neutral-100 border border-neutral-200/50 text-neutral-800">
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

              {/* Special "Other Expense" Option Tile */}
              <button
                type="button"
                onClick={() => {
                  setExpenseType('other');
                  setSelectedCategoryId('');
                  if (categoryError) setCategoryError('');
                  setNewlyCreatedCatName(null);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all text-center cursor-pointer ${
                  expenseType === 'other'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs ring-1 ring-neutral-900'
                    : 'border-neutral-200/70 bg-white hover:bg-neutral-50 text-neutral-800'
                }`}
                title="Log as an Other Expense (separate from personal budget)"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-colors ${
                    expenseType === 'other'
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 border border-neutral-200/60 text-neutral-800'
                  }`}
                >
                  <Layers className="w-4 h-4 stroke-2" />
                </div>
                <span
                  className={`text-xs font-semibold truncate w-full ${
                    expenseType === 'other' ? 'text-white font-bold' : 'text-neutral-900'
                  }`}
                >
                  Other Expense
                </span>
              </button>

              {/* + Add New Category Tile */}
              {onCreateCategory && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-dashed border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900 transition-all text-center cursor-pointer group"
                  title="Create custom category"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 bg-neutral-100 border border-neutral-200 text-neutral-500 group-hover:text-neutral-900 shadow-2xs transition-colors">
                    <Plus className="w-4 h-4 stroke-2" />
                  </div>
                  <span className="text-xs font-semibold truncate w-full text-neutral-600 group-hover:text-neutral-900">
                    + New Cat
                  </span>
                </button>
              )}
            </div>

            {/* Notification when a personal category is newly created */}
            {newlyCreatedCatName && (
              <div className="mt-2 text-xs font-semibold text-neutral-900 bg-neutral-100 px-3 py-1.5 rounded-xl border border-neutral-200 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-neutral-900 stroke-2 shrink-0" />
                <span>Created & selected "{newlyCreatedCatName}"</span>
              </div>
            )}
          </div>

          {/* Conditional Input based on Expense Type */}
          {expenseType === 'other' ? (
            /* When Other Expense is selected: Simple expense name/description (no normal category required) */
            <div className="p-3.5 bg-neutral-50/90 rounded-2xl border border-neutral-200/80 flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-700" />
                  Expense Name / Description <span className="text-neutral-500 font-normal">*</span>
                </label>
                <span className="text-[10px] font-medium text-neutral-500 bg-white px-2 py-0.5 rounded-full border border-neutral-200/60">
                  Other Expense
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. Loan repayment, freelance supply, business lunch"
                value={otherName}
                onChange={(e) => {
                  setOtherName(e.target.value);
                  if (otherNameError) setOtherNameError('');
                }}
                maxLength={80}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition-colors ${
                  otherNameError ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-neutral-200 focus:border-neutral-900'
                }`}
                autoFocus={!editingExpense}
              />
              {otherNameError && (
                <p className="text-neutral-800 text-xs font-medium">{otherNameError}</p>
              )}
              <p className="text-[11px] text-neutral-500 leading-normal">
                This transaction will be recorded separately as an Other Expense and will not affect Personal Spending.
              </p>
            </div>
          ) : (
            /* When Personal Expense is selected: Optional Note */
            <div>
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-700" />
                Optional Note
              </label>
              <input
                type="text"
                placeholder="e.g. Weekly milk, market groceries, dinner"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={80}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
              />
            </div>
          )}

          {/* Step 3: Date Selector with Previous Date Support */}
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
                    <span className="text-neutral-700 font-medium">Today</span>
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

          {/* Step 4: Actions */}
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
              className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-2" />
              {editingExpense
                ? `Update ${expenseType === 'other' ? 'Other Expense' : 'Expense'}${parsedCurrentAmount > 0 ? ` (${formatCurrency(parsedCurrentAmount, currency)})` : ''}`
                : `Save ${expenseType === 'other' ? 'Other Expense' : 'Expense'}`}
            </button>
          </div>
        </form>
      </div>

      {/* Sub-modal: Create Custom Personal Category without losing expense draft */}
      {isCreatingCategory && onCreateCategory && (
        <CategoryModal
          isOpen={isCreatingCategory}
          zIndex="z-60"
          onClose={() => setIsCreatingCategory(false)}
          onSave={(catData) => {
            const created = onCreateCategory(catData);
            if (created && created.id) {
              setExpenseType('personal');
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

export default ExpenseModal;
