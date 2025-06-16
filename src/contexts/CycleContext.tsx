
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { LocalStorageData } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'minimalCycleTrackerData_v1';

interface CycleContextType {
  lastPeriodDate: string | null;
  setLastPeriodDate: (dateString: string | null) => void;
  isLoading: boolean;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastPeriodDate, setLastPeriodDateState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData: LocalStorageData = JSON.parse(storedData);
        if (parsedData.lastPeriodDate) {
          // Basic validation for date string format (YYYY-MM-DD)
          if (/^\d{4}-\d{2}-\d{2}$/.test(parsedData.lastPeriodDate)) {
            setLastPeriodDateState(parsedData.lastPeriodDate);
          } else {
            console.warn("Invalid date format in localStorage, ignoring.");
            localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const setLastPeriodDate = useCallback((dateString: string | null) => {
    try {
      const dataToStore: LocalStorageData = { lastPeriodDate: dateString };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
      setLastPeriodDateState(dateString);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, []);

  return (
    <CycleContext.Provider value={{ lastPeriodDate, setLastPeriodDate, isLoading }}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCycleContext = (): CycleContextType => {
  const context = useContext(CycleContext);
  if (context === undefined) {
    throw new Error('useCycleContext must be used within a CycleProvider');
  }
  return context;
};
