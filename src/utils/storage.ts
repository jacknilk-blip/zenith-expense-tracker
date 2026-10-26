/**
 * Offline-First Local Storage Engine with Obfuscation / Encryption
 */

import { Transaction, UserProfile, SupabaseConfig, Currency } from '../types';
import { encryptPayload, decryptPayload, generateUUID } from './security';
import { DEFAULT_EXCHANGE_RATES } from './finance';

const STORAGE_KEYS = {
  PROFILE: 'zenith_profile_v2026',
  TRANSACTIONS: 'zenith_transactions_v2026',
  SUPABASE: 'zenith_supabase_config_v2026',
  FIRST_LAUNCH: 'zenith_has_launched_v2026',
};

export const DEFAULT_PROFILE: UserProfile = {
  id: generateUUID(),
  email: null,
  name: 'Guest Pioneer',
  avatar_url: null,
  base_currency: 'THB',
  currency_view_mode: 'converted',
  compact_numbers: false,
  monthly_budget: 25000, // 25,000 THB default budget
  pin_enabled: false,
  pin_salt: null,
  pin_hash: null,
  wipe_on_signout: true,
  language: 'en',
  theme: 'dark',
  custom_rates: DEFAULT_EXCHANGE_RATES,
};

/**
 * High-quality seed data centered on October 2026
 */
export function getInitialSeedTransactions(): Transaction[] {
  const currentMonth = '2026-10';
  return [
    {
      id: 'a1111111-1111-4111-8111-111111111111',
      user_id: null,
      date: `${currentMonth}-01`,
      type: 'income',
      amount: 45000,
      currency: 'THB',
      category: 'salary',
      wastage_tag: 'essential',
      note: 'Senior Product Designer Monthly Compensation (အဓိကလစာ)',
      updated_at: `${currentMonth}-01T09:00:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'b2222222-2222-4222-8222-222222222222',
      user_id: null,
      date: `${currentMonth}-03`,
      type: 'income',
      amount: 550,
      currency: 'USD',
      category: 'freelance',
      wastage_tag: 'essential',
      note: 'Tokyo Client UI/UX Architecture Consulting (အလွတ်တန်း ဒီဇိုင်းကြေး)',
      updated_at: `${currentMonth}-03T11:30:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'c3333333-3333-4333-8333-333333333333',
      user_id: null,
      date: `${currentMonth}-02`,
      type: 'expense',
      amount: 9500,
      currency: 'THB',
      category: 'utilities',
      wastage_tag: 'essential',
      note: 'Bangkok Condo Studio Rent & Fiber Internet (တိုက်ခန်းငှားရမ်းခ)',
      updated_at: `${currentMonth}-02T10:00:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'd4444444-4444-4444-8444-444444444444',
      user_id: null,
      date: `${currentMonth}-05`,
      type: 'expense',
      amount: 420,
      currency: 'THB',
      category: 'food_meals',
      wastage_tag: 'essential',
      note: 'Organic Grocery Market & Fresh Greens (တစ်ပတ်စာ စားစရိတ်)',
      updated_at: `${currentMonth}-05T14:15:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'e5555555-5555-4555-8555-555555555555',
      user_id: null,
      date: `${currentMonth}-07`,
      type: 'expense',
      amount: 1450,
      currency: 'THB',
      category: 'entertainment',
      wastage_tag: 'waste',
      note: 'Impulsive Late-Night VIP Cinema & Cocktails (အလေအလွင့် - မလိုအပ်သော အသုံး)',
      updated_at: `${currentMonth}-07T21:40:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'f6666666-6666-4666-8666-666666666666',
      user_id: null,
      date: `${currentMonth}-10`,
      type: 'expense',
      amount: 320,
      currency: 'THB',
      category: 'transport',
      wastage_tag: 'optional',
      note: 'Grab Premium Taxi to Siam Paragon (လမ်းစရိတ်)',
      updated_at: `${currentMonth}-10T16:20:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'a7777777-7777-4777-8777-777777777777',
      user_id: null,
      date: `${currentMonth}-12`,
      type: 'expense',
      amount: 280,
      currency: 'THB',
      category: 'food_meals',
      wastage_tag: 'waste',
      note: 'Unfinished Fancy Boba Drinks & Pastries (အလေအလွင့် လက်ဖက်ရည်ဖိုး)',
      updated_at: `${currentMonth}-12T15:00:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'b8888888-8888-4888-8888-888888888888',
      user_id: null,
      date: `${currentMonth}-15`,
      type: 'expense',
      amount: 250000,
      currency: 'MMK',
      category: 'shopping',
      wastage_tag: 'optional',
      note: 'Traditional Silk Longyi Gift for Family (မိသားစု လက်ဆောင်)',
      updated_at: `${currentMonth}-15T18:10:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'c9999999-9999-4999-8999-999999999999',
      user_id: null,
      date: `${currentMonth}-18`,
      type: 'expense',
      amount: 890,
      currency: 'THB',
      category: 'shopping',
      wastage_tag: 'waste',
      note: 'Unused Novelty Desk Gadget from Night Bazaar (အလေအလွင့် ဝယ်ယူမှု)',
      updated_at: `${currentMonth}-18T20:30:00.000Z`,
      sync_status: 'synced',
    },
    {
      id: 'd1010101-1010-4010-8010-101010101010',
      user_id: null,
      date: `${currentMonth}-22`,
      type: 'expense',
      amount: 180,
      currency: 'THB',
      category: 'food_meals',
      wastage_tag: 'essential',
      note: 'Nutritious Pad Krapow Lunch (နေ့လယ်စာ)',
      updated_at: `${currentMonth}-22T12:45:00.000Z`,
      sync_status: 'synced',
    },
  ];
}

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

/**
 * Loads transactions from storage.
 * If PIN lock is enabled with a pin hash, decrypts the payload.
 */
export function loadTransactions(profile: UserProfile): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      // First time launch - seed initial data
      const hasLaunched = localStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      if (!hasLaunched) {
        const initial = getInitialSeedTransactions();
        saveTransactions(initial, profile);
        localStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true');
        return initial;
      }
      return [];
    }

    let jsonString = raw;
    if (profile.pin_enabled && profile.pin_hash) {
      jsonString = decryptPayload(raw, profile.pin_hash);
    }

    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    // If decryption failed or malformed, return empty or fallback
    return [];
  }
}

/**
 * Saves transactions to storage.
 * If PIN lock is active, encrypts the payload so browser DevTools cannot read plain text.
 */
export function saveTransactions(transactions: Transaction[], profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    const jsonString = JSON.stringify(transactions);
    let payloadToStore = jsonString;

    if (profile.pin_enabled && profile.pin_hash) {
      payloadToStore = encryptPayload(jsonString, profile.pin_hash);
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, payloadToStore);
  } catch (err) {
    console.error('Failed to persist transactions:', err);
  }
}

export function loadSupabaseConfig(): SupabaseConfig {
  if (typeof window === 'undefined') {
    return { supabaseUrl: '', supabaseAnonKey: '', isConnected: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE);
    if (!raw) {
      return { supabaseUrl: '', supabaseAnonKey: '', isConnected: false };
    }
    return JSON.parse(raw);
  } catch {
    return { supabaseUrl: '', supabaseAnonKey: '', isConnected: false };
  }
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUPABASE, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Supabase config:', err);
  }
}

export function wipeLocalStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE);
  localStorage.removeItem(STORAGE_KEYS.FIRST_LAUNCH);
}
