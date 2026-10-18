import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { SyncBadge } from './SyncBadge.js';
import { BookOpen, LogOut, Languages, School, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentTab(user?.role === 'student' ? 'student-dashboard' : 'teacher-dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  {language === 'hi' ? 'शिक्षासेतु' : 'ShikshaSetu'}
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                  Class 6
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                {language === 'hi' ? 'करके सीखें, समझकर बढ़ें' : 'Learn by Doing, Grow by Understanding'}
              </p>
            </div>
          </div>

          {/* Right section: Sync indicator, Language toggle, Auth controls */}
          <div className="flex items-center gap-3">
            <SyncBadge />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="हिंदी / English भाषा बदलें"
            >
              <Languages className="w-4 h-4 text-brand-600" />
              <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>

            {isAuthenticated && user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                    <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                    <School className="w-3 h-3" />
                    <span>{user.school_name ? user.school_name.split('(')[0] : user.role}</span>
                  </div>
                </div>

                <button
                  onClick={() => logout(true)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title={t('logoutBtn')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
