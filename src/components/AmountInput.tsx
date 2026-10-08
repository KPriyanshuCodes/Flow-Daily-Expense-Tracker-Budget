import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: string;
  error?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currency,
  error,
}) => {
  const quickIncrements = [5, 25, 50, 75, 100, 150, 500];

  const handleQuickAdd = (increment: number) => {
    const current = parseFloat(value) || 0;
    const newAmount = Math.round((current + increment) * 100) / 100;
    onChange(newAmount.toString());
  };

  return (
    <div className="flex flex-col items-center">
      <label className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-2">
        Expense Amount
      </label>
      <div className="relative flex items-center justify-center w-full max-w-xs">
        <span className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mr-2 select-none font-mono">
          {currency}
        </span>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full text-center text-4xl sm:text-5xl font-extrabold text-[#1A1A1A] placeholder-[#C0C0BA] bg-transparent border-b-2 py-2 outline-none font-mono tabular-nums transition-all ${
            error
              ? 'border-[#C47A2C] text-[#1A1A1A]'
              : 'border-[#E5E5E2] focus:border-[#C47A2C]'
          }`}
          autoFocus
        />
      </div>

      {error && <p className="text-[#C47A2C] text-xs font-medium mt-1.5">{error}</p>}

      {/* Quick Increment Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3.5">
        {quickIncrements.map((inc) => (
          <button
            key={inc}
            type="button"
            onClick={() => handleQuickAdd(inc)}
            className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-[#FAFAF8] hover:bg-[#C47A2C] hover:text-white text-[#1A1A1A] border border-[#E5E5E2] shadow-2xs transition-all cursor-pointer"
          >
            +{inc}
          </button>
        ))}
      </div>
    </div>
  );
};
