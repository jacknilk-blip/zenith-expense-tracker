import React from 'react';
import { Home, History, Plus, BarChart3, Settings } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';

export type NavTab = 'home' | 'history' | 'analytics' | 'profile';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenQuickEntry: () => void;
  language: Language;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenQuickEntry,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pt-1 pointer-events-none">
      <div className="pointer-events-auto h-16 rounded-3xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl flex items-center justify-around px-2">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'home' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={t.tabs.home}
        >
          <Home className="w-5 h-5 transition-transform active:scale-90" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">
            {t.tabs.home}
          </span>
        </button>

        {/* Tab 2: History */}
        <button
          type="button"
          onClick={() => onSelectTab('history')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={t.tabs.history}
        >
          <History className="w-5 h-5 transition-transform active:scale-90" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">
            {t.tabs.history}
          </span>
        </button>

        {/* Tab 3: Center Floating Action Button (+ Quick Entry) */}
        <div className="flex-1 flex items-center justify-center -mt-6">
          <button
            type="button"
            onClick={onOpenQuickEntry}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/35 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Quick Add Entry"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Analytics */}
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'analytics' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={t.tabs.analytics}
        >
          <BarChart3 className="w-5 h-5 transition-transform active:scale-90" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">
            {t.tabs.analytics}
          </span>
        </button>

        {/* Tab 5: Profile */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex-1 min-h-[44px] flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={t.tabs.profile}
        >
          <Settings className="w-5 h-5 transition-transform active:scale-90" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">
            {t.tabs.profile}
          </span>
        </button>
      </div>
    </nav>
  );
};
