
'use client';

import type { AppMode, Language, UserPreferences } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getTranslations } from '@/lib/i18n';
import { DEFAULT_THEME_ID } from '@/lib/themes'; // Import default theme ID

interface AppContextType {
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  t: (key: string) => string;
  isLoading: boolean;
  activeTheme: string;
  setActiveTheme: (themeId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    language: 'en',
    appMode: 'cycle',
    activeTheme: DEFAULT_THEME_ID, // Initialize with default
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTheme, _setActiveTheme] = useState<string>(DEFAULT_THEME_ID);

  useEffect(() => {
    // Load preferences from localStorage
    const storedLang = localStorage.getItem('myLunaraCycle-lang') as Language | null;
    const storedMode = localStorage.getItem('myLunaraCycle-mode') as AppMode | null;
    const storedTheme = localStorage.getItem('myLunaraCycle-themeId');
    
    const initialTheme = storedTheme || DEFAULT_THEME_ID;

    setUserPreferences(prev => ({
      ...prev,
      language: storedLang || prev.language,
      appMode: storedMode || prev.appMode,
      activeTheme: initialTheme,
    }));
    _setActiveTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.lang = storedLang || 'en';
    setIsLoading(false);
  }, []);
  
  const setActiveTheme = (themeId: string) => {
    _setActiveTheme(themeId);
    setUserPreferences(prev => ({ ...prev, activeTheme: themeId }));
    localStorage.setItem('myLunaraCycle-themeId', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('myLunaraCycle-lang', userPreferences.language);
      localStorage.setItem('myLunaraCycle-mode', userPreferences.appMode);
      // Theme is handled by setActiveTheme and initial load effect
      document.documentElement.lang = userPreferences.language;
    }
  }, [userPreferences.language, userPreferences.appMode, isLoading]);

  const { t } = getTranslations(userPreferences.language);

  if (isLoading) {
    // You might want to show a global loader here, or just null
    return null; 
  }

  return (
    <AppContext.Provider value={{ userPreferences, setUserPreferences, t, isLoading, activeTheme, setActiveTheme }}>
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
