import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { ShieldCheck, Mail, KeyRound, AlertTriangle, Sparkles, GraduationCap } from 'lucide-react';

interface StaffLoginProps {
  onSwitchToStudent: () => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onSwitchToStudent }) => {
  const { loginStaff } = useAuth();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pin) {
      setError(language === 'hi' ? 'ईमेल और पिन दोनों दर्ज करें।' : 'Please enter email and PIN.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await loginStaff(email.trim(), pin.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message || 'लॉगिन विफल रहा। कृपया विवरण जांचें।');
    }
  };

  const handleQuickFill = (em: string, p: string) => {
    setEmail(em);
    setPin(p);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('loginAsTeacher')}
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {language === 'hi'
              ? 'शिक्षक, प्रधानाध्यापक एवं व्यवस्थापक पोर्टल'
              : 'Teacher, Headmaster & Admin Portal'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {language === 'hi' ? 'ईमेल आईडी (Official Email)' : 'Email ID'}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@shikshasetu.org"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड' : 'Security PIN / Password'}
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'सत्यापन हो रहा है...' : t('loginBtn')}</span>
          </button>
        </form>

        {/* Quick Demo Fill */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'hi' ? 'डेमो स्टाफ खाते:' : 'Demo Staff Accounts:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('anita.sharma@shikshasetu.org', '123456')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition text-left"
            >
              👩‍🏫 अनीता शर्मा (शिक्षिका)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin.rampur@shikshasetu.org', '888888')}
              className="py-1.5 px-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition text-left"
            >
              🏫 स्कूल व्यवस्थापक (Admin)
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onSwitchToStudent}
            className="text-xs font-bold text-slate-600 hover:text-blue-700 transition underline underline-offset-4"
          >
            {language === 'hi' ? '← विद्यार्थी प्रवेश स्क्रीन पर लौटें' : '← Back to Student Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
