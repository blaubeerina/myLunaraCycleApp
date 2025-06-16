
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { LocalStorageData } from '@/lib/types';
import { calculatePeriodDuration } from '@/lib/cycle-utils'; // Import new utility

const LOCAL_STORAGE_KEY = 'minimalCycleTrackerData_v1';

interface CycleContextType {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null;
  lastPeriodDuration: number | null;
  setPeriodDates: (startDate: string | null, endDate?: string | null) => void;
  isLoading: boolean;
  clearPeriodData: () => void;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastPeriodDate, setLastPeriodDateState] = useState<string | null>(null);
  const [lastPeriodEndDate, setLastPeriodEndDateState] = useState<string | null>(null);
  const [lastPeriodDuration, setLastPeriodDurationState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData: LocalStorageData = JSON.parse(storedData);
        if (parsedData.lastPeriodDate && /^\d{4}-\d{2}-\d{2}$/.test(parsedData.lastPeriodDate)) {
          setLastPeriodDateState(parsedData.lastPeriodDate);
        }
        if (parsedData.lastPeriodEndDate && /^\d{4}-\d{2}-\d{2}$/.test(parsedData.lastPeriodEndDate)) {
          setLastPeriodEndDateState(parsedData.lastPeriodEndDate);
        }
        if (typeof parsedData.lastPeriodDuration === 'number') {
          setLastPeriodDurationState(parsedData.lastPeriodDuration);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const setPeriodDates = useCallback((startDate: string | null, endDate?: string | null) => {
    let newStartDate = startDate;
    let newEndDate = endDate !== undefined ? endDate : lastPeriodEndDate; // Use existing end date if new one not provided
    let newDuration: number | null = null;

    // If only start date is cleared, clear end date and duration too
    if (newStartDate === null) {
        newEndDate = null;
        newDuration = null;
    } else if (newEndDate !== null) { // if endDate is explicitly set to null, it means clear it
      newDuration = calculatePeriodDuration(newStartDate, newEndDate);
    }


    try {
      const dataToStore: LocalStorageData = { 
        lastPeriodDate: newStartDate,
        lastPeriodEndDate: newEndDate,
        lastPeriodDuration: newDuration
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
      setLastPeriodDateState(newStartDate);
      setLastPeriodEndDateState(newEndDate);
      setLastPeriodDurationState(newDuration);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [lastPeriodEndDate]); // Add lastPeriodEndDate to dependencies

  const clearPeriodData = useCallback(() => {
    setPeriodDates(null, null); // This will also clear duration
  }, [setPeriodDates]);

  return (
    <CycleContext.Provider value={{ 
      lastPeriodDate, 
      lastPeriodEndDate,
      lastPeriodDuration,
      setPeriodDates, 
      isLoading,
      clearPeriodData
    }}>
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
