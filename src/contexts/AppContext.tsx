'use client';

import type { AppMode, Language, UserPreferences } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getTranslations } from '@/lib/i18n';

interface AppContextType {
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  t: (key: string) => string;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    language: 'en',
    appMode: 'cycle',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading preferences, e.g., from localStorage or API
    const storedLang = localStorage.getItem('myLunaraCycle-lang') as Language | null;
    const storedMode = localStorage.getItem('myLunaraCycle-mode') as AppMode | null;
    
    if (storedLang) {
      setUserPreferences(prev => ({ ...prev, language: storedLang }));
    }
    if (storedMode) {
      setUserPreferences(prev => ({ ...prev, appMode: storedMode }));
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('myLunaraCycle-lang', userPreferences.language);
      localStorage.setItem('myLunaraCycle-mode', userPreferences.appMode);
      document.documentElement.lang = userPreferences.language;
    }
  }, [userPreferences, isLoading]);

  const { t } = getTranslations(userPreferences.language);

  if (isLoading) {
    // You might want to show a global loader here
    return null; 
  }

  return (
    <AppContext.Provider value={{ userPreferences, setUserPreferences, t, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
