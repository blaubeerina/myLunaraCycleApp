
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Language, AppMode, UserPreferences, Theme, DailyEntryData, Reminder } from '@/lib/types';
import { translations, getTranslator } from '@/lib/translations';
import { themes as appThemes, applyThemeToDocument, DEFAULT_THEME_ID } from '@/lib/themes';

interface AppDataType {
  dailyEntries: Record<string, DailyEntryData>; // Date string 'YYYY-MM-DD' as key
  // cycleInfo?: CycleInfo; // Current calculated cycle info - will be calculated on demand
  reminders: Reminder[];
}

const INITIAL_APP_DATA: AppDataType = {
  dailyEntries: {},
  reminders: [],
};

const APP_DATA_STORAGE_KEY_PREFIX = 'myLunaraCycle_appData_v1_'; // Added versioning
const USER_PREFERENCES_STORAGE_KEY = 'myLunaraCycle_userPreferences_v2';


interface AppContextType {
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  t: (key: string, params?: Record<string, string | number>) => string;
  activeTheme: string;
  setActiveTheme: (themeId: string) => void;
  availableThemes: Theme[];
  
  appData: AppDataType;
  loadAppData: (userId: string) => Promise<void>;
  saveDailyEntry: (userId: string, entry: DailyEntryData) => Promise<void>;
  getDailyEntry: (userId: string, date: string) => DailyEntryData | undefined;
  // Add more actions like addReminder, updateReminder, etc.
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    language: 'en',
    appMode: 'cycle',
    theme: DEFAULT_THEME_ID, 
  });
  const [activeTheme, setActiveThemeState] = useState<string>(DEFAULT_THEME_ID);
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const [appData, setAppData] = useState<AppDataType>(INITIAL_APP_DATA);
  // const [isAppDataLoaded, setIsAppDataLoaded] = useState(false); // Keep if needed for loading indicators

  useEffect(() => {
    const storedPrefs = localStorage.getItem(USER_PREFERENCES_STORAGE_KEY);
    if (storedPrefs) {
      try {
        const parsedPrefs = JSON.parse(storedPrefs) as Partial<UserPreferences>;
        const currentTheme = parsedPrefs.theme || DEFAULT_THEME_ID;
        setUserPreferences(prev => ({
          ...prev,
          ...parsedPrefs,
          language: parsedPrefs.language || 'en',
          appMode: parsedPrefs.appMode || 'cycle',
          theme: currentTheme,
        }));
        setActiveThemeState(currentTheme);
      } catch (e) { 
        console.error("Failed to parse user preferences", e);
        setActiveThemeState(DEFAULT_THEME_ID); // Fallback
      }
    } else {
      setActiveThemeState(DEFAULT_THEME_ID); // Default if nothing stored
    }
    setIsPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (isPreferencesLoaded) {
      localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(userPreferences));
      applyThemeToDocument(userPreferences.theme); // Apply theme based on userPreferences
    }
  }, [userPreferences, isPreferencesLoaded]);

  // This effect ensures theme is applied if activeTheme changes directly (e.g. by setActiveTheme)
  useEffect(() => {
    if (isPreferencesLoaded) {
       applyThemeToDocument(activeTheme);
    }
  }, [activeTheme, isPreferencesLoaded]);


  const setActiveThemeCallback = useCallback((themeId: string) => {
    const themeExists = appThemes.some(theme => theme.id === themeId);
    const newThemeId = themeExists ? themeId : DEFAULT_THEME_ID;
    setActiveThemeState(newThemeId); // Update local state for immediate UI feedback
    setUserPreferences(prev => ({...prev, theme: newThemeId})); // This will trigger the save & apply effect
    if (!themeExists) {
      console.warn(`Theme with id "${themeId}" not found. Falling back to default.`);
    }
  }, []);
  
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslator(userPreferences.language)(key, params);
    },
    [userPreferences.language]
  );

  const getAppDataStorageKey = (userId: string) => `${APP_DATA_STORAGE_KEY_PREFIX}${userId}`;

  const loadAppData = useCallback(async (userId: string) => {
    // setIsAppDataLoaded(false); // If you have loading states based on this
    try {
      const storedData = localStorage.getItem(getAppDataStorageKey(userId));
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Basic validation or migration could happen here
        setAppData(parsedData.dailyEntries ? parsedData : INITIAL_APP_DATA);
      } else {
        setAppData(INITIAL_APP_DATA);
      }
    } catch (error) {
      console.error("Failed to load app data:", error);
      setAppData(INITIAL_APP_DATA);
    } finally {
      // setIsAppDataLoaded(true);
    }
  }, []);

  const saveAppData = useCallback(async (userId: string, dataToSave: AppDataType) => {
    try {
      localStorage.setItem(getAppDataStorageKey(userId), JSON.stringify(dataToSave));
      // No need to setAppData here, it's usually called by the function that modifies data.
    } catch (error) {
      console.error("Failed to save app data:", error);
    }
  }, []);

  const saveDailyEntry = useCallback(async (userId: string, entry: DailyEntryData) => {
    setAppData(prevData => {
      const newEntries = { ...prevData.dailyEntries, [entry.date]: entry };
      const newData = { ...prevData, dailyEntries: newEntries };
      // Asynchronously save to localStorage without blocking state update
      saveAppData(userId, newData);
      return newData; // Update state immediately for responsiveness
    });
  }, [saveAppData]);

  const getDailyEntry = useCallback((userId: string, date: string): DailyEntryData | undefined => {
    return appData.dailyEntries[date];
  }, [appData.dailyEntries]);
  
  if (!isPreferencesLoaded) {
    return null; 
  }

  return (
    <AppContext.Provider value={{ 
      userPreferences, setUserPreferences, 
      t, 
      activeTheme, setActiveTheme: setActiveThemeCallback, availableThemes: appThemes,
      appData, loadAppData, saveDailyEntry, getDailyEntry,
    }}>
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
