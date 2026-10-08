import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, FileText, Check, Plus } from 'lucide-react';
import { Category, Expense } from '@/types';
import { AmountInput } from './AmountInput';
import { CategoryIcon } from './CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { getTodayFormatted, getYesterdayFormatted, formatDateFull } from '@/utils/date';

interface OtherExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    name?: string;
    categoryId?: string;
    date: string;
    note?: string;
  }) => void;
  otherCategories: Category[];
  editingExpense?: Expense | null;
  currency: string;
  initialCategoryId?: string;
  onCreateCategory: (data: { name: string; icon: string; color: string }) => Category;
}

export const OtherExpenseModal: React.FC<OtherExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  otherCategories,
  editingExpense,
  currency,
  initialCategoryId,
  onCreateCategory,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayFormatted());
  const [note, setNote] = useState<string>('');

  const [amountError, setAmountError] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');

  // Sub-modal for creating a new other category
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingExpense) {
      setAmountStr(editingExpense.amount.toString());
      // Only set custom name if it was explicitly different from category name
      setName(editingExpense.name && editingExpense.name !== editingExpense.categoryName ? editingExpense.name : '');
      setSelectedCategoryId(editingExpense.categoryId || '');
      setDate(editingExpense.date);
      setNote(editingExpense.note || '');
    } else {
      setAmountStr('');
      setName('');
      setSelectedCategoryId(initialCategoryId || (otherCategories[0]?.id ?? ''));
      setDate(getTodayFormatted());
      setNote('');
    }

    setAmountError('');
    setCategoryError('');
    setDateError('');
    setIsCreatingCategory(false);
  }, [editingExpense, isOpen, otherCategories, initialCategoryId]);

  if (!isOpen) return null;

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
      setCategoryError('Please select a category for this expense.');
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

    const trimmedName = name.trim();

    onSave({
      amount: parsedAmount,
      name: trimmedName || undefined,
      categoryId: selectedCategoryId,
      date: selectedDate,
      note: note.trim() || undefined,
    });

    onClose();
  };

  const today = getTodayFormatted();
  const yesterday = getYesterdayFormatted();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#FFFFFF] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-[#EAEAEA] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#EAEAEA] bg-[#FAFAF8]">
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A] tracking-tight">
              {editingExpense ? 'Edit Other Expense' : 'Add Other Expense'}
            </h2>
            <p className="text-[11px] text-[#8A8A8A] font-normal">
              Recorded separately · Not counted in Personal Spending
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F0F0ED] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 flex flex-col gap-4">
          {/* Amount Input */}
          <AmountInput
            value={amountStr}
            onChange={(val) => {
              setAmountStr(val);
              if (amountError) setAmountError('');
            }}
            currency={currency}
            error={amountError}
          />

          {/* Name / Description (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                Expense Name / Description
              </label>
              <span className="text-[11px] text-[#8A8A8A] font-normal">Optional</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Flight ticket, Birthday gift (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#E5E5E2] focus:border-[#C47A2C] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#A0A09A] focus:outline-none transition-colors"
            />
          </div>

          {/* Other Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCategory(true)}
                className="text-xs font-semibold text-[#1A1A1A] hover:text-black flex items-center gap-1 cursor-pointer bg-[#FAFAF8] hover:bg-[#F0F0ED] px-2.5 py-1 rounded-xl border border-[#E5E5E2]"
              >
                <Plus className="w-3.5 h-3.5 stroke-2 text-[#C47A2C]" />
                <span>New Category</span>
              </button>
            </div>

            {otherCategories.length === 0 ? (
              <div className="p-3 rounded-xl border border-[#EAEAEA] bg-[#FAFAF8] flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">No categories created yet</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-xs font-semibold text-[#C47A2C] underline cursor-pointer"
                >
                  + Create First Category
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
                {otherCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (categoryError) setCategoryError('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-[#C47A2C] bg-[#C47A2C]/10 ring-1 ring-[#C47A2C] text-[#C47A2C]'
                          : 'border-[#EBEBE8] bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#C47A2C] text-white' : 'bg-[#FFFFFF] border border-[#E5E5E2] text-[#1A1A1A]'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} size={14} />
                      </div>
                      <span className="text-xs font-semibold truncate flex-1">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {categoryError && <p className="text-[#C47A2C] text-xs font-medium mt-1">{categoryError}</p>}
          </div>

          {/* Date Selector */}
          <div>
            <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1.5">
              Date
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  setDate(today);
                  if (dateError) setDateError('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  date === today
                    ? 'bg-[#C47A2C] text-white shadow-xs'
                    : 'bg-[#FAFAF8] text-[#1A1A1A] hover:bg-[#F2F2EF] border border-[#E5E5E2]'
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  date === yesterday
                    ? 'bg-[#C47A2C] text-white shadow-xs'
                    : 'bg-[#FAFAF8] text-[#1A1A1A] hover:bg-[#F2F2EF] border border-[#E5E5E2]'
                }`}
              >
                Yesterday
              </button>
            </div>

            <div className="relative">
              <Calendar className="w-4 h-4 text-[#C47A2C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (dateError) setDateError('');
                }}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-[#FAFAF8] text-[#1A1A1A] focus:outline-none transition-colors cursor-pointer ${
                  dateError ? 'border-[#C47A2C]' : 'border-[#E5E5E2] focus:border-[#C47A2C]'
                }`}
              />
            </div>
            {date && (
              <p className="text-[11px] text-[#8A8A8A] mt-1 pl-1">
                {formatDateFull(date)}
              </p>
            )}
            {dateError && <p className="text-[#C47A2C] text-xs font-medium mt-1">{dateError}</p>}
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider block mb-1.5">
              Additional Note (Optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-[#C47A2C] absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                placeholder="Optional notes or details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E5E5E2] bg-[#FAFAF8] text-[#1A1A1A] placeholder-[#A0A09A] focus:outline-none focus:border-[#C47A2C] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#8A8A8A] bg-[#FAFAF8] hover:bg-[#F2F2EF] hover:text-[#1A1A1A] border border-[#E5E5E2] transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#C47A2C] hover:bg-[#B36E25] shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Check className="w-4 h-4" />
              <span>{editingExpense ? 'Save Changes' : 'Save Other Expense'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sub-modal: Create New Other Category */}
      <CategoryModal
        isOpen={isCreatingCategory}
        onClose={() => setIsCreatingCategory(false)}
        onSave={(catData) => {
          const created = onCreateCategory(catData);
          setSelectedCategoryId(created.id);
          setIsCreatingCategory(false);
        }}
        zIndex="z-[70]"
      />
    </div>
  );
};
