import React from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Globe, Cloud, User, ShieldCheck } from 'lucide-react';
import { UserProfile, SupabaseConfig } from '../types';
import { Language } from '../utils/i18n';

interface HeaderBarProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
  isAmountsHidden: boolean;
  onToggleHideAmounts: () => void;
  language: Language;
  onToggleLanguage: () => void;
  profile: UserProfile;
  supabaseConfig: SupabaseConfig;
  onOpenProfile: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentMonth,
  onMonthChange,
  isAmountsHidden,
  onToggleHideAmounts,
  language,
  onToggleLanguage,
  profile,
  supabaseConfig,
  onOpenProfile,
}) => {
  // Parse YYYY-MM
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthDisplay = `${monthNames[month - 1]} ${year}`;

  const handlePrevMonth = () => {
    let nextYear = year;
    let nextMonth = month - 1;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }
    const formatted = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    onMonthChange(formatted);
  };

  const handleNextMonth = () => {
    let nextYear = year;
    let nextMonth = month + 1;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    const formatted = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    onMonthChange(formatted);
  };

  const isCurrentMonthNow = () => {
    const today = new Date();
    const cur = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    return currentMonth === cur;
  };

  const resetToCurrent = () => {
    const today = new Date();
    const cur = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(cur);
  };

  return (
    <header className="sticky top-0 z-30 w-full px-4 py-3 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
      <div className="flex items-center justify-between gap-2">
        {/* Month Selector (< Oct 2026 >) */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-sm">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={resetToCurrent}
            title={isCurrentMonthNow() ? 'Current Month' : 'Click to jump to Current Month'}
            className="px-2.5 py-1 text-xs font-semibold text-slate-100 hover:text-emerald-400 tracking-tight transition-colors cursor-pointer"
          >
            {monthDisplay}
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls: Eye Privacy Mask, Language, Profile Avatar */}
        <div className="flex items-center gap-1.5">
          {/* Eye Icon Privacy Toggle */}
          <button
            type="button"
            onClick={onToggleHideAmounts}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center border transition-all active:scale-90 cursor-pointer ${
              isAmountsHidden
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isAmountsHidden ? 'Show financial amounts' : 'Mask financial amounts for privacy'}
            aria-label={isAmountsHidden ? 'Unmask amounts' : 'Mask amounts'}
          >
            {isAmountsHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Bilingual Language Toggle */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2.5 h-9 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle language between English and Burmese"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'MY' : 'EN'}</span>
          </button>

          {/* Profile / Cloud Avatar Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center relative active:scale-90 transition-all overflow-hidden cursor-pointer"
            aria-label="Open profile and settings"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'Z'}
              </div>
            )}
            
            {/* Status dot for PIN lock or Cloud connection */}
            {profile.pin_enabled && (
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
