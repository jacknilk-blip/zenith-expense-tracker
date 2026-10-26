export type Currency = 'THB' | 'MMK' | 'USD';

export type TransactionType = 'expense' | 'income';

export type WastageTag = 'essential' | 'optional' | 'waste';

export type SyncStatus = 'synced' | 'pending' | 'deleted';

export type CategoryKey = 
  | 'food_meals'
  | 'transport'
  | 'shopping'
  | 'utilities'
  | 'entertainment'
  | 'salary'
  | 'business'
  | 'freelance'
  | 'others';

export interface Transaction {
  id: string; // UUID v4
  user_id: string | null; // UUID, nullable in Guest mode
  date: string; // ISO date YYYY-MM-DD
  type: TransactionType;
  amount: number; // positive numeric > 0
  currency: Currency;
  category: CategoryKey;
  wastage_tag: WastageTag;
  note: string; // max 500 chars - required for income
  updated_at: string; // ISO timestamp
  sync_status: SyncStatus;
}

export interface ExchangeRates {
  USD: number; // reference 1 USD
  THB: number; // e.g. 35.0
  MMK: number; // e.g. 4500.0
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  base_currency: Currency;
  currency_view_mode: 'converted' | 'separated';
  compact_numbers: boolean;
  monthly_budget: number;
  pin_enabled: boolean;
  pin_salt: string | null;
  pin_hash: string | null;
  wipe_on_signout: boolean;
  language: 'en' | 'my';
  theme: 'dark' | 'light';
  custom_rates: ExchangeRates;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
}

export interface WastageAnalysis {
  totalWasteInBase: number;
  totalExpenseInBase: number;
  wastePercentage: number;
  essentialInBase: number;
  optionalInBase: number;
  topWastedItems: Array<{
    id: string;
    note: string;
    category: CategoryKey;
    amount: number;
    currency: Currency;
    amountInBase: number;
    date: string;
  }>;
}

export interface CategorySummary {
  category: CategoryKey;
  totalInBase: number;
  percentage: number;
  count: number;
  separated: Record<Currency, number>;
}
