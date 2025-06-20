
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Language, AppMode, UserPreferences, Theme } from '@/lib/types';
import { translations, getTranslator } from '@/lib/translations';
import { themes as appThemes, applyThemeToDocument, DEFAULT_THEME_ID } from '@/lib/themes';

interface AppContextType {
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  t: (key: string, params?: Record<string, string | number>) => string;
  activeTheme: string;
  setActiveTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_PREFERENCES_STORAGE_KEY = 'myLunaraCycle_userPreferences_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    language: 'en',
    appMode: 'cycle',
    theme: DEFAULT_THEME_ID, 
  });
  const [activeTheme, setActiveThemeState] = useState<string>(DEFAULT_THEME_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedPrefs = localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
    if (storedPrefs) {
      try {
        const parsedPrefs = JSON.parse(storedPrefs) as Partial<UserPreferences>;
        setUserPreferences(prev => ({
          ...prev,
          ...parsedPrefs,
          language: parsedPrefs.language || 'en',
          appMode: parsedPrefs.appMode || 'cycle',
          theme: parsedPrefs.theme || DEFAULT_THEME_ID,
        }));
        setActiveThemeState(parsedPrefs.theme || DEFAULT_THEME_ID);
      } catch (e) {
        console.error("Failed to parse user preferences from localStorage", e);
        // Stick to defaults if parsing fails
         setActiveThemeState(DEFAULT_THEME_ID);
      }
    } else {
        // Apply default theme if no stored prefs
        setActiveThemeState(DEFAULT_THEME_ID);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) { // Only save after initial load to prevent overwriting with defaults
        try {
            localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(userPreferences));
        } catch (e) {
            console.error("Failed to save user preferences to localStorage", e);
        }
    }
  }, [userPreferences, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      applyThemeToDocument(activeTheme);
      // Update userPreferences as well if theme changes
      setUserPreferences(prev => ({...prev, theme: activeTheme}));
    }
  }, [activeTheme, isLoaded]);


  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslator(userPreferences.language)(key, params);
    },
    [userPreferences.language]
  );

  const setActiveTheme = (themeId: string) => {
    const themeExists = appThemes.some(theme => theme.id === themeId);
    if (themeExists) {
      setActiveThemeState(themeId);
    } else {
      console.warn(`Theme with id "${themeId}" not found. Falling back to default.`);
      setActiveThemeState(DEFAULT_THEME_ID);
    }
  };
  
  if (!isLoaded) {
    return null; // Or a loading spinner, prevents flash of default untranslated/unstyled content
  }

  return (
    <AppContext.Provider value={{ userPreferences, setUserPreferences, t, activeTheme, setActiveTheme, availableThemes: appThemes }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
