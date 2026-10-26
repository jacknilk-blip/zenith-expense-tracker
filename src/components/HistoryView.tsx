import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldAlert, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { Transaction, CategoryKey, UserProfile } from '../types';
import { formatMoney } from '../utils/finance';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface HistoryViewProps {
  transactions: Transaction[];
  currentMonth: string;
  profile: UserProfile;
  isAmountsHidden: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  language: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  currentMonth,
  profile,
  isAmountsHidden,
  onSelectTransaction,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyWastage, setOnlyWastage] = useState(false);
  const [filterMonthScope, setFilterMonthScope] = useState<'current' | 'all'>('current');

  // Filter pipeline
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (tx.sync_status === 'deleted') return false;

      // Month scope
      if (filterMonthScope === 'current' && !tx.date.startsWith(currentMonth)) {
        return false;
      }

      // Wastage filter
      if (onlyWastage && tx.wastage_tag !== 'waste') {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNote = (tx.note || '').toLowerCase().includes(q);
        const matchesCategory = t.categories[tx.category]?.toLowerCase().includes(q);
        const matchesAmount = String(tx.amount).includes(q);
        const matchesCurrency = tx.currency.toLowerCase().includes(q);
        if (!matchesNote && !matchesCategory && !matchesAmount && !matchesCurrency) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentMonth, filterMonthScope, onlyWastage, selectedCategory, searchQuery, t.categories]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filteredTransactions) {
      const existing = map.get(tx.date) || [];
      existing.push(tx);
      map.set(tx.date, existing);
    }
    return Array.from(map.entries());
  }, [filteredTransactions]);

  const allCategories: CategoryKey[] = [
    'food_meals',
    'transport',
    'shopping',
    'utilities',
    'entertainment',
    'salary',
    'business',
    'freelance',
    'others',
  ];

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.history.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 text-xs rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="p-1 rounded-full text-slate-400 hover:text-white absolute right-3 top-2.5 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips & Scope Toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Month Scope Toggle */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setFilterMonthScope('current')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                filterMonthScope === 'current'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {currentMonth}
            </button>
            <button
              type="button"
              onClick={() => setFilterMonthScope('all')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                filterMonthScope === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Wastage Only Filter Button */}
          <button
            type="button"
            onClick={() => setOnlyWastage(!onlyWastage)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shrink-0 border transition-all cursor-pointer ${
              onlyWastage
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.history.filterWastageOnly}</span>
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap border transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.history.allCategories}
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.categories[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List Counter */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
        <span>{filteredTransactions.length} {t.history.totalEntries}</span>
        {onlyWastage && (
          <span className="text-rose-400 font-medium">Filtering Wastage Only</span>
        )}
      </div>

      {/* Grouped Transaction List */}
      {groupedByDate.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center">
          <p className="text-xs text-slate-500">{t.history.noResults}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 px-1 block">
                {dateStr}
              </span>
              <div className="space-y-2">
                {items.map(tx => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => onSelectTransaction(tx)}
                    className="w-full p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between text-left active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-semibold text-white block truncate">
                          {tx.note || t.categories[tx.category]}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <span>{t.categories[tx.category]}</span>
                          <span aria-hidden="true">·</span>
                          <span>{tx.currency}</span>
                          {tx.wastage_tag === 'waste' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-rose-400 font-semibold">{t.wastageTags.waste}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-bold tabular-nums shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount, tx.currency, false, isAmountsHidden)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
