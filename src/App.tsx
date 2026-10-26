/**
 * Zenith · Personal Expense, Income & Wastage Tracker
 * 2026 Flagship Mobile Application with 6-Layer Hardened Security Architecture
 */

import React, { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { HeaderBar } from './components/HeaderBar.tsx';
import { BottomNavBar, NavTab } from './components/BottomNavBar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { QuickEntrySheet } from './components/QuickEntrySheet.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { PinLockModal } from './components/PinLockModal.tsx';
import { SqlSchemaModal } from './components/SqlSchemaModal.tsx';
import { Transaction, UserProfile, SupabaseConfig } from './types';
import {
  loadProfile,
  saveProfile,
  loadTransactions,
  saveTransactions,
  loadSupabaseConfig,
  saveSupabaseConfig,
  wipeLocalStorage,
  DEFAULT_PROFILE,
} from './utils/storage';
import { getSupabaseClient, syncWithSupabase } from './utils/supabase';
import { Language } from './utils/i18n';

export default function App() {
  // Core application state
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions(profile));
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => loadSupabaseConfig());

  // Navigation & Screen states
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    // If autostart query param is set, skip straight to app
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') return true;
      return localStorage.getItem('zenith_has_entered_v2026') === 'true';
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Privacy & Security states
  const [isAmountsHidden, setIsAmountsHidden] = useState<boolean>(false);
  const [isAppBlurred, setIsAppBlurred] = useState<boolean>(false);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') return false;
    }
    return profile.pin_enabled;
  });

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isPinSetupOpen, setIsPinSetupOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);

  // App Switcher Privacy Blur on Tab Inactivity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAppBlurred(true);
      } else {
        setIsAppBlurred(false);
      }
    };

    const handleWindowBlur = () => setIsAppBlurred(true);
    const handleWindowFocus = () => setIsAppBlurred(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Save profile changes
  const handleUpdateProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    saveProfile(updated);
  }, []);

  // Save transactions changes
  const handleUpdateTransactions = useCallback((updatedList: Transaction[]) => {
    setTransactions(updatedList);
    saveTransactions(updatedList, profile);
  }, [profile]);

  // Save Supabase config
  const handleSaveSupabaseConfig = useCallback((config: SupabaseConfig) => {
    setSupabaseConfig(config);
    saveSupabaseConfig(config);
  }, []);

  // Toggle Language
  const handleToggleLanguage = () => {
    const nextLang: Language = profile.language === 'en' ? 'my' : 'en';
    handleUpdateProfile({ ...profile, language: nextLang });
  };

  // Toggle Currency View Mode
  const handleToggleCurrencyViewMode = () => {
    const nextMode = profile.currency_view_mode === 'converted' ? 'separated' : 'converted';
    handleUpdateProfile({ ...profile, currency_view_mode: nextMode });
  };

  // Add / Edit transaction
  const handleSaveTransaction = (tx: Transaction) => {
    const exists = transactions.some(t => t.id === tx.id);
    let nextList: Transaction[];
    if (exists) {
      nextList = transactions.map(t => (t.id === tx.id ? tx : t));
    } else {
      nextList = [tx, ...transactions];
    }
    handleUpdateTransactions(nextList);
    setEditingTransaction(null);
  };

  // Delete transaction (soft delete for sync compatibility)
  const handleDeleteTransaction = (id: string) => {
    const nextList = transactions.map(t =>
      t.id === id ? { ...t, sync_status: 'deleted' as const, updated_at: new Date().toISOString() } : t
    );
    handleUpdateTransactions(nextList);
    setEditingTransaction(null);
  };

  // Trigger sync with Supabase if configured
  const triggerSync = useCallback(async () => {
    const client = getSupabaseClient(supabaseConfig);
    if (!client || !profile.email) return;

    setIsSyncing(true);
    try {
      const { updatedList } = await syncWithSupabase(client, profile.id, transactions);
      handleUpdateTransactions(updatedList);
    } catch (err) {
      console.warn('Sync attempt finished with error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [supabaseConfig, profile.email, profile.id, transactions, handleUpdateTransactions]);

  // Sign out handler
  const handleSignOut = async () => {
    const client = getSupabaseClient(supabaseConfig);
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // ignore
      }
    }

    if (profile.wipe_on_signout) {
      wipeLocalStorage();
      setTransactions([]);
      setProfile(DEFAULT_PROFILE);
    } else {
      handleUpdateProfile({
        ...profile,
        email: null,
        name: 'Guest Pioneer',
      });
    }

    setHasEnteredApp(false);
    localStorage.removeItem('zenith_has_entered_v2026');
  };

  // Enter app via Guest Mode
  const handleContinueGuest = () => {
    setHasEnteredApp(true);
    localStorage.setItem('zenith_has_entered_v2026', 'true');
    // If no transactions yet, reload seeded
    if (transactions.length === 0) {
      const seeded = loadTransactions(profile);
      setTransactions(seeded);
    }
  };

  // If Welcome Screen is active
  if (!hasEnteredApp) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <div className="w-full max-w-md h-screen max-h-[920px] bg-slate-950 shadow-2xl relative flex flex-col">
          <WelcomeScreen
            onContinueGuest={handleContinueGuest}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            language={profile.language}
            onToggleLanguage={handleToggleLanguage}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => {
              setIsAuthModalOpen(false);
              // If user logged in, enter app
              if (profile.email) {
                setHasEnteredApp(true);
                localStorage.setItem('zenith_has_entered_v2026', 'true');
              }
            }}
            supabaseConfig={supabaseConfig}
            onSaveConfig={handleSaveSupabaseConfig}
            profile={profile}
            onUpdateProfile={(p) => {
              handleUpdateProfile(p);
              setHasEnteredApp(true);
              localStorage.setItem('zenith_has_entered_v2026', 'true');
            }}
            localTransactions={transactions}
            onTransactionsSynced={handleUpdateTransactions}
            language={profile.language}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex items-center justify-center antialiased selection:bg-emerald-500 selection:text-slate-950 transition-colors ${
      profile.theme === 'light' ? 'bg-slate-200 text-slate-900' : 'bg-slate-950 text-white'
    }`}>
      {/* Mobile-first flagship container: max-w-md centered on desktop, full-screen on mobile */}
      <div
        className={`w-full max-w-md min-h-screen relative flex flex-col shadow-2xl overflow-x-hidden transition-colors ${
          profile.theme === 'light'
            ? 'bg-slate-900 text-white border-x border-slate-700/60 shadow-slate-400/20'
            : 'bg-slate-950 text-white border-x border-slate-900/60 shadow-black'
        } ${isAppBlurred ? 'privacy-blur-active' : ''}`}
      >
        {/* Top Header Bar */}
        <HeaderBar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          isAmountsHidden={isAmountsHidden}
          onToggleHideAmounts={() => setIsAmountsHidden(!isAmountsHidden)}
          language={profile.language}
          onToggleLanguage={handleToggleLanguage}
          profile={profile}
          supabaseConfig={supabaseConfig}
          onOpenProfile={() => setCurrentTab('profile')}
        />

        {/* Main Content Area per Tab */}
        <main className="flex-1 px-4 overflow-y-auto">
          {currentTab === 'home' && (
            <DashboardView
              transactions={transactions}
              currentMonth={currentMonth}
              profile={profile}
              isAmountsHidden={isAmountsHidden}
              onSelectTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsQuickEntryOpen(true);
              }}
              onNavigateToHistory={() => setCurrentTab('history')}
              onNavigateToAnalytics={() => setCurrentTab('analytics')}
              onOpenQuickEntry={() => {
                setEditingTransaction(null);
                setIsQuickEntryOpen(true);
              }}
              onToggleCurrencyViewMode={handleToggleCurrencyViewMode}
              language={profile.language}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              transactions={transactions}
              currentMonth={currentMonth}
              profile={profile}
              isAmountsHidden={isAmountsHidden}
              onSelectTransaction={(tx: Transaction) => {
                setEditingTransaction(tx);
                setIsQuickEntryOpen(true);
              }}
              language={profile.language}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              currentMonth={currentMonth}
              profile={profile}
              isAmountsHidden={isAmountsHidden}
              language={profile.language}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              supabaseConfig={supabaseConfig}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenPinSetup={() => setIsPinSetupOpen(true)}
              onOpenSqlModal={() => setIsSqlModalOpen(true)}
              transactions={transactions}
              onImportTransactions={(imported) => {
                const combined = [...imported, ...transactions];
                // Deduplicate by id
                const map = new Map<string, Transaction>();
                for (const item of combined) {
                  map.set(item.id, item);
                }
                handleUpdateTransactions(Array.from(map.values()));
              }}
              onSignOut={handleSignOut}
              language={profile.language}
              onToggleLanguage={handleToggleLanguage}
            />
          )}
        </main>

        {/* Floating Bottom Navigation Bar */}
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenQuickEntry={() => {
            setEditingTransaction(null);
            setIsQuickEntryOpen(true);
          }}
          language={profile.language}
        />

        {/* Quick Entry / Edit Sheet Modal */}
        <QuickEntrySheet
          isOpen={isQuickEntryOpen}
          onClose={() => {
            setIsQuickEntryOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
          initialTransaction={editingTransaction}
          recentTransactions={transactions.filter(t => t.sync_status !== 'deleted')}
          profile={profile}
          language={profile.language}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          supabaseConfig={supabaseConfig}
          onSaveConfig={handleSaveSupabaseConfig}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          localTransactions={transactions}
          onTransactionsSynced={handleUpdateTransactions}
          language={profile.language}
        />

        {/* 4-Digit Passcode Unlock Modal */}
        <PinLockModal
          isOpen={isPinLocked}
          mode="unlock"
          profile={profile}
          onSuccess={() => setIsPinLocked(false)}
          language={profile.language}
        />

        {/* 4-Digit Passcode Setup Modal */}
        <PinLockModal
          isOpen={isPinSetupOpen}
          mode="setup"
          profile={profile}
          onSuccess={(updated) => {
            if (updated) handleUpdateProfile(updated);
            setIsPinSetupOpen(false);
          }}
          onCancel={() => setIsPinSetupOpen(false)}
          language={profile.language}
        />

        {/* Hardened Backend SQL Schema Script Modal */}
        <SqlSchemaModal
          isOpen={isSqlModalOpen}
          onClose={() => setIsSqlModalOpen(false)}
          language={profile.language}
        />
      </div>
    </div>
  );
}
