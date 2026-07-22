import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TRANSLATIONS, LANGUAGES } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LANGUAGE_KEY = 'nuvoratools_language';

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = (localStorage.getItem(LANGUAGE_KEY) || localStorage.getItem('toolhub_language')) as Language;
      if (saved && TRANSLATIONS[saved]) return saved;
      
      const browserLang = navigator.language.slice(0, 2) as Language;
      if (TRANSLATIONS[browserLang]) return browserLang;
    } catch (e) {
      console.error(e);
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, defaultText?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    if (dict[key]) return dict[key];
    const fallbackDict = TRANSLATIONS['en'];
    if (fallbackDict[key]) return fallbackDict[key];
    return defaultText || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
