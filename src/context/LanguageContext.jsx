/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();
const STORAGE_KEY = 'museum-language';

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'id';
    }

    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    if (storedLanguage === 'id' || storedLanguage === 'en') {
      return storedLanguage;
    }

    return 'id';
  });

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage !== 'id' && nextLanguage !== 'en') {
      return;
    }
    setLanguage(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const toggleLanguage = () => {
    changeLanguage(language === 'id' ? 'en' : 'id');
  };

  const value = {
    language,
    isIndonesian: language === 'id',
    changeLanguage,
    toggleLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
