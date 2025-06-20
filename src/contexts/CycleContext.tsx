
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Language, AppMode, UserPreferences, Theme, DailyEntryData, CycleInfo, Reminder } from '@/lib/types';
import { translations, getTranslator } from '@/lib/translations';
import { themes as appThemes, applyThemeToDocument, DEFAULT_THEME_ID } from '@/lib/themes';

// Define specific data structures related to cycle and app data that AppContext will manage
// This is a simplified version, expand as needed
interface AppDataType {
  dailyEntries: Record<string, DailyEntryData>; // Date string 'YYYY-MM-DD' as key
  cycleInfo?: CycleInfo; // Current calculated cycle info
  reminders: Reminder[];
}

const INITIAL_APP_DATA: AppDataType = {
  dailyEntries: {},
  reminders: [],
};

const APP_DATA_STORAGE_KEY_PREFIX = 'myLunaraCycle_appData_';


interface AppContextType {
  userPreferences: UserPreferences;
  setUserPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  t: (key: string, params?: Record<string, string | number>) => string;
  activeTheme: string;
  setActiveTheme: (themeId: string) => void;
  availableThemes: Theme[];
  
  // App specific data and actions
  appData: AppDataType;
  loadAppData: (userId: string) => Promise<void>;
  saveDailyEntry: (userId: string, entry: DailyEntryData) => Promise<void>;
  getDailyEntry: (userId: string, date: string) => DailyEntryData | undefined;
  // Add more actions like addReminder, updateReminder, calculateCycleInfo etc.
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const USER_PREFERENCES_STORAGE_KEY = 'myLunaraCycle_userPreferences_v2'; // Incremented version

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    language: 'en',
    appMode: 'cycle',
    theme: DEFAULT_THEME_ID, 
  });
  const [activeTheme, setActiveThemeState] = useState<string>(DEFAULT_THEME_ID);
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const [appData, setAppData] = useState<AppDataType>(INITIAL_APP_DATA);
  const [isAppDataLoaded, setIsAppDataLoaded] = useState(false);


  // Effect for loading and saving user preferences
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
      } catch (e) { console.error("Failed to parse user preferences", e); }
    }
    setIsPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (isPreferencesLoaded) {
      localStorage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(userPreferences));
    }
  }, [userPreferences, isPreferencesLoaded]);

  useEffect(() => {
    if (isPreferencesLoaded) { // Apply theme only after preferences (which include theme) are loaded
      applyThemeToDocument(activeTheme);
      // Update userPreferences if theme is changed externally, though setActiveTheme below handles internal changes
       if (userPreferences.theme !== activeTheme) {
         setUserPreferences(prev => ({...prev, theme: activeTheme}));
       }
    }
  }, [activeTheme, isPreferencesLoaded, userPreferences.theme]);


  const setActiveTheme = (themeId: string) => {
    const themeExists = appThemes.some(theme => theme.id === themeId);
    const newThemeId = themeExists ? themeId : DEFAULT_THEME_ID;
    setActiveThemeState(newThemeId);
    setUserPreferences(prev => ({...prev, theme: newThemeId})); // Ensure preference is also updated
    if (!themeExists) {
      console.warn(`Theme with id "${themeId}" not found. Falling back to default.`);
    }
  };
  
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslator(userPreferences.language)(key, params);
    },
    [userPreferences.language]
  );

  // --- App Data Management ---
  const getAppDataStorageKey = (userId: string) => `${APP_DATA_STORAGE_KEY_PREFIX}${userId}`;

  const loadAppData = useCallback(async (userId: string) => {
    setIsAppDataLoaded(false);
    try {
      const storedData = localStorage.getItem(getAppDataStorageKey(userId));
      if (storedData) {
        setAppData(JSON.parse(storedData));
      } else {
        setAppData(INITIAL_APP_DATA); // Initialize if nothing stored
      }
    } catch (error) {
      console.error("Failed to load app data:", error);
      setAppData(INITIAL_APP_DATA);
    } finally {
      setIsAppDataLoaded(true);
    }
  }, []);

  const saveAppData = useCallback(async (userId: string, dataToSave: AppDataType) => {
    try {
      localStorage.setItem(getAppDataStorageKey(userId), JSON.stringify(dataToSave));
      setAppData(dataToSave); // Update context state
    } catch (error) {
      console.error("Failed to save app data:", error);
    }
  }, []);

  const saveDailyEntry = useCallback(async (userId: string, entry: DailyEntryData) => {
    setAppData(prevData => {
      const newEntries = { ...prevData.dailyEntries, [entry.date]: entry };
      const newData = { ...prevData, dailyEntries: newEntries };
      saveAppData(userId, newData); // Persist to localStorage
      return newData; // Update state
    });
  }, [saveAppData]);

  const getDailyEntry = useCallback((userId: string, date: string): DailyEntryData | undefined => {
    // Ensure appData is loaded, though direct access here might not reflect immediate state from async load.
    // This function would typically be called after loadAppData.
    return appData.dailyEntries[date];
  }, [appData.dailyEntries]);
  

  if (!isPreferencesLoaded) { // Wait for preferences to load to prevent FOUC
    return null; 
  }

  return (
    <AppContext.Provider value={{ 
      userPreferences, setUserPreferences, 
      t, 
      activeTheme, setActiveTheme, availableThemes: appThemes,
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

// The old CycleContext.tsx content is removed as its functionality is merged into this AppContext.
// Ensure all imports of useCycleContext are updated to useAppContext and adapt to new structure.
