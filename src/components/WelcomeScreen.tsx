import React from 'react';
import { ShieldCheck, Zap, Sparkles, Lock, ArrowRight, Cloud, Globe } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface WelcomeScreenProps {
  onContinueGuest: () => void;
  onOpenAuth: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinueGuest,
  onOpenAuth,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white p-6">
      {/* 2026 Titanium & Glass Caustics Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px]" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px]" />
        
        {/* Subtle geometric grid line accents */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Top Bar with Language Selector */}
      <header className="relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block">
              {t.appName}
            </span>
            <span className="text-[11px] font-medium tracking-wide text-emerald-400 uppercase">
              2026 Flagship Edition
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-medium text-slate-200 transition-all active:scale-95"
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'en' ? 'မြန်မာ' : 'English'}</span>
        </button>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 my-auto py-3 sm:py-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>6-Layer Client-Side Security Architecture</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight mb-2.5">
          {t.welcomeTitle}
        </h1>

        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4 max-w-sm">
          {t.welcomeSubtitle}
        </p>

        {/* Feature Bento Cards */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-100">{t.features.offlineFirst}</h2>
              <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{t.features.offlineDesc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-100">{t.features.security}</h2>
              <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{t.features.securityDesc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-100">{t.features.wastageTracking}</h2>
              <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{t.features.wastageDesc}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Dual Entry Action Buttons */}
      <footer className="relative z-10 pt-4 space-y-3">
        {/* Primary 1: Continue Offline (Guest Mode) */}
        <button
          type="button"
          onClick={onContinueGuest}
          className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>{t.guestMode}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Primary 2: Sign In with Cloud */}
        <button
          type="button"
          onClick={onOpenAuth}
          className="w-full h-13 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm flex items-center justify-center gap-2.5 backdrop-blur-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Cloud className="w-4 h-4 text-emerald-400" />
          <span>{t.signInCloud}</span>
        </button>

        <p className="text-center text-[11px] text-slate-400 pt-1">
          {t.security.securityLayerNotice}
        </p>
      </footer>
    </div>
  );
};
