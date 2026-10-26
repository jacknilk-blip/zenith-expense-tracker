import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, AlertTriangle, ChevronRight, ShieldAlert, Sparkles, PieChart } from 'lucide-react';
import { Transaction, UserProfile, Currency } from '../types';
import { calculateMonthlyOverview, calculateYearlyProjection, calculateWastageAnalysis, formatMoney, CURRENCY_SYMBOLS } from '../utils/finance';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface DashboardViewProps {
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
  profile: UserProfile;
  isAmountsHidden: boolean;
  onSelectTransaction: (tx: Transaction) => void;
  onNavigateToHistory: () => void;
  onNavigateToAnalytics: () => void;
  onOpenQuickEntry: () => void;
  onToggleCurrencyViewMode: () => void;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  currentMonth,
  profile,
  isAmountsHidden,
  onSelectTransaction,
  onNavigateToHistory,
  onNavigateToAnalytics,
  onOpenQuickEntry,
  onToggleCurrencyViewMode,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const { base_currency, custom_rates, currency_view_mode, compact_numbers, monthly_budget } = profile;

  const overview = calculateMonthlyOverview(transactions, currentMonth, base_currency, custom_rates);
  const projection = calculateYearlyProjection(transactions, currentMonth, base_currency, custom_rates);
  const wastage = calculateWastageAnalysis(transactions, currentMonth, base_currency, custom_rates);

  // Filter recent month transactions sorted by date descending
  const recentMonthTxs = transactions
    .filter(tx => tx.sync_status !== 'deleted' && tx.date.startsWith(currentMonth))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Budget calculations
  const budgetUsed = overview.expenseInBase;
  const budgetPercentage = monthly_budget > 0 ? Math.min(100, Math.round((budgetUsed / monthly_budget) * 100)) : 0;
  const isOverBudget = budgetUsed > monthly_budget;
  const budgetRemaining = Math.max(0, monthly_budget - budgetUsed);

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Currency View Mode Toggle Banner */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold text-slate-400">
          {t.dashboard.monthlyOverview}
        </span>
        <button
          type="button"
          onClick={onToggleCurrencyViewMode}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
        >
          {currency_view_mode === 'converted' ? t.dashboard.convertedView : t.dashboard.separatedView}
        </button>
      </div>

      {/* Bento Grid: Net Balance, Income, Expense */}
      <div className="grid grid-cols-2 gap-3">
        {/* Net Balance Card (Full Width) */}
        <div className="col-span-2 p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>{t.dashboard.netBalance}</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {base_currency}
            </span>
          </div>

          {currency_view_mode === 'converted' ? (
            <div className="my-1">
              <span className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                overview.netBalanceInBase >= 0 ? 'text-white' : 'text-rose-400'
              }`}>
                {formatMoney(overview.netBalanceInBase, base_currency, compact_numbers, isAmountsHidden)}
              </span>
            </div>
          ) : (
            <div className="space-y-1 my-1">
              {(['THB', 'MMK', 'USD'] as Currency[]).map(cur => (
                <div key={cur} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{cur}:</span>
                  <span className={`font-semibold tabular-nums ${
                    overview.separatedBalance[cur] >= 0 ? 'text-white' : 'text-rose-400'
                  }`}>
                    {formatMoney(overview.separatedBalance[cur], cur, compact_numbers, isAmountsHidden)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Income Card */}
        <div className="p-3.5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 mb-1.5">
            <div className="p-1 rounded-lg bg-emerald-500/10">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span>{t.dashboard.income}</span>
          </div>
          {currency_view_mode === 'converted' ? (
            <span className="text-xl font-bold tracking-tight text-white tabular-nums block">
              {formatMoney(overview.incomeInBase, base_currency, compact_numbers, isAmountsHidden)}
            </span>
          ) : (
            <div className="space-y-0.5 text-[11px]">
              {(['THB', 'MMK', 'USD'] as Currency[]).map(cur => (
                <div key={cur} className="flex justify-between">
                  <span className="text-slate-500">{cur}</span>
                  <span className="font-semibold text-emerald-400 tabular-nums">
                    {formatMoney(overview.separatedIncome[cur], cur, true, isAmountsHidden)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Card */}
        <div className="p-3.5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-400 mb-1.5">
            <div className="p-1 rounded-lg bg-rose-500/10">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <span>{t.dashboard.expense}</span>
          </div>
          {currency_view_mode === 'converted' ? (
            <span className="text-xl font-bold tracking-tight text-white tabular-nums block">
              {formatMoney(overview.expenseInBase, base_currency, compact_numbers, isAmountsHidden)}
            </span>
          ) : (
            <div className="space-y-0.5 text-[11px]">
              {(['THB', 'MMK', 'USD'] as Currency[]).map(cur => (
                <div key={cur} className="flex justify-between">
                  <span className="text-slate-500">{cur}</span>
                  <span className="font-semibold text-rose-400 tabular-nums">
                    {formatMoney(overview.separatedExpense[cur], cur, true, isAmountsHidden)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Budget Tracker Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200">{t.dashboard.monthlyBudget}</span>
            {isOverBudget && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300">
                {t.dashboard.overBudget}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-400">
            {formatMoney(budgetUsed, base_currency, compact_numbers, isAmountsHidden)} / {formatMoney(monthly_budget, base_currency, compact_numbers, isAmountsHidden)}
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                : budgetPercentage > 80
                ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                : 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
            }`}
            style={{ width: `${Math.min(100, (budgetUsed / (monthly_budget || 1)) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-500 mt-2">
          <span>{budgetPercentage}% {t.dashboard.budgetUsed}</span>
          <span>{formatMoney(budgetRemaining, base_currency, true, isAmountsHidden)} {t.dashboard.budgetRemaining}</span>
        </div>
      </div>

      {/* Wastage Quick Snapshot Card */}
      <button
        type="button"
        onClick={onNavigateToAnalytics}
        className="w-full text-left p-4 rounded-3xl bg-gradient-to-r from-rose-950/20 via-slate-900/90 to-slate-900 border border-rose-500/20 shadow-md flex items-center justify-between active:scale-[0.99] transition-all cursor-pointer"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {t.analytics.wastageDetector}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {formatMoney(wastage.totalWasteInBase, base_currency, false, isAmountsHidden)} ({wastage.wastePercentage}% {t.analytics.wastagePercentage})
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
      </button>

      {/* 12-Month Yearly Projection Engine */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white">{t.dashboard.yearlyProjection}</h3>
          </div>
          <span className="text-[10px] text-slate-500">{t.dashboard.runRateNotice}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">{t.dashboard.annualIncome}</span>
            <span className="text-sm font-bold text-white tabular-nums">
              {formatMoney(projection.projectedAnnualIncome, base_currency, compact_numbers, isAmountsHidden)}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">{t.dashboard.annualExpense}</span>
            <span className="text-sm font-bold text-rose-300 tabular-nums">
              {formatMoney(projection.projectedAnnualExpense, base_currency, compact_numbers, isAmountsHidden)}
            </span>
          </div>

          <div className="col-span-2 p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 font-medium block">
                {t.dashboard.projectedSavings}
              </span>
              <span className="text-base font-extrabold text-white tabular-nums">
                {formatMoney(projection.projectedAnnualSavings, base_currency, compact_numbers, isAmountsHidden)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{t.dashboard.savingsRate}</span>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">
                {projection.savingsRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-xs font-bold text-slate-300">{t.dashboard.recentTransactions}</h3>
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{t.dashboard.seeAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMonthTxs.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 text-center">
            <p className="text-xs text-slate-500 mb-3">{t.dashboard.noTransactions}</p>
            <button
              type="button"
              onClick={onOpenQuickEntry}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
            >
              + {t.entry.addTitle}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentMonthTxs.map(tx => (
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
                    {/* Unboxed clean metadata with · separators */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <span>{t.categories[tx.category]}</span>
                      <span aria-hidden="true">·</span>
                      <span>{tx.date}</span>
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
        )}
      </div>
    </div>
  );
};
