import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle, Delete, Eye, EyeOff } from 'lucide-react';
import { verifyPin, hashPin, generateSalt } from '../utils/security';
import { UserProfile } from '../types';
import { Language, TRANSLATIONS } from '../utils/i18n';

interface PinLockModalProps {
  isOpen: boolean;
  mode: 'unlock' | 'setup';
  profile: UserProfile;
  onSuccess: (updatedProfile?: UserProfile) => void;
  onCancel?: () => void;
  language: Language;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  mode,
  profile,
  onSuccess,
  onCancel,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDigits, setShowDigits] = useState<boolean>(false);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  if (!isOpen) return null;

  const handleKeyPress = async (num: string) => {
    if (cooldownRemaining > 0) return;
    if (pin.length >= 4) return;

    const nextPin = pin + num;
    setPin(nextPin);
    setErrorMessage(null);

    if (nextPin.length === 4) {
      if (mode === 'unlock') {
        await verifyInputPin(nextPin);
      } else {
        // Setup mode
        if (!isConfirming) {
          setConfirmPin(nextPin);
          setPin('');
          setIsConfirming(true);
        } else {
          // Compare nextPin with confirmPin
          if (nextPin === confirmPin) {
            const salt = generateSalt(16);
            const pinHash = await hashPin(nextPin, salt);
            const updated: UserProfile = {
              ...profile,
              pin_enabled: true,
              pin_salt: salt,
              pin_hash: pinHash,
            };
            onSuccess(updated);
          } else {
            setErrorMessage('PIN codes did not match. Please try again.');
            setPin('');
            setConfirmPin('');
            setIsConfirming(false);
          }
        }
      }
    }
  };

  const verifyInputPin = async (candidatePin: string) => {
    if (!profile.pin_salt || !profile.pin_hash) {
      onSuccess();
      return;
    }

    const isValid = await verifyPin(candidatePin, profile.pin_salt, profile.pin_hash);
    if (isValid) {
      setFailedAttempts(0);
      setPin('');
      onSuccess();
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);
      setPin('');

      if (nextFailures >= 5) {
        setCooldownRemaining(30);
        setErrorMessage(t.security.pinLockedWait);
      } else {
        setErrorMessage(`${t.security.wrongPin} (${5 - nextFailures} ${t.security.attemptsLeft})`);
      }
    }
  };

  const handleDelete = () => {
    if (cooldownRemaining > 0) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white text-center shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto mb-3 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {mode === 'setup'
            ? isConfirming
              ? t.security.confirmPin
              : t.security.createPin
            : t.security.enterPin}
        </h3>

        <p className="text-[11px] text-slate-400 mb-5">
          {cooldownRemaining > 0 ? (
            <span className="text-rose-400 font-semibold">
              {t.security.pinLockedWait} ({cooldownRemaining}s)
            </span>
          ) : (
            'Enter your 4-digit security code'
          )}
        </p>

        {/* PIN Dot Indicators */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-400/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                {showDigits && isFilled && (
                  <span className="text-[9px] font-bold text-slate-950 flex items-center justify-center h-full">
                    {pin[idx]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mb-4 bg-rose-500/10 py-1.5 px-3 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px]">{errorMessage}</span>
          </div>
        )}

        {/* 2026 Sleek Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              disabled={cooldownRemaining > 0}
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white text-lg font-semibold active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowDigits(!showDigits)}
            className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Toggle visible digits"
          >
            {showDigits ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            disabled={cooldownRemaining > 0}
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white text-lg font-semibold active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Delete digit"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200 mt-2 cursor-pointer"
          >
            {t.entry.cancel}
          </button>
        )}
      </div>
    </div>
  );
};
