import React, { useState } from 'react';
import { X, Copy, Check, Database, ShieldCheck } from 'lucide-react';
import { HARDENED_BACKEND_SQL_SCHEMA } from '../utils/supabase';
import { Language } from '../utils/i18n';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose, language }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(HARDENED_BACKEND_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'my' ? 'Hardened 6-Layer Supabase SQL' : 'Hardened 6-Layer Supabase SQL'}
              </h3>
              <p className="text-[11px] text-slate-400">
                PostgreSQL DDL, CHECK Constraints, Storage Bucket & Strict RLS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="p-3 bg-emerald-950/30 border-b border-slate-800 flex items-start gap-2 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-snug">
            Paste this directly into your <b>Supabase SQL Editor</b>. It enforces database-level integrity, forces Row-Level Security, and creates the secured avatar storage bucket.
          </span>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{HARDENED_BACKEND_SQL_SCHEMA}</pre>
        </div>

        {/* Footer with 1-Click Copy */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <span className="text-xs text-slate-400">
            {copied ? 'Copied to clipboard!' : 'Ready to execute in Supabase'}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : '1-Click Copy SQL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
