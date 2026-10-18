import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { ShieldCheck, User, KeyRound, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';

interface StudentLoginProps {
  onSwitchToStaff: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onSwitchToStaff }) => {
  const { loginStudent } = useAuth();
  const { t, language } = useLanguage();

  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lockoutSec, setLockoutSec] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !pin) {
      setError(language === 'hi' ? 'कृपया छात्र आईडी और पिन दोनों दर्ज करें।' : 'Please enter both Student ID and PIN.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setLockoutSec(null);

    const res = await loginStudent(studentId.trim(), pin.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message || 'लॉगिन विफल रहा। कृपया पुनः प्रयास करें।');
      if (res.lockoutSeconds) {
        setLockoutSec(res.lockoutSeconds);
      }
    }
  };

  const handleQuickFill = (id: string, p: string) => {
    setStudentId(id);
    setPin(p);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('loginAsStudent')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {language === 'hi'
              ? 'कक्षा 6: करके सीखें, समझकर बढ़ें'
              : 'Class 6: Learn by Doing, Grow by Understanding'}
          </p>
        </div>

        {/* Error / Lockout Alert */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              {lockoutSec && (
                <p className="text-xs mt-1 text-red-700">
                  {language === 'hi'
                    ? `शेष समय: ${Math.ceil(lockoutSec / 60)} मिनट। यदि आप पिन भूल गए हैं तो अपने शिक्षक से संपर्क करें।`
                    : `Remaining lockout: ${Math.ceil(lockoutSec / 60)} minutes. Ask your teacher to reset your PIN.`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('studentIdLabel')}
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                placeholder={t('studentIdPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('pinLabel')}
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t('pinPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                disabled={isSubmitting}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {language === 'hi' ? 'सुरक्षित 4-अंकीय पिन' : 'Secure 4-digit student PIN'}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-base rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'जाँच हो रही है...' : t('loginBtn')}</span>
          </button>
        </form>

        {/* Synthetic Demo Accounts Pill Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'hi' ? 'डेमो विद्यार्थी (क्लिक कर भरें):' : 'Demo Students (Click to fill):'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('STU-1001', '4321')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition text-center"
            >
              आरव (1001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('STU-1002', '4321')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition text-center"
            >
              प्रिया (1002)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('STU-1003', '4321')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition text-center"
            >
              रोहन (1003)
            </button>
          </div>
        </div>

        {/* Switch to Teacher Login */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onSwitchToStaff}
            className="text-xs font-bold text-slate-600 hover:text-brand-600 transition underline underline-offset-4"
          >
            {language === 'hi' ? 'शिक्षिका / व्यवस्थापक हैं? यहाँ प्रवेश करें →' : 'Teacher or Administrator? Sign in here →'}
          </button>
        </div>
      </div>
    </div>
  );
};
