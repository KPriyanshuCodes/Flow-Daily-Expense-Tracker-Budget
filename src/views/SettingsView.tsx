import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Category, Expense, Settings, Todo } from '@/types';
import { formatCurrency } from '@/utils/currency';
import { AppLogo } from '@/components/AppLogo';

interface SettingsViewProps {
  settings: Settings;
  onSetCurrency?: (currency: string) => void;
  onResetAllData: () => void;
  categories: Category[];
  expenses: Expense[];
  otherExpenses?: Expense[];
  todos?: Todo[];
  onManageCategories?: () => void;
  onOpenOtherExpenses?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onResetAllData,
  categories,
  expenses,
  otherExpenses = [],
  todos = [],
  onManageCategories,
  onOpenOtherExpenses,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalLifetimeSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportData = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      categories,
      expenses,
      otherExpenses,
      todos,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.categories && parsed.expenses) {
          localStorage.setItem('dailyspend_categories_v1', JSON.stringify(parsed.categories));
          localStorage.setItem('dailyspend_expenses_v1', JSON.stringify(parsed.expenses));
          if (parsed.otherExpenses) {
            localStorage.setItem('dailyspend_other_expenses_v1', JSON.stringify(parsed.otherExpenses));
          }
          if (parsed.todos) {
            localStorage.setItem('dailyspend_todos_v1', JSON.stringify(parsed.todos));
          }
          if (parsed.settings) {
            localStorage.setItem('dailyspend_settings_v1', JSON.stringify(parsed.settings));
          }
          showToast('Data imported successfully! Reloading...');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 border border-[#2B2B2B]">
          <CheckCircle2 className="w-4 h-4 text-[#C47A2C]" />
          {toastMessage}
        </div>
      )}

      {/* App Branding Card with Logo */}
      <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4">
        <AppLogo className="w-13 h-13 shadow-xs" />
        <div className="flex flex-col">
          <h2 className="text-base font-extrabold text-[#1A1A1A] tracking-tight leading-snug lowercase">
            flow
          </h2>
          <p className="text-xs text-[#8A8A8A] font-normal">
            Personal Expense Tracker
          </p>
        </div>
      </div>

      {/* Category Management Card */}
      {onManageCategories && (
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center text-[#C47A2C]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
                Manage Categories
              </h3>
              <p className="text-xs text-[#8A8A8A] font-normal">
                {categories.length} total categories ({categories.filter((c) => c.isActive).length} active)
              </p>
            </div>
          </div>
          <button
            onClick={onManageCategories}
            className="px-3.5 py-2 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95 min-h-[40px]"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Other Expenses Access Card */}
      {onOpenOtherExpenses && otherExpenses.length > 0 && (
        <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAFAF8] border border-[#E5E5E2] flex items-center justify-center text-[#C47A2C]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
                Other Expenses
              </h3>
              <p className="text-xs text-[#8A8A8A] font-normal">
                {otherExpenses.length} entries recorded outside monthly budget
              </p>
            </div>
          </div>
          <button
            onClick={onOpenOtherExpenses}
            className="px-3.5 py-2 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A] border border-[#E5E5E2] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 active:scale-95 min-h-[40px]"
          >
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Storage & Lifetime Stats in Light Glass */}
      <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#C47A2C]" />
          <h3 className="font-bold text-xs text-[#1A1A1A] uppercase tracking-wider">
            Data Storage
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-[#FAFAF8] rounded-2xl p-3 text-center border border-[#E5E5E2]">
            <span className="text-[11px] text-[#8A8A8A] font-medium block">Categories</span>
            <span className="text-lg font-bold text-[#1A1A1A] mt-0.5 block font-mono">
              {categories.length}
            </span>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl p-3 text-center border border-[#E5E5E2]">
            <span className="text-[11px] text-[#8A8A8A] font-medium block">Monthly</span>
            <span className="text-lg font-bold text-[#1A1A1A] mt-0.5 block font-mono">
              {expenses.length}
            </span>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl p-3 text-center border border-[#E5E5E2]">
            <span className="text-[11px] text-[#8A8A8A] font-medium block">Other</span>
            <span className="text-lg font-bold text-[#1A1A1A] mt-0.5 block font-mono">
              {otherExpenses.length}
            </span>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl p-3 text-center border border-[#E5E5E2]">
            <span className="text-[11px] text-[#8A8A8A] font-medium block">To-Do Tasks</span>
            <span className="text-lg font-bold text-[#1A1A1A] mt-0.5 block font-mono">
              {todos.length}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#FAFAF8] rounded-2xl p-3 text-center border border-[#E5E5E2]">
            <span className="text-[11px] text-[#8A8A8A] font-medium block">Spent Total</span>
            <span className="text-sm sm:text-base font-bold text-[#1A1A1A] mt-0.5 block truncate font-mono">
              {formatCurrency(totalLifetimeSpent, settings.currency)}
            </span>
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            onClick={handleExportData}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A] text-xs font-semibold border border-[#E5E5E2] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#C47A2C]" />
            Export Backup (JSON)
          </button>

          <label className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#1A1A1A] text-xs font-semibold border border-[#E5E5E2] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-[#C47A2C]" />
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset All Data */}
      <div className="bg-[#FFFFFF] rounded-3xl p-5 border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-[#C47A2C]">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">
            Reset All Data
          </h3>
        </div>
        <p className="text-xs text-[#8A8A8A] leading-relaxed font-normal">
          Permanently clear all expense entries and reset categories.
        </p>

        {showResetConfirm ? (
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAFAF8] text-[#8A8A8A] text-xs font-semibold border border-[#E5E5E2] hover:bg-[#F2F2EF] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onResetAllData}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#C47A2C] hover:bg-[#B36E25] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Confirm Clear
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FAFAF8] hover:bg-[#F2F2EF] text-[#8A8A8A] hover:text-[#1A1A1A] text-xs font-semibold transition-colors cursor-pointer border border-[#E5E5E2]"
          >
            Clear All Data
          </button>
        )}
      </div>
    </div>
  );
};
