import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Lock,
  DollarSign,
  Download,
  Upload,
  Database,
  Cloud,
  LogOut,
  Camera,
  Moon,
  Sun,
  Globe,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { UserProfile, SupabaseConfig, Transaction, Currency, ExchangeRates } from '../types';
import { compressAvatarFile, validateImportedJson } from '../utils/security';
import { exportToCSV, exportToJSON, CURRENCY_SYMBOLS } from '../utils/finance';
import { getSupabaseClient, uploadAvatarToStorage } from '../utils/supabase';
import { wipeLocalStorage } from '../utils/storage';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  supabaseConfig: SupabaseConfig;
  onOpenAuth: () => void;
  onOpenPinSetup: () => void;
  onOpenSqlModal: () => void;
  transactions: Transaction[];
  onImportTransactions: (imported: Transaction[]) => void;
  onSignOut: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  supabaseConfig,
  onOpenAuth,
  onOpenPinSetup,
  onOpenSqlModal,
  transactions,
  onImportTransactions,
  onSignOut,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showRatesEditor, setShowRatesEditor] = useState(false);

  // Exchange rates state
  const [thbRate, setThbRate] = useState(String(profile.custom_rates.THB));
  const [mmkRate, setMmkRate] = useState(String(profile.custom_rates.MMK));
  const [budgetInput, setBudgetInput] = useState(String(profile.monthly_budget));

  // Avatar upload handler with Canvas compression & dual storage
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    setAvatarError(null);

    try {
      const { base64, blob } = await compressAvatarFile(file);

      // Check if logged in to Supabase
      const client = getSupabaseClient(supabaseConfig);
      if (client && profile.email) {
        try {
          const publicUrl = await uploadAvatarToStorage(client, profile.id, blob);
          onUpdateProfile({ ...profile, avatar_url: publicUrl });
        } catch {
          // Fallback to local base64 storage if storage bucket upload failed
          onUpdateProfile({ ...profile, avatar_url: base64 });
        }
      } else {
        // Offline / Guest Mode: store compressed base64 in local profile
        onUpdateProfile({ ...profile, avatar_url: base64 });
      }
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to process avatar image.');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Base Currency switch
  const handleBaseCurrencyChange = (newCur: Currency) => {
    onUpdateProfile({ ...profile, base_currency: newCur });
  };

  // Save rates
  const handleSaveRates = () => {
    const thb = parseFloat(thbRate);
    const mmk = parseFloat(mmkRate);
    if (!isNaN(thb) && !isNaN(mmk) && thb > 0 && mmk > 0) {
      const updatedRates: ExchangeRates = {
        USD: 1,
        THB: thb,
        MMK: mmk,
      };
      onUpdateProfile({ ...profile, custom_rates: updatedRates });
      setShowRatesEditor(false);
    }
  };

  // Save Budget
  const handleSaveBudget = () => {
    const num = parseFloat(budgetInput);
    if (!isNaN(num) && num >= 0) {
      onUpdateProfile({ ...profile, monthly_budget: num });
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenith_export_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = exportToJSON(transactions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenith_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON with strict schema validator
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImportStatus('Error: File exceeds maximum 2MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImportedJson(content);
      if (result.valid) {
        onImportTransactions(result.transactions);
        setImportStatus(`Successfully imported ${result.transactions.length} transactions.`);
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Import Error: ${result.error}`);
      }
    };
    reader.readAsText(file);
    if (jsonImportRef.current) jsonImportRef.current.value = '';
  };

  // Disable PIN
  const handleDisablePin = () => {
    if (window.confirm('Are you sure you want to disable PIN lock?')) {
      onUpdateProfile({
        ...profile,
        pin_enabled: false,
        pin_salt: null,
        pin_hash: null,
      });
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Account & Profile Card */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <button
            type="button"
            disabled={avatarLoading}
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md hover:bg-emerald-400 active:scale-95 transition-all cursor-pointer"
            aria-label="Upload photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarSelect}
          />
        </div>

        <div className="flex-1 truncate">
          <span className="text-base font-bold text-white block truncate">
            {profile.name}
          </span>
          <span className="text-xs text-slate-400 block truncate">
            {profile.email || t.profile.guestUser}
          </span>
          {/* Status badge */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${profile.email ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[10px] text-slate-400 font-medium">
              {profile.email ? t.profile.cloudConnected : t.profile.guestUser}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAuth}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold shrink-0 active:scale-95 transition-all cursor-pointer"
        >
          {profile.email ? 'Manage' : 'Connect'}
        </button>
      </div>

      {avatarError && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{avatarError}</span>
        </div>
      )}

      {/* 6-Layer Security & Hardened PIN Vault */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{t.profile.securitySettings}</h4>
              <p className="text-[10px] text-slate-400">Salted SHA-256 vault & brute-force lock</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            profile.pin_enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {profile.pin_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          {profile.pin_enabled ? (
            <>
              <button
                type="button"
                onClick={onOpenPinSetup}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {t.profile.changePin}
              </button>
              <button
                type="button"
                onClick={handleDisablePin}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all cursor-pointer"
              >
                {t.profile.disablePin}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenPinSetup}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
            >
              + {t.profile.setPin}
            </button>
          )}
        </div>

        {/* Wipe on sign out toggle */}
        <label className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800 cursor-pointer">
          <span>{t.profile.wipeOnSignOut}</span>
          <input
            type="checkbox"
            checked={profile.wipe_on_signout}
            onChange={(e) => onUpdateProfile({ ...profile, wipe_on_signout: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Multi-Currency & Monthly Budget Settings */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">{t.profile.baseCurrency}</span>
          </div>

          {/* Currency Radio Pills */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['THB', 'MMK', 'USD'] as Currency[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => handleBaseCurrencyChange(c)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  profile.base_currency === c
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c} {CURRENCY_SYMBOLS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Budget Input */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            {t.dashboard.monthlyBudget} ({profile.base_currency})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveBudget}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* Custom Exchange Rates Drawer */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              1 USD = {profile.custom_rates.THB} THB · {profile.custom_rates.MMK} MMK
            </span>
            <button
              type="button"
              onClick={() => setShowRatesEditor(!showRatesEditor)}
              className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
            >
              {showRatesEditor ? 'Close Rates' : 'Edit Rates'}
            </button>
          </div>

          {showRatesEditor && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">1 USD in THB (฿)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thbRate}
                    onChange={(e) => setThbRate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">1 USD in MMK (Ks)</label>
                  <input
                    type="number"
                    step="10"
                    value={mmkRate}
                    onChange={(e) => setMmkRate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveRates}
                className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                Save Exchange Rates
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Display & Language Preferences */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
        <h4 className="text-xs font-bold text-white mb-2">{t.profile.displayOptions}</h4>

        {/* Compact Numbers */}
        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
          <span>{t.profile.compactNumbers}</span>
          <input
            type="checkbox"
            checked={profile.compact_numbers}
            onChange={(e) => onUpdateProfile({ ...profile, compact_numbers: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </label>

        {/* Language Switch */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{t.profile.language}</span>
          </span>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2.5 py-1 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            {language === 'en' ? 'English (Switch to မြန်မာ)' : 'မြန်မာ (Switch to EN)'}
          </button>
        </div>

        {/* Theme mode toggle */}
        <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5">
            {profile.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-emerald-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <span>{t.profile.theme}</span>
          </span>
          <button
            type="button"
            onClick={() => onUpdateProfile({ ...profile, theme: profile.theme === 'dark' ? 'light' : 'dark' })}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            {profile.theme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.profile.dark}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.profile.light}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3">
        <h4 className="text-xs font-bold text-white">{t.profile.dataManagement}</h4>

        {importStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.profile.exportCsv}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>{t.profile.exportJson}</span>
          </button>

          <button
            type="button"
            onClick={() => jsonImportRef.current?.click()}
            className="col-span-2 p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>{t.profile.importJson}</span>
          </button>
          <input
            ref={jsonImportRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportJSON}
          />
        </div>
      </div>

      {/* Supabase SQL Schema Generator Modal Button */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Supabase Cloud Database</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Deploy row-level security, constraints, and avatars bucket in 1 click.
        </p>
        <button
          type="button"
          onClick={onOpenSqlModal}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>{t.profile.sqlSchemaGenerator}</span>
        </button>
      </div>

      {/* Sign Out / Reset Button */}
      <button
        type="button"
        onClick={() => {
          if (window.confirm('Do you want to sign out?')) {
            onSignOut();
          }
        }}
        className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>{profile.email ? t.profile.signOut : 'Reset Guest Session'}</span>
      </button>
    </div>
  );
};
