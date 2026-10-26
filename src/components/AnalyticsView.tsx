import React from 'react';
import { ShieldAlert, Sparkles, TrendingDown, CheckCircle, PieChart, ArrowUpRight } from 'lucide-react';
import { Transaction, UserProfile, CategoryKey } from '../types';
import { calculateWastageAnalysis, calculateCategoryBreakdown, formatMoney } from '../utils/finance';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currentMonth: string;
  profile: UserProfile;
  isAmountsHidden: boolean;
  language: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  currentMonth,
  profile,
  isAmountsHidden,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const { base_currency, custom_rates, compact_numbers } = profile;

  const wastage = calculateWastageAnalysis(transactions, currentMonth, base_currency, custom_rates);
  const expenseBreakdown = calculateCategoryBreakdown(transactions, currentMonth, 'expense', base_currency, custom_rates);
  const incomeBreakdown = calculateCategoryBreakdown(transactions, currentMonth, 'income', base_currency, custom_rates);

  // Palette colors for category visualization
  const CATEGORY_COLORS = [
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#14b8a6', // teal
    '#f43f5e', // rose
    '#64748b', // slate
  ];

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Wastage Detector Flagship Card (အလေအလွင့် ဆန်းစစ်ချက်) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-tight">
                {t.analytics.wastageDetector}
              </h3>
              <p className="text-[10px] text-rose-300">
                {t.analytics.wastageHeadline}
              </p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-rose-400 tabular-nums">
            {wastage.wastePercentage}%
          </span>
        </div>

        {/* Big Number Amount */}
        <div className="my-2">
          <span className="text-3xl font-black tracking-tight text-white tabular-nums block">
            {formatMoney(wastage.totalWasteInBase, base_currency, compact_numbers, isAmountsHidden)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {wastage.wastePercentage}% {t.analytics.wastagePercentage}
          </span>
        </div>

        {/* Spend Classification Stack Bar (Essential / Optional / Waste) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Spend Classification Ratio
          </span>
          <div className="w-full h-3 rounded-full bg-slate-950 flex overflow-hidden p-0.5 gap-0.5">
            {wastage.totalExpenseInBase > 0 && (
              <>
                <div
                  style={{ width: `${(wastage.essentialInBase / wastage.totalExpenseInBase) * 100}%` }}
                  className="h-full bg-emerald-500 rounded-l-full"
                  title="Essential"
                />
                <div
                  style={{ width: `${(wastage.optionalInBase / wastage.totalExpenseInBase) * 100}%` }}
                  className="h-full bg-cyan-400"
                  title="Optional"
                />
                <div
                  style={{ width: `${(wastage.totalWasteInBase / wastage.totalExpenseInBase) * 100}%` }}
                  className="h-full bg-rose-500 rounded-r-full"
                  title="Waste"
                />
              </>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Essential ({formatMoney(wastage.essentialInBase, base_currency, true, isAmountsHidden)})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Optional ({formatMoney(wastage.optionalInBase, base_currency, true, isAmountsHidden)})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>Waste ({formatMoney(wastage.totalWasteInBase, base_currency, true, isAmountsHidden)})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Wasted Spend Items */}
      {wastage.topWastedItems.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <span>{t.analytics.topWastedSpend}</span>
          </h4>
          <div className="space-y-2">
            {wastage.topWastedItems.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {item.note}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <span>{t.categories[item.category]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-rose-400 tabular-nums block">
                    {formatMoney(item.amount, item.currency, false, isAmountsHidden)}
                  </span>
                  {item.currency !== base_currency && (
                    <span className="text-[10px] text-slate-500 tabular-nums">
                      ≈ {formatMoney(item.amountInBase, base_currency, true, isAmountsHidden)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Category Breakdown */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-emerald-400" />
          <span>{t.analytics.categoryBreakdown}</span>
        </h4>

        {expenseBreakdown.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">{t.analytics.noData}</p>
        ) : (
          <div className="space-y-3">
            {expenseBreakdown.map((item, idx) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="font-medium text-slate-200">
                      {t.categories[item.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                      {item.percentage}%
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      {formatMoney(item.totalInBase, base_currency, compact_numbers, isAmountsHidden)}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income Sources Breakdown */}
      {incomeBreakdown.length > 0 && (
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
          <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>{t.analytics.incomeSources}</span>
          </h4>
          <div className="space-y-2">
            {incomeBreakdown.map(item => (
              <div
                key={item.category}
                className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <span className="text-xs font-medium text-slate-200">
                  {t.categories[item.category]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.percentage}%
                  </span>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums">
                    {formatMoney(item.totalInBase, base_currency, compact_numbers, isAmountsHidden)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
