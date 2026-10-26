import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCurrency,
  formatMoney,
  calculateMonthlyOverview,
  calculateWastageAnalysis,
  calculateYearlyProjection,
  DEFAULT_EXCHANGE_RATES,
} from './finance';
import { Transaction } from '../types';

test('convertCurrency converts THB to USD and MMK accurately', () => {
  // 1 USD = 35 THB, 1 USD = 4500 MMK
  const convertedUSD = convertCurrency(70, 'THB', 'USD', DEFAULT_EXCHANGE_RATES);
  assert.equal(convertedUSD, 2);

  const convertedMMK = convertCurrency(1, 'USD', 'MMK', DEFAULT_EXCHANGE_RATES);
  assert.equal(convertedMMK, 4500);

  const sameCurrency = convertCurrency(500, 'THB', 'THB', DEFAULT_EXCHANGE_RATES);
  assert.equal(sameCurrency, 500);
});

test('formatMoney handles privacy mask, compact format, and symbols', () => {
  assert.equal(formatMoney(1500, 'THB', false, true), '****');
  assert.equal(formatMoney(1500000, 'THB', true, false), '฿1.5M');
  assert.equal(formatMoney(25000, 'MMK', true, false), '25K Ks');
  assert.equal(formatMoney(120.5, 'USD', false, false), '$120.50');
});

test('calculateMonthlyOverview correctly groups and calculates totals', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      user_id: null,
      date: '2026-10-01',
      type: 'income',
      amount: 1000,
      currency: 'THB',
      category: 'salary',
      wastage_tag: 'essential',
      note: 'Main salary',
      updated_at: '2026-10-01T00:00:00Z',
      sync_status: 'synced',
    },
    {
      id: 'tx-2',
      user_id: null,
      date: '2026-10-02',
      type: 'expense',
      amount: 300,
      currency: 'THB',
      category: 'food_meals',
      wastage_tag: 'essential',
      note: 'Groceries',
      updated_at: '2026-10-02T00:00:00Z',
      sync_status: 'synced',
    },
    {
      id: 'tx-3',
      user_id: null,
      date: '2026-09-15', // different month
      type: 'expense',
      amount: 500,
      currency: 'THB',
      category: 'entertainment',
      wastage_tag: 'waste',
      note: 'Old movie',
      updated_at: '2026-09-15T00:00:00Z',
      sync_status: 'synced',
    },
  ];

  const overview = calculateMonthlyOverview(mockTransactions, '2026-10', 'THB', DEFAULT_EXCHANGE_RATES);
  assert.equal(overview.incomeInBase, 1000);
  assert.equal(overview.expenseInBase, 300);
  assert.equal(overview.netBalanceInBase, 700);
  assert.equal(overview.transactionCount, 2);
});

test('calculateWastageAnalysis detects waste percentage and top items', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-w1',
      user_id: null,
      date: '2026-10-05',
      type: 'expense',
      amount: 500,
      currency: 'THB',
      category: 'entertainment',
      wastage_tag: 'waste',
      note: 'Late night bar',
      updated_at: '2026-10-05T00:00:00Z',
      sync_status: 'synced',
    },
    {
      id: 'tx-w2',
      user_id: null,
      date: '2026-10-06',
      type: 'expense',
      amount: 1500,
      currency: 'THB',
      category: 'utilities',
      wastage_tag: 'essential',
      note: 'Power bill',
      updated_at: '2026-10-06T00:00:00Z',
      sync_status: 'synced',
    },
  ];

  const analysis = calculateWastageAnalysis(mockTransactions, '2026-10', 'THB', DEFAULT_EXCHANGE_RATES);
  assert.equal(analysis.totalExpenseInBase, 2000);
  assert.equal(analysis.totalWasteInBase, 500);
  assert.equal(analysis.wastePercentage, 25);
  assert.equal(analysis.topWastedItems.length, 1);
  assert.equal(analysis.topWastedItems[0].note, 'Late night bar');
});

test('calculateYearlyProjection multiplies monthly run rate by 12', () => {
  const mockTransactions: Transaction[] = [
    {
      id: 'tx-1',
      user_id: null,
      date: '2026-10-01',
      type: 'income',
      amount: 10000,
      currency: 'THB',
      category: 'salary',
      wastage_tag: 'essential',
      note: 'Salary',
      updated_at: '2026-10-01T00:00:00Z',
      sync_status: 'synced',
    },
    {
      id: 'tx-2',
      user_id: null,
      date: '2026-10-02',
      type: 'expense',
      amount: 4000,
      currency: 'THB',
      category: 'utilities',
      wastage_tag: 'essential',
      note: 'Rent',
      updated_at: '2026-10-02T00:00:00Z',
      sync_status: 'synced',
    },
  ];

  const proj = calculateYearlyProjection(mockTransactions, '2026-10', 'THB', DEFAULT_EXCHANGE_RATES);
  assert.equal(proj.projectedAnnualIncome, 120000);
  assert.equal(proj.projectedAnnualExpense, 48000);
  assert.equal(proj.projectedAnnualSavings, 72000);
  assert.equal(proj.savingsRate, 60);
});
