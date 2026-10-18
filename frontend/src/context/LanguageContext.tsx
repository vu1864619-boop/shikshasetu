import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../utils/translations.js';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['hi']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hindi is the default language as required by project specifications
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('shikshasetu_lang') as Language) || 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shikshasetu_lang', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations['hi']): string => {
    const dict = translations[language] || translations.hi;
    return (dict as any)[key] || (translations.hi as any)[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
