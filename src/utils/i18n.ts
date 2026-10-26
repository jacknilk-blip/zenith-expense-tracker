/**
 * Bilingual UI Internationalization (English & Burmese - မြန်မာ)
 */

import { CategoryKey, WastageTag, Currency } from '../types';

export type Language = 'en' | 'my';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  guestMode: string;
  signInCloud: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  features: {
    offlineFirst: string;
    offlineDesc: string;
    security: string;
    securityDesc: string;
    wastageTracking: string;
    wastageDesc: string;
  };
  tabs: {
    home: string;
    history: string;
    add: string;
    analytics: string;
    profile: string;
  };
  dashboard: {
    monthlyOverview: string;
    income: string;
    expense: string;
    netBalance: string;
    monthlyBudget: string;
    budgetUsed: string;
    budgetRemaining: string;
    overBudget: string;
    yearlyProjection: string;
    annualIncome: string;
    annualExpense: string;
    projectedSavings: string;
    savingsRate: string;
    recentTransactions: string;
    seeAll: string;
    noTransactions: string;
    convertedView: string;
    separatedView: string;
    runRateNotice: string;
  };
  entry: {
    addTitle: string;
    editTitle: string;
    expense: string;
    income: string;
    amount: string;
    currency: string;
    category: string;
    wastageTag: string;
    note: string;
    noteExpensePlaceholder: string;
    noteIncomePlaceholder: string; // "ဘာကြောင့်ဝင်လဲ / ဘယ်ကဝင်လဲ"
    date: string;
    save: string;
    update: string;
    delete: string;
    cancel: string;
    quickPresets: string;
    repeatRecent: string;
    requiredNoteAlert: string;
    invalidAmountAlert: string;
  };
  history: {
    title: string;
    searchPlaceholder: string;
    filterAll: string;
    filterWastageOnly: string;
    allCategories: string;
    totalEntries: string;
    noResults: string;
  };
  analytics: {
    title: string;
    wastageDetector: string;
    wastageHeadline: string;
    wastagePercentage: string;
    topWastedSpend: string;
    essentialRatio: string;
    optionalRatio: string;
    categoryBreakdown: string;
    incomeSources: string;
    noData: string;
  };
  profile: {
    title: string;
    account: string;
    guestUser: string;
    cloudConnected: string;
    signInPrompt: string;
    signOut: string;
    baseCurrency: string;
    exchangeRates: string;
    displayOptions: string;
    compactNumbers: string;
    language: string;
    theme: string;
    dark: string;
    light: string;
    securitySettings: string;
    pinLock: string;
    changePin: string;
    setPin: string;
    disablePin: string;
    wipeOnSignOut: string;
    dataManagement: string;
    exportJson: string;
    exportCsv: string;
    importJson: string;
    supabaseSettings: string;
    sqlSchemaGenerator: string;
    avatarUpload: string;
  };
  security: {
    enterPin: string;
    confirmPin: string;
    createPin: string;
    wrongPin: string;
    pinLockedWait: string;
    attemptsLeft: string;
    privacyMaskActive: string;
    securityLayerNotice: string;
  };
  categories: Record<CategoryKey, string>;
  wastageTags: Record<WastageTag, string>;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Zenith',
    tagline: 'Expense, Income & Wastage Tracker',
    guestMode: 'Continue Offline (Guest Mode)',
    signInCloud: 'Sign In with Cloud',
    welcomeTitle: 'Master Your Wealth & Stop Wastage',
    welcomeSubtitle: 'Flagship personal financial intelligence with 6-layer zero-trust privacy and offline-first sync.',
    features: {
      offlineFirst: 'Zero-Latency Offline Mode',
      offlineDesc: 'Instant entry, works completely offline with military-grade local encryption.',
      security: '6-Layer Cryptographic Security',
      securityDesc: 'Salted SHA-256 PIN vault, brute-force cooldown, app-blur privacy.',
      wastageTracking: 'Wastage Detector Engine',
      wastageDesc: 'Categorize spending to eliminate leakage and boost annual savings.',
    },
    tabs: {
      home: 'Home',
      history: 'History',
      add: 'Quick Entry',
      analytics: 'Analytics',
      profile: 'Settings',
    },
    dashboard: {
      monthlyOverview: 'Monthly Overview',
      income: 'Income',
      expense: 'Expenses',
      netBalance: 'Net Balance',
      monthlyBudget: 'Monthly Budget',
      budgetUsed: 'Used',
      budgetRemaining: 'Remaining',
      overBudget: 'Over Budget',
      yearlyProjection: '12-Month Run-Rate Projection',
      annualIncome: 'Est. Annual Income',
      annualExpense: 'Est. Annual Expenses',
      projectedSavings: 'Projected Annual Savings',
      savingsRate: 'Savings Rate',
      recentTransactions: 'Recent Transactions',
      seeAll: 'View All',
      noTransactions: 'No transactions logged this month.',
      convertedView: 'Converted (Base)',
      separatedView: 'Separated Currencies',
      runRateNotice: 'Calculated from current monthly run rate',
    },
    entry: {
      addTitle: 'New Transaction',
      editTitle: 'Edit Transaction',
      expense: 'Expense',
      income: 'Income',
      amount: 'Amount',
      currency: 'Currency',
      category: 'Category',
      wastageTag: 'Wastage Classification',
      note: 'Note / Reason',
      noteExpensePlaceholder: 'e.g. Lunch with team, monthly wifi...',
      noteIncomePlaceholder: 'Explain source / reason for income (Required)...',
      date: 'Date',
      save: 'Save Transaction',
      update: 'Update Transaction',
      delete: 'Delete Transaction',
      cancel: 'Cancel',
      quickPresets: 'Quick Presets',
      repeatRecent: 'Repeat Recent',
      requiredNoteAlert: 'Income entries require a note explaining the source/reason.',
      invalidAmountAlert: 'Please enter a valid amount greater than 0.',
    },
    history: {
      title: 'Transaction History',
      searchPlaceholder: 'Search notes, category, amount...',
      filterAll: 'All Records',
      filterWastageOnly: 'Wastage Only (အလေအလွင့်)',
      allCategories: 'All Categories',
      totalEntries: 'records',
      noResults: 'No transactions found matching your criteria.',
    },
    analytics: {
      title: 'Financial Intelligence',
      wastageDetector: 'Wastage Detector (အလေအလွင့် ဆန်းစစ်ချက်)',
      wastageHeadline: 'Total Money Leaked to Wastage',
      wastagePercentage: 'of total monthly spending',
      topWastedSpend: 'Top Wasted Items',
      essentialRatio: 'Essential Spend',
      optionalRatio: 'Optional / Lifestyle',
      categoryBreakdown: 'Expense Breakdown',
      incomeSources: 'Income Sources',
      noData: 'Log expenses to reveal wastage and analytics breakdown.',
    },
    profile: {
      title: 'Settings & Security',
      account: 'Account & Storage',
      guestUser: 'Guest Mode (Local Only)',
      cloudConnected: 'Cloud Synced (Supabase)',
      signInPrompt: 'Connect Supabase for encrypted multi-device sync',
      signOut: 'Sign Out',
      baseCurrency: 'Base Display Currency',
      exchangeRates: 'Custom Exchange Rates (vs 1 USD)',
      displayOptions: 'Display Preferences',
      compactNumbers: 'Compact Numbers (e.g. 1.5M)',
      language: 'Language / ဘာသာစကား',
      theme: 'Theme Mode',
      dark: 'Dark (2026 Sleek)',
      light: 'Light Minimal',
      securitySettings: '6-Layer App Lock & Privacy',
      pinLock: '4-Digit PIN Lock',
      changePin: 'Change PIN',
      setPin: 'Setup Passcode',
      disablePin: 'Disable PIN Lock',
      wipeOnSignOut: 'Wipe Local Cache on Sign Out',
      dataManagement: 'Backup & Portability',
      exportJson: 'Export Encrypted JSON',
      exportCsv: 'Export Clean CSV',
      importJson: 'Import JSON Backup',
      supabaseSettings: 'Supabase Cloud Config',
      sqlSchemaGenerator: 'Hardened SQL Schema Script',
      avatarUpload: 'Change Avatar',
    },
    security: {
      enterPin: 'Enter 4-Digit Passcode',
      confirmPin: 'Confirm Your 4-Digit PIN',
      createPin: 'Choose 4-Digit Passcode',
      wrongPin: 'Incorrect PIN. Please try again.',
      pinLockedWait: 'Too many failed attempts. Locked for 30s.',
      attemptsLeft: 'attempts remaining before 30s lock.',
      privacyMaskActive: 'Tap eye icon to unmask financial amounts',
      securityLayerNotice: 'Zero-knowledge encrypted client vault active',
    },
    categories: {
      food_meals: 'Food / Meals',
      transport: 'Transport',
      shopping: 'Shopping',
      utilities: 'Utilities',
      entertainment: 'Entertainment',
      salary: 'Salary',
      business: 'Business',
      freelance: 'Freelance',
      others: 'Others',
    },
    wastageTags: {
      essential: 'Essential (မရှိမဖြစ်)',
      optional: 'Optional (ရွေးချယ်စရာ)',
      waste: 'Waste (အလေအလွင့်)',
    },
  },
  my: {
    appName: 'Zenith',
    tagline: 'ဝင်ငွေ၊ ထွက်ငွေနှင့် အလေအလွင့် မှတ်တမ်း',
    guestMode: 'အကောင့်မလိုဘဲ အသုံးပြုမည် (Guest Mode)',
    signInCloud: 'Cloud အကောင့်ဖြင့် ဝင်မည်',
    welcomeTitle: 'ဘဏ္ဍာရေးကို ထိန်းသိမ်းပြီး အလေအလွင့်ကို လျှော့ချပါ',
    welcomeSubtitle: 'အဆင့်မြင့် ၆ ထပ် လုံခြုံရေးနှင့် အင်တာနက်မလိုဘဲ အသုံးပြုနိုင်သော စနစ်။',
    features: {
      offlineFirst: 'အင်တာနက်မလိုဘဲ အချိန်မရွေးသုံးနိုင်ခြင်း',
      offlineDesc: 'လျင်မြန်စွာ မှတ်သားနိုင်ပြီး စက်ထဲတွင် လုံခြုံစွာ သိမ်းဆည်းထားသည်။',
      security: 'အဆင့်မြင့် ၆ ထပ် လုံခြုံရေး စနစ်',
      securityDesc: '၄ လုံးတွဲ PIN လော့ခ်၊ Brute-Force ကာကွယ်မှုနှင့် လျှို့ဝှက်ကုဒ်စနစ်။',
      wastageTracking: 'အလေအလွင့် စောင့်ကြည့်ဆန်းစစ်ချက်',
      wastageDesc: 'မလိုအပ်သော အသုံးစရိတ်များကို သိရှိပြီး နှစ်စဉ်စုငွေ တိုးပွားစေသည်။',
    },
    tabs: {
      home: 'ပင်မ',
      history: 'မှတ်တမ်း',
      add: 'စာရင်းသွင်း',
      analytics: 'ဆန်းစစ်ချက်',
      profile: 'ချိန်ညှိချက်',
    },
    dashboard: {
      monthlyOverview: 'လစဉ်သုံးသပ်ချက်',
      income: 'ဝင်ငွေ',
      expense: 'အသုံးစရိတ်',
      netBalance: 'လက်ကျန်ငွေ',
      monthlyBudget: 'လစဉ်ဘတ်ဂျက်',
      budgetUsed: 'သုံးစွဲပြီး',
      budgetRemaining: 'ကျန်ရှိငွေ',
      overBudget: 'ဘတ်ဂျက်ကျော်လွန်',
      yearlyProjection: '၁၂ လစာ နှစ်စဉ် ခန့်မှန်းချက်',
      annualIncome: 'ခန့်မှန်း နှစ်စဉ်ဝင်ငွေ',
      annualExpense: 'ခန့်မှန်း နှစ်စဉ်အသုံးစရိတ်',
      projectedSavings: 'ခန့်မှန်း နှစ်စဉ်စုငွေ',
      savingsRate: 'စုဆောင်းနှုန်း',
      recentTransactions: 'လတ်တလော စာရင်းများ',
      seeAll: 'အားလုံးကြည့်မည်',
      noTransactions: 'ယခုလအတွက် စာရင်းမရှိသေးပါ။',
      convertedView: 'အခြေခံငွေကြေးဖြင့် တွက်ချက်ပြသ',
      separatedView: 'ငွေကြေးအမျိုးအစားအလိုက် ခွဲပြသ',
      runRateNotice: 'လက်ရှိ လစဉ်သုံးစွဲမှုအပေါ် အခြေခံ၍ တွက်ချက်ထားသည်',
    },
    entry: {
      addTitle: 'စာရင်းအသစ် ထည့်သွင်းရန်',
      editTitle: 'စာရင်း ပြင်ဆင်ရန်',
      expense: 'အသုံးစရိတ်',
      income: 'ဝင်ငွေ',
      amount: 'ပမာဏ',
      currency: 'ငွေကြေး',
      category: 'အမျိုးအစား',
      wastageTag: 'အသုံးစရိတ် သတ်မှတ်ချက်',
      note: 'မှတ်ချက် / အကြောင်းပြချက်',
      noteExpensePlaceholder: 'ဥပမာ - နေ့လယ်စာ၊ ကားခ၊ အင်တာနက်ဖိုး...',
      noteIncomePlaceholder: 'ဘာကြောင့်ဝင်လဲ / ဘယ်ကဝင်လဲ (မဖြစ်မနေ ဖြည့်ရန်)...',
      date: 'ရက်စွဲ',
      save: 'စာရင်းသိမ်းမည်',
      update: 'ပြင်ဆင်ချက်သိမ်းမည်',
      delete: 'စာရင်းဖျက်မည်',
      cancel: 'မလုပ်တော့ပါ',
      quickPresets: 'အမြန်ရွေးချယ်စရာများ',
      repeatRecent: 'မကြာသေးမီက စာရင်းများ',
      requiredNoteAlert: 'ဝင်ငွေဖြစ်ပါက "ဘာကြောင့်ဝင်လဲ / ဘယ်ကဝင်လဲ" မှတ်ချက် မဖြစ်မနေ ဖြည့်ရပါမည်။',
      invalidAmountAlert: 'ကျေးဇူးပြု၍ သုညထက်ကြီးသော ပမာဏကို ထည့်ပါ။',
    },
    history: {
      title: 'စာရင်းမှတ်တမ်းများ',
      searchPlaceholder: 'မှတ်ချက်၊ အမျိုးအစား သို့မဟုတ် ပမာဏ ရှာပါ...',
      filterAll: 'စာရင်းအားလုံး',
      filterWastageOnly: 'အလေအလွင့် စာရင်းများသာ',
      allCategories: 'အမျိုးအစားအားလုံး',
      totalEntries: 'ခု',
      noResults: 'ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မရှိပါ။',
    },
    analytics: {
      title: 'ဘဏ္ဍာရေး ဆန်းစစ်လေ့လာချက်',
      wastageDetector: 'အလေအလွင့် ဆန်းစစ်ချက်',
      wastageHeadline: 'အလဟဿ ဖြစ်သွားသော စုစုပေါင်းငွေ',
      wastagePercentage: 'လစဉ်အသုံးစရိတ်၏ ရာခိုင်နှုန်း',
      topWastedSpend: 'အလေအလွင့် အများဆုံး ၅ ခု',
      essentialRatio: 'မရှိမဖြစ် အသုံးစရိတ်',
      optionalRatio: 'ရွေးချယ်စရာ အသုံးစရိတ်',
      categoryBreakdown: 'အသုံးစရိတ် ကဏ္ဍခွဲများ',
      incomeSources: 'ဝင်ငွေ ရင်းမြစ်များ',
      noData: 'ဆန်းစစ်ချက် ကြည့်ရှုရန် စာရင်းများ ထည့်သွင်းပါ။',
    },
    profile: {
      title: 'အကောင့်နှင့် လုံခြုံရေး ချိန်ညှိချက်',
      account: 'အကောင့်နှင့် သိမ်းဆည်းမှု',
      guestUser: 'စက်ထဲ၌သာ သိမ်းဆည်းထားသည် (Guest)',
      cloudConnected: 'Cloud ချိတ်ဆက်ထားသည် (Supabase)',
      signInPrompt: 'စက်အများအပြား ချိတ်ဆက်ရန် Supabase ဖြင့် ဝင်ပါ',
      signOut: 'အကောင့်ထွက်မည်',
      baseCurrency: 'အဓိကပြသမည့် ငွေကြေး',
      exchangeRates: 'ငွေလဲလှယ်နှုန်း (၁ ဒေါ်လာ နှုန်းထား)',
      displayOptions: 'မျက်နှာပြင် ပြသမှု ပုံစံ',
      compactNumbers: 'နံပါတ်တို ပြသမှု (ဥပမာ - 1.5M)',
      language: 'Language / ဘာသာစကား',
      theme: 'အလင်း/အမှောင် ပုံစံ',
      dark: 'အမှောင် (Dark Mode)',
      light: 'အလင်း (Light Mode)',
      securitySettings: '၆ ထပ် လုံခြုံရေးနှင့် PIN လော့ခ်',
      pinLock: '၄ လုံးတွဲ PIN လော့ခ်',
      changePin: 'PIN နံပါတ် ပြောင်းမည်',
      setPin: 'PIN အသစ် ထည့်မည်',
      disablePin: 'PIN လော့ခ် ပိတ်မည်',
      wipeOnSignOut: 'အကောင့်ထွက်ပါက စက်ထဲက ဒေတာများ အကုန်ဖျက်မည်',
      dataManagement: 'ဒေတာ သိမ်းဆည်းခြင်းနှင့် ကူးယူခြင်း',
      exportJson: 'JSON ဖိုင်ဖြင့် သိမ်းမည်',
      exportCsv: 'CSV (Excel) ဖိုင်ဖြင့် သိမ်းမည်',
      importJson: 'JSON ဖိုင်မှ ပြန်လည်သွင်းမည်',
      supabaseSettings: 'Supabase Cloud ချိတ်ဆက်မှု',
      sqlSchemaGenerator: 'Supabase SQL ကုဒ် ကြည့်ရှု/ကူးယူရန်',
      avatarUpload: 'ပရိုဖိုင်ဓာတ်ပုံ ပြောင်းမည်',
    },
    security: {
      enterPin: '၄ လုံးတွဲ PIN နံပါတ် ထည့်ပါ',
      confirmPin: 'PIN နံပါတ်ကို ထပ်မံအတည်ပြုပါ',
      createPin: 'PIN နံပါတ် အသစ် သတ်မှတ်ပါ',
      wrongPin: 'PIN နံပါတ် မှားယွင်းနေပါသည်။',
      pinLockedWait: 'အကြိမ်များစွာ မှားယွင်းသဖြင့် ၃၀ စက္ကန့် စောင့်ပါ။',
      attemptsLeft: 'ကြိမ် အမှားခံပါမည်။',
      privacyMaskActive: 'ငွေပမာဏများကို မျက်စိပုံ အိုင်ကွန်နှိပ်၍ ပြန်ဖွင့်ပါ',
      securityLayerNotice: 'လျှို့ဝှက်ကုဒ်ဖြင့် လုံခြုံစွာ သိမ်းဆည်းထားသည်',
    },
    categories: {
      food_meals: 'စားစရိတ် (Food/Meals)',
      transport: 'လမ်းစရိတ် (Transport)',
      shopping: 'ဝယ်ယူသည့်ပစ္စည်း (Shopping)',
      utilities: 'ရေ၊ မီး၊ ဝန်ဆောင်ခ (Utilities)',
      entertainment: 'အပန်းဖြေ/ဖျော်ဖြေရေး (Entertainment)',
      salary: 'လစာ (Salary)',
      business: 'စီးပွားရေး (Business)',
      freelance: 'အလွတ်တန်း (Freelance)',
      others: 'အခြား (Others)',
    },
    wastageTags: {
      essential: 'မရှိမဖြစ် (Essential)',
      optional: 'ရွေးချယ်စရာ (Optional)',
      waste: 'အလေအလွင့် (Waste)',
    },
  },
};
