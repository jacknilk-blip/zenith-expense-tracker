import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ArrowDownLeft, ArrowUpRight, Sparkles, AlertCircle, History, Delete } from 'lucide-react';
import { Transaction, TransactionType, Currency, CategoryKey, WastageTag, UserProfile } from '../types';
import { generateUUID, sanitizeString } from '../utils/security';
import { CURRENCY_SYMBOLS, formatMoney } from '../utils/finance';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface QuickEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  initialTransaction?: Transaction | null;
  recentTransactions?: Transaction[];
  profile: UserProfile;
  language: Language;
}

const PRESET_CHIPS = [
  { label: '☕ Coffee', type: 'expense' as const, category: 'food_meals' as CategoryKey, tag: 'optional' as WastageTag, amount: 75, note: 'Daily Brew' },
  { label: '🍜 Meal', type: 'expense' as const, category: 'food_meals' as CategoryKey, tag: 'essential' as WastageTag, amount: 120, note: 'Daily Lunch/Dinner' },
  { label: '🚕 Grab/Bolt', type: 'expense' as const, category: 'transport' as CategoryKey, tag: 'optional' as WastageTag, amount: 160, note: 'Ride Hailing' },
  { label: '🧋 Snack', type: 'expense' as const, category: 'food_meals' as CategoryKey, tag: 'waste' as WastageTag, amount: 95, note: 'Impulse Boba/Snack' },
  { label: '🛒 Groceries', type: 'expense' as const, category: 'shopping' as CategoryKey, tag: 'essential' as WastageTag, amount: 450, note: 'Supermarket supplies' },
  { label: '💼 Salary', type: 'income' as const, category: 'salary' as CategoryKey, tag: 'essential' as WastageTag, amount: 35000, note: 'Main Monthly Salary (အဓိကလစာ)' },
];

export const QuickEntrySheet: React.FC<QuickEntrySheetProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTransaction,
  recentTransactions = [],
  profile,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const [type, setType] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState<string>('0');
  const [currency, setCurrency] = useState<Currency>(profile.base_currency || 'THB');
  const [category, setCategory] = useState<CategoryKey>('food_meals');
  const [wastageTag, setWastageTag] = useState<WastageTag>('essential');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  
  const [showKeypad, setShowKeypad] = useState<boolean>(true);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setRawAmount(String(initialTransaction.amount));
      setCurrency(initialTransaction.currency);
      setCategory(initialTransaction.category);
      setWastageTag(initialTransaction.wastage_tag);
      setNote(initialTransaction.note);
      setDate(initialTransaction.date);
    } else {
      setType('expense');
      setRawAmount('0');
      setCurrency(profile.base_currency || 'THB');
      setCategory('food_meals');
      setWastageTag('essential');
      setNote('');
      setDate(new Date().toISOString().substring(0, 10));
    }
    setErrorAlert(null);
  }, [initialTransaction, isOpen, profile.base_currency]);

  if (!isOpen) return null;

  // Keypad handling
  const handleKeyClick = (key: string) => {
    setErrorAlert(null);
    if (key === 'clear') {
      setRawAmount('0');
      return;
    }
    if (key === 'backspace') {
      if (rawAmount.length <= 1) {
        setRawAmount('0');
      } else {
        setRawAmount(rawAmount.slice(0, -1));
      }
      return;
    }
    if (key === '.') {
      if (currency === 'MMK') return; // MMK does not use decimals
      if (!rawAmount.includes('.')) {
        setRawAmount(rawAmount + '.');
      }
      return;
    }
    // Append digit
    if (rawAmount === '0') {
      setRawAmount(key);
    } else {
      // Limit to 9 digits
      if (rawAmount.replace('.', '').length < 9) {
        setRawAmount(rawAmount + key);
      }
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_CHIPS[0]) => {
    setType(preset.type);
    setCategory(preset.category);
    setWastageTag(preset.tag);
    setRawAmount(String(preset.amount));
    setNote(preset.note);
  };

  const handleApplyRecent = (tx: Transaction) => {
    setType(tx.type);
    setCategory(tx.category);
    setWastageTag(tx.wastage_tag);
    setRawAmount(String(tx.amount));
    setCurrency(tx.currency);
    setNote(tx.note);
  };

  const handleSave = () => {
    const num = parseFloat(rawAmount);
    if (isNaN(num) || num <= 0) {
      setErrorAlert(t.entry.invalidAmountAlert);
      return;
    }

    const cleanNote = sanitizeString(note);
    if (type === 'income' && (!cleanNote || cleanNote.trim().length === 0)) {
      setErrorAlert(t.entry.requiredNoteAlert);
      return;
    }

    const txToSave: Transaction = {
      id: initialTransaction ? initialTransaction.id : generateUUID(),
      user_id: profile.email ? profile.id : null,
      date,
      type,
      amount: num,
      currency,
      category,
      wastage_tag: type === 'income' ? 'essential' : wastageTag,
      note: cleanNote,
      updated_at: new Date().toISOString(),
      sync_status: 'pending',
    };

    onSave(txToSave);
    onClose();
  };

  // Format live displayed amount
  const displayAmount = () => {
    const parts = rawAmount.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    const formattedInteger = Number(integerPart || 0).toLocaleString();
    return `${formattedInteger}${decimalPart}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[32px] bg-slate-900 border-t border-slate-800 text-white shadow-2xl p-5 pb-8 animate-in slide-in-from-bottom duration-200">
        
        {/* Grab Handle */}
        <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">
              {initialTransaction ? t.entry.editTitle : t.entry.addTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Segmented Switcher (Expense / Income) */}
        <div className="flex rounded-2xl bg-slate-950 p-1 mb-4 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
            <span>{t.entry.expense}</span>
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>{t.entry.income}</span>
          </button>
        </div>

        {/* Amount & Currency Live Display */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4 text-center relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t.entry.amount}
            </span>
            {/* Currency Selector */}
            <div className="flex gap-1">
              {(['THB', 'MMK', 'USD'] as Currency[]).map(cur => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => setCurrency(cur)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    currency === cur
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="py-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white">
              {CURRENCY_SYMBOLS[currency]} {displayAmount()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowKeypad(!showKeypad)}
            className="text-[11px] text-emerald-400 hover:underline inline-block mt-1 cursor-pointer"
          >
            {showKeypad ? 'Hide Keypad' : 'Show Keypad'}
          </button>
        </div>

        {/* Error Alert */}
        {errorAlert && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorAlert}</span>
          </div>
        )}

        {/* Built-in Mobile Numeric Keypad */}
        {showKeypad && (
          <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
            {['1', '2', '3'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(k)}
                className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyClick('clear')}
              className="h-11 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              C
            </button>

            {['4', '5', '6'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(k)}
                className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyClick('backspace')}
              className="h-11 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              aria-label="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>

            {['7', '8', '9'].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(k)}
                className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleKeyClick('00')}
              className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              00
            </button>

            <button
              type="button"
              onClick={() => handleKeyClick('.')}
              disabled={currency === 'MMK'}
              className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-20 cursor-pointer"
            >
              .
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('0')}
              className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-base hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleKeyClick('000')}
              className="h-11 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-slate-700 active:scale-95 transition-all cursor-pointer col-span-2"
            >
              000
            </button>
          </div>
        )}

        {/* 1-Tap Quick Preset Chips */}
        {!initialTransaction && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              {t.entry.quickPresets}
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(chip)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs whitespace-nowrap border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wastage Classification (Essential, Optional, Waste) */}
        {type === 'expense' && (
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              {t.entry.wastageTag}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWastageTag('essential')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                  wastageTag === 'essential'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.wastageTags.essential}
              </button>

              <button
                type="button"
                onClick={() => setWastageTag('optional')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                  wastageTag === 'optional'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.wastageTags.optional}
              </button>

              <button
                type="button"
                onClick={() => setWastageTag('waste')}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                  wastageTag === 'waste'
                    ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.wastageTags.waste}
              </button>
            </div>
          </div>
        )}

        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            {t.entry.category}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                'food_meals',
                'transport',
                'shopping',
                'utilities',
                'entertainment',
                'salary',
                'business',
                'freelance',
                'others',
              ] as CategoryKey[]
            ).map(catKey => (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                className={`py-2 px-2 rounded-xl text-[11px] font-medium truncate text-center border transition-all cursor-pointer ${
                  category === catKey
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.categories[catKey]}
              </button>
            ))}
          </div>
        </div>

        {/* Note / Income Reason (Required for income) */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            {t.entry.note}{' '}
            {type === 'income' && (
              <span className="text-amber-400">({language === 'my' ? 'မဖြစ်မနေ ဖြည့်ရန်' : 'Required'})</span>
            )}
          </label>
          <input
            type="text"
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              type === 'income'
                ? t.entry.noteIncomePlaceholder
                : t.entry.noteExpensePlaceholder
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            {t.entry.date}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Repeat Recent Transactions */}
        {!initialTransaction && recentTransactions.length > 0 && (
          <div className="mb-5">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-2">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.entry.repeatRecent}</span>
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {recentTransactions.slice(0, 3).map(tx => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => handleApplyRecent(tx)}
                  className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-left text-xs transition-colors cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <span className="text-slate-200 font-medium block truncate">
                      {tx.note || t.categories[tx.category]}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {t.categories[tx.category]} · {tx.date}
                    </span>
                  </div>
                  <span className={`font-semibold tabular-nums shrink-0 ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, tx.currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{initialTransaction ? t.entry.update : t.entry.save}</span>
          </button>

          {initialTransaction && onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this transaction?')) {
                  onDelete(initialTransaction.id);
                  onClose();
                }
              }}
              className="w-full py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.entry.delete}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
