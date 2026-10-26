/**
 * Multi-Currency & Financial Calculations Engine
 * - Dynamic exchange rate conversion (THB, MMK, USD)
 * - Comma formatting & compact view (e.g. 1.5M / 45K)
 * - Wastage analysis and detection
 * - 12-month yearly run-rate projection
 * - CSV & JSON serialization
 */

import { Transaction, Currency, ExchangeRates, WastageAnalysis, CategoryKey, CategorySummary } from '../types';

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  THB: 35.0,
  MMK: 4500.0,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  THB: '฿',
  MMK: 'Ks',
  USD: '$',
};

/**
 * Converts any amount between supported currencies using USD as the common pivot
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  if (from === to) return amount;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  // Convert to USD first, then to target currency
  const inUSD = amount / fromRate;
  const target = inUSD * toRate;
  return Math.round(target * 100) / 100;
}

/**
 * Formats a number with thousand commas, or compact notation (e.g., 1.5M, 45K), with privacy masking
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  compact = false,
  hidden = false
): string {
  if (hidden) return '****';

  const symbol = CURRENCY_SYMBOLS[currency] || '';
  const isMMK = currency === 'MMK';

  let formattedValue = '';

  if (compact && Math.abs(amount) >= 1000) {
    if (Math.abs(amount) >= 1_000_000_000) {
      formattedValue = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (Math.abs(amount) >= 1_000_000) {
      formattedValue = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else {
      formattedValue = (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
  } else {
    formattedValue = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency === 'MMK' ? 0 : 2,
      maximumFractionDigits: currency === 'MMK' ? 0 : 2,
    }).format(amount);
  }

  // Symbol placement: prefix for THB and USD, suffix for MMK
  if (isMMK) {
    return `${formattedValue} ${symbol}`;
  }
  return `${symbol}${formattedValue}`;
}

/**
 * Filter transactions for a given month (format: YYYY-MM)
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  yearMonth: string
): Transaction[] {
  return transactions.filter(
    tx => tx.sync_status !== 'deleted' && tx.date.startsWith(yearMonth)
  );
}

export interface MonthlyOverview {
  incomeInBase: number;
  expenseInBase: number;
  netBalanceInBase: number;
  separatedIncome: Record<Currency, number>;
  separatedExpense: Record<Currency, number>;
  separatedBalance: Record<Currency, number>;
  transactionCount: number;
}

/**
 * Calculates current month summary in base currency and broken down per currency
 */
export function calculateMonthlyOverview(
  transactions: Transaction[],
  yearMonth: string,
  baseCurrency: Currency,
  rates: ExchangeRates
): MonthlyOverview {
  const monthTransactions = filterTransactionsByMonth(transactions, yearMonth);

  let incomeInBase = 0;
  let expenseInBase = 0;

  const separatedIncome: Record<Currency, number> = { THB: 0, MMK: 0, USD: 0 };
  const separatedExpense: Record<Currency, number> = { THB: 0, MMK: 0, USD: 0 };
  const separatedBalance: Record<Currency, number> = { THB: 0, MMK: 0, USD: 0 };

  for (const tx of monthTransactions) {
    const inBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);

    if (tx.type === 'income') {
      incomeInBase += inBase;
      separatedIncome[tx.currency] += tx.amount;
      separatedBalance[tx.currency] += tx.amount;
    } else {
      expenseInBase += inBase;
      separatedExpense[tx.currency] += tx.amount;
      separatedBalance[tx.currency] -= tx.amount;
    }
  }

  return {
    incomeInBase: Math.round(incomeInBase * 100) / 100,
    expenseInBase: Math.round(expenseInBase * 100) / 100,
    netBalanceInBase: Math.round((incomeInBase - expenseInBase) * 100) / 100,
    separatedIncome,
    separatedExpense,
    separatedBalance,
    transactionCount: monthTransactions.length,
  };
}

/**
 * Calculates wastage metrics for the selected month
 */
export function calculateWastageAnalysis(
  transactions: Transaction[],
  yearMonth: string,
  baseCurrency: Currency,
  rates: ExchangeRates
): WastageAnalysis {
  const monthTxs = filterTransactionsByMonth(transactions, yearMonth).filter(
    tx => tx.type === 'expense'
  );

  let totalExpenseInBase = 0;
  let totalWasteInBase = 0;
  let essentialInBase = 0;
  let optionalInBase = 0;

  const wastedItemsList: Array<{
    id: string;
    note: string;
    category: CategoryKey;
    amount: number;
    currency: Currency;
    amountInBase: number;
    date: string;
  }> = [];

  for (const tx of monthTxs) {
    const inBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);
    totalExpenseInBase += inBase;

    if (tx.wastage_tag === 'waste') {
      totalWasteInBase += inBase;
      wastedItemsList.push({
        id: tx.id,
        note: tx.note || 'Wasted spend',
        category: tx.category,
        amount: tx.amount,
        currency: tx.currency,
        amountInBase: inBase,
        date: tx.date,
      });
    } else if (tx.wastage_tag === 'essential') {
      essentialInBase += inBase;
    } else if (tx.wastage_tag === 'optional') {
      optionalInBase += inBase;
    }
  }

  // Sort top wasted items descending
  wastedItemsList.sort((a, b) => b.amountInBase - a.amountInBase);

  const wastePercentage =
    totalExpenseInBase > 0
      ? Math.round((totalWasteInBase / totalExpenseInBase) * 1000) / 10
      : 0;

  return {
    totalWasteInBase: Math.round(totalWasteInBase * 100) / 100,
    totalExpenseInBase: Math.round(totalExpenseInBase * 100) / 100,
    wastePercentage,
    essentialInBase: Math.round(essentialInBase * 100) / 100,
    optionalInBase: Math.round(optionalInBase * 100) / 100,
    topWastedItems: wastedItemsList.slice(0, 5),
  };
}

/**
 * Category Breakdown calculation for charts
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  yearMonth: string,
  type: 'expense' | 'income',
  baseCurrency: Currency,
  rates: ExchangeRates
): CategorySummary[] {
  const filtered = filterTransactionsByMonth(transactions, yearMonth).filter(
    tx => tx.type === type
  );

  const categoryMap = new Map<CategoryKey, { totalInBase: number; count: number; separated: Record<Currency, number> }>();

  let grandTotalInBase = 0;

  for (const tx of filtered) {
    const inBase = convertCurrency(tx.amount, tx.currency, baseCurrency, rates);
    grandTotalInBase += inBase;

    const existing = categoryMap.get(tx.category) || {
      totalInBase: 0,
      count: 0,
      separated: { THB: 0, MMK: 0, USD: 0 },
    };

    existing.totalInBase += inBase;
    existing.count += 1;
    existing.separated[tx.currency] += tx.amount;
    categoryMap.set(tx.category, existing);
  }

  const results: CategorySummary[] = [];
  for (const [category, data] of categoryMap.entries()) {
    const percentage =
      grandTotalInBase > 0
        ? Math.round((data.totalInBase / grandTotalInBase) * 1000) / 10
        : 0;
    results.push({
      category,
      totalInBase: Math.round(data.totalInBase * 100) / 100,
      percentage,
      count: data.count,
      separated: data.separated,
    });
  }

  return results.sort((a, b) => b.totalInBase - a.totalInBase);
}

/**
 * 12-Month Yearly Projection Engine based on current monthly run rate
 */
export interface YearlyProjection {
  projectedAnnualIncome: number;
  projectedAnnualExpense: number;
  projectedAnnualSavings: number;
  monthlyAverageIncome: number;
  monthlyAverageExpense: number;
  savingsRate: number; // percentage
}

export function calculateYearlyProjection(
  transactions: Transaction[],
  yearMonth: string,
  baseCurrency: Currency,
  rates: ExchangeRates
): YearlyProjection {
  const overview = calculateMonthlyOverview(transactions, yearMonth, baseCurrency, rates);

  const monthlyAverageIncome = overview.incomeInBase;
  const monthlyAverageExpense = overview.expenseInBase;

  const projectedAnnualIncome = Math.round(monthlyAverageIncome * 12);
  const projectedAnnualExpense = Math.round(monthlyAverageExpense * 12);
  const projectedAnnualSavings = projectedAnnualIncome - projectedAnnualExpense;

  const savingsRate =
    projectedAnnualIncome > 0
      ? Math.max(0, Math.min(100, Math.round((projectedAnnualSavings / projectedAnnualIncome) * 1000) / 10))
      : 0;

  return {
    projectedAnnualIncome,
    projectedAnnualExpense,
    projectedAnnualSavings,
    monthlyAverageIncome,
    monthlyAverageExpense,
    savingsRate,
  };
}

/**
 * Formats transactions to sanitized CSV string
 */
export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['ID', 'Date', 'Type', 'Amount', 'Currency', 'Category', 'Wastage_Tag', 'Note', 'Updated_At'];
  const activeTxs = transactions.filter(tx => tx.sync_status !== 'deleted');

  const rows = activeTxs.map(tx => {
    // Sanitize note to escape quotes
    const safeNote = (tx.note || '').replace(/"/g, '""');
    return [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.currency}"`,
      `"${tx.category}"`,
      `"${tx.wastage_tag}"`,
      `"${safeNote}"`,
      `"${tx.updated_at}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Formats transactions to clean JSON string
 */
export function exportToJSON(transactions: Transaction[]): string {
  const activeTxs = transactions.filter(tx => tx.sync_status !== 'deleted');
  return JSON.stringify(activeTxs, null, 2);
}
