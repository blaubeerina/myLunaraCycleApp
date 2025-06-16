
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { LocalStorageData, PeriodLogEntry, PeriodIntensity, Symptom } from '@/lib/types';
import { calculatePeriodDuration } from '@/lib/cycle-utils';
import { format, parseISO, isValid } from 'date-fns';

const LOCAL_STORAGE_KEY_CYCLE = 'minimalCycleTrackerData_v1';
const LOCAL_STORAGE_KEY_LOGS = 'lunarRhythmsPeriodLogs_v1';

interface CycleContextType {
  lastPeriodDate: string | null;
  lastPeriodEndDate: string | null;
  lastPeriodDuration: number | null;
  periodLogs: Record<string, PeriodLogEntry>;
  setPeriodDates: (startDate: string | null, endDate?: string | null) => void;
  isLoading: boolean;
  clearPeriodData: () => void;
  addPeriodLog: (log: PeriodLogEntry) => void;
  getPeriodLog: (date: string) => PeriodLogEntry | undefined;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export const CycleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastPeriodDate, setLastPeriodDateState] = useState<string | null>(null);
  const [lastPeriodEndDate, setLastPeriodEndDateState] = useState<string | null>(null);
  const [lastPeriodDuration, setLastPeriodDurationState] = useState<number | null>(null);
  const [periodLogs, setPeriodLogsState] = useState<Record<string, PeriodLogEntry>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Load main cycle data
      const storedCycleData = localStorage.getItem(LOCAL_STORAGE_KEY_CYCLE);
      if (storedCycleData) {
        const parsedData: LocalStorageData = JSON.parse(storedCycleData);
        if (parsedData.lastPeriodDate && /^\d{4}-\d{2}-\d{2}$/.test(parsedData.lastPeriodDate)) {
          setLastPeriodDateState(parsedData.lastPeriodDate);
        }
        if (parsedData.lastPeriodEndDate && /^\d{4}-\d{2}-\d{2}$/.test(parsedData.lastPeriodEndDate)) {
          setLastPeriodEndDateState(parsedData.lastPeriodEndDate);
        }
        // Recalculate duration for consistency or load if stored (current setup recalculates)
        if (parsedData.lastPeriodDate && parsedData.lastPeriodEndDate) {
           setLastPeriodDurationState(calculatePeriodDuration(parsedData.lastPeriodDate, parsedData.lastPeriodEndDate));
        } else {
            setLastPeriodDurationState(null);
        }
      }

      // Load period logs
      const storedLogsData = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
      if (storedLogsData) {
        const parsedLogs: Record<string, PeriodLogEntry> = JSON.parse(storedLogsData);
        setPeriodLogsState(parsedLogs || {});
      }

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  const setPeriodDates = useCallback((startDate: string | null, endDate?: string | null) => {
    let newStartDate = startDate;
    let newEndDate = endDate !== undefined ? endDate : lastPeriodEndDate;
    let newDuration: number | null = null;

    if (newStartDate === null) {
        newEndDate = null;
        newDuration = null;
    } else if (newStartDate && newEndDate && isValid(parseISO(newStartDate)) && isValid(parseISO(newEndDate))) {
      newDuration = calculatePeriodDuration(newStartDate, newEndDate);
    }


    try {
      const dataToStore: Pick<LocalStorageData, 'lastPeriodDate' | 'lastPeriodEndDate' | 'lastPeriodDuration'> = {
        lastPeriodDate: newStartDate,
        lastPeriodEndDate: newEndDate,
        lastPeriodDuration: newDuration,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY_CYCLE, JSON.stringify(dataToStore));
      setLastPeriodDateState(newStartDate);
      setLastPeriodEndDateState(newEndDate);
      setLastPeriodDurationState(newDuration);
    } catch (error) {
      console.error("Failed to save cycle data to localStorage", error);
    }
  }, [lastPeriodEndDate]);

  const clearPeriodData = useCallback(() => {
    setPeriodDates(null, null);
    // Optionally clear period logs too, or handle that separately
    // setPeriodLogsState({});
    // localStorage.removeItem(LOCAL_STORAGE_KEY_LOGS);
  }, [setPeriodDates]);

  const addPeriodLog = useCallback((log: PeriodLogEntry) => {
    setPeriodLogsState(prevLogs => {
      const newLogs = { ...prevLogs, [log.date]: log };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(newLogs));
      } catch (error) {
        console.error("Failed to save period logs to localStorage", error);
      }
      return newLogs;
    });
  }, []);

  const getPeriodLog = useCallback((date: string): PeriodLogEntry | undefined => {
    return periodLogs[date];
  }, [periodLogs]);

  return (
    <CycleContext.Provider value={{
      lastPeriodDate,
      lastPeriodEndDate,
      lastPeriodDuration,
      periodLogs,
      setPeriodDates,
      isLoading,
      clearPeriodData,
      addPeriodLog,
      getPeriodLog
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
