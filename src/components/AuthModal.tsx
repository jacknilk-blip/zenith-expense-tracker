import React, { useState } from 'react';
import { X, Cloud, Lock, Mail, KeyRound, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SupabaseConfig, UserProfile, Transaction } from '../types';
import { getSupabaseClient, syncWithSupabase } from '../utils/supabase';
import { isServiceRoleKey } from '../utils/security';
import { Language } from '../utils/i18n';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConfig: SupabaseConfig;
  onSaveConfig: (config: SupabaseConfig) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  localTransactions: Transaction[];
  onTransactionsSynced: (transactions: Transaction[]) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  supabaseConfig,
  onSaveConfig,
  profile,
  onUpdateProfile,
  localTransactions,
  onTransactionsSynced,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'password' | 'config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [urlInput, setUrlInput] = useState(supabaseConfig.supabaseUrl || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.supabaseAnonKey || '');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMergePrompt, setShowMergePrompt] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string } | null>(null);

  if (!isOpen) return null;

  const handleKeyChange = (val: string) => {
    setKeyInput(val);
    if (isServiceRoleKey(val)) {
      setErrorMessage('CRITICAL SECURITY ERROR: You pasted a secret "service_role" key! This key has full admin bypass permissions and must never be used in a browser app. Please use your public "anon" key instead.');
    } else {
      if (errorMessage?.includes('service_role')) {
        setErrorMessage(null);
      }
    }
  };

  const saveCloudSettings = () => {
    if (isServiceRoleKey(keyInput)) {
      setErrorMessage('Blocked: Cannot save a service_role key. Use the public anon key.');
      return;
    }
    const cleanUrl = urlInput.trim();
    const cleanKey = keyInput.trim();
    
    if (!cleanUrl || !cleanKey) {
      setErrorMessage('Please provide both Project URL and Public Anon Key.');
      return;
    }

    onSaveConfig({
      supabaseUrl: cleanUrl,
      supabaseAnonKey: cleanKey,
      isConnected: true,
    });
    setSuccessMessage('Supabase credentials saved successfully.');
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveTab('signin');
    }, 1200);
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const client = getSupabaseClient(supabaseConfig);
      if (!client) {
        setActiveTab('config');
        setErrorMessage('Please configure your Supabase Project URL and Anon Key first.');
        setIsLoading(false);
        return;
      }

      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start Google OAuth.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const client = getSupabaseClient(supabaseConfig);
      if (!client) {
        setActiveTab('config');
        setErrorMessage('Please enter your Supabase URL and Anon Key first.');
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.user) {
          setSuccessMessage('Account created! Please check your email for confirmation if required.');
          handleLoginSuccess(data.user.id, data.user.email || email);
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        if (data.user) {
          handleLoginSuccess(data.user.id, data.user.email || email);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const client = getSupabaseClient(supabaseConfig);
      if (!client) {
        throw new Error('Supabase client is not configured.');
      }

      const { error } = await client.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMessage('Password changed successfully.');
      setNewPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userId: string, userEmail: string) => {
    setPendingUser({ id: userId, email: userEmail });
    const hasUnsyncedTxs = localTransactions.length > 0;
    if (hasUnsyncedTxs) {
      setShowMergePrompt(true);
    } else {
      finalizeLogin(userId, userEmail, false);
    }
  };

  const finalizeLogin = async (userId: string, userEmail: string, mergeGuestData: boolean) => {
    const updatedProfile: UserProfile = {
      ...profile,
      id: userId,
      email: userEmail,
      name: userEmail.split('@')[0],
    };
    onUpdateProfile(updatedProfile);

    const client = getSupabaseClient(supabaseConfig);
    if (client && mergeGuestData && localTransactions.length > 0) {
      // Assign local transactions to the logged in user
      const mergedTxs: Transaction[] = localTransactions.map(tx => ({
        ...tx,
        user_id: userId,
        sync_status: 'pending',
      }));
      const { updatedList } = await syncWithSupabase(client, userId, mergedTxs);
      onTransactionsSynced(updatedList);
    }

    setShowMergePrompt(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {language === 'my' ? 'Cloud အကောင့်ဝင်ရန်' : 'Cloud Authentication'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'my' ? 'စက်အားလုံး ချိတ်ဆက်အသုံးပြုနိုင်သည်' : 'Supabase Multi-Device Synchronization'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest-to-Cloud Merge Prompt */}
        {showMergePrompt && pendingUser && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 mb-4">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{language === 'my' ? 'စာရင်းများကို Cloud သို့ ပေါင်းထည့်မည်လား။' : 'Merge Local Guest Transactions?'}</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              {language === 'my'
                ? `စက်ထဲတွင် မှတ်ထားသော စာရင်း (${localTransactions.length}) ခု ရှိပါသည်။ သင့်အကောင့်ထဲသို့ ထည့်သွင်းသိမ်းဆည်းလိုပါသလား။`
                : `You have ${localTransactions.length} transaction(s) recorded in Guest mode. Would you like to merge them into your cloud account?`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => finalizeLogin(pendingUser.id, pendingUser.email, true)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors"
              >
                {language === 'my' ? 'ပေါင်းထည့်မည်' : 'Yes, Merge Records'}
              </button>
              <button
                type="button"
                onClick={() => finalizeLogin(pendingUser.id, pendingUser.email, false)}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
              >
                {language === 'my' ? 'မပေါင်းပါ' : 'Skip Merge'}
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        {!showMergePrompt && (
          <>
            <div className="flex rounded-xl bg-slate-950 p-1 mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signin' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'my' ? 'အကောင့်ဝင်' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signup' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'my' ? 'အကောင့်သစ်' : 'Sign Up'}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('password'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'password' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'my' ? 'စကားဝှက်' : 'Password'}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('config'); setErrorMessage(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'config' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {language === 'my' ? 'Config' : 'Config'}
              </button>
            </div>

            {/* Status alerts */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mb-4 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            {(activeTab === 'signin' || activeTab === 'signup') && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                    />
                  </svg>
                  <span>{language === 'my' ? 'Google အကောင့်ဖြင့် ဝင်မည်' : 'Continue with Google Account'}</span>
                </button>

                <div className="flex items-center gap-3 my-3">
                  <div className="h-[1px] flex-1 bg-slate-800" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {language === 'my' ? 'သို့မဟုတ်' : 'or with email'}
                  </span>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                </div>
              </div>
            )}

            {/* Form for Sign In & Sign Up */}
            {(activeTab === 'signin' || activeTab === 'signup') && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEmailAuth(activeTab === 'signup');
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {language === 'my' ? 'အီးမေးလ်' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@domain.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {language === 'my' ? 'စကားဝှက်' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading
                    ? 'Processing...'
                    : activeTab === 'signup'
                    ? (language === 'my' ? 'အကောင့်သစ် ဖွင့်မည်' : 'Create Free Account')
                    : (language === 'my' ? 'အကောင့်ဝင်မည်' : 'Sign In with Email')}
                </button>
              </form>
            )}

            {/* Self-Service Password Change */}
            {activeTab === 'password' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePasswordChange();
                }}
                className="space-y-3"
              >
                <p className="text-[11px] text-slate-400">
                  {language === 'my'
                    ? 'လက်ရှိအကောင့်အတွက် စကားဝှက်အသစ် ပြောင်းလဲသတ်မှတ်နိုင်ပါသည်။'
                    : 'Update your cloud account password securely.'}
                </p>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {language === 'my' ? 'စကားဝှက် အသစ်' : 'New Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs active:scale-[0.98] transition-all disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isLoading ? 'Updating...' : (language === 'my' ? 'စကားဝှက် ပြောင်းမည်' : 'Update Password')}
                </button>
              </form>
            )}

            {/* Supabase Config Tab */}
            {activeTab === 'config' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'my'
                      ? 'သင့်ကိုယ်ပိုင် Supabase Project URL နှင့် Public Anon Key ကို ဖြည့်စွက်နိုင်ပါသည်။ Service Role Key လုံးဝ မထည့်ရပါ။'
                      : 'Provide your Supabase URL & Public Anon Key. The app prevents accidental input of dangerous service_role keys.'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://xyzproject.supabase.co"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Supabase Public Anon Key
                  </label>
                  <textarea
                    rows={2}
                    value={keyInput}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={saveCloudSettings}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {language === 'my' ? 'ချိန်ညှိချက် သိမ်းမည်' : 'Save Connection Details'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
