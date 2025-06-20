
import { differenceInDays, parseISO, startOfDay, addDays, isValid, format } from 'date-fns';
import type { DailyEntryData, CyclePhaseName, CycleInfo, BleedingIntensity } from './types';

export const DEFAULT_CYCLE_LENGTH = 28; // Average cycle length
export const DEFAULT_PERIOD_LENGTH = 5; // Average period length
const OVULATION_DAY_IN_CYCLE = 14; // Typically day 14 in a 28-day cycle (1-indexed)
const LUTEAL_PHASE_LENGTH = 14; // Typically around 14 days

// Fertile window: 5 days before ovulation + ovulation day itself
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;
const FERTILE_WINDOW_DAYS_AFTER_OVULATION = 0;


export function getMostRecentPeriodStart(dailyEntries: Record<string, DailyEntryData>): DailyEntryData | null {
  const sortedEntries = Object.values(dailyEntries)
    .filter(entry => entry.isPeriodStart)
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  return sortedEntries[0] || null;
}

export function calculateCycleDayNumber(lastPeriodStartDateString: string | null, targetDate: Date): number | null {
  if (!lastPeriodStartDateString) return null;
  const lastPeriodStartDate = startOfDay(parseISO(lastPeriodStartDateString));
  const currentTargetDate = startOfDay(targetDate);
  if (!isValid(lastPeriodStartDate) || !isValid(currentTargetDate) || currentTargetDate < lastPeriodStartDate) return null;
  return differenceInDays(currentTargetDate, lastPeriodStartDate) + 1;
}


export function determineCyclePhase(
  targetDate: Date,
  lastPeriodStartDateString: string | null,
  averageCycleLength: number = DEFAULT_CYCLE_LENGTH,
  averagePeriodLength: number = DEFAULT_PERIOD_LENGTH
): CyclePhaseName {
  if (!lastPeriodStartDateString) return 'Unknown';

  const lastPeriodStart = startOfDay(parseISO(lastPeriodStartDateString));
  if (!isValid(lastPeriodStart)) return 'Unknown';

  const today = startOfDay(targetDate);
  const cycleDay = differenceInDays(today, lastPeriodStart) + 1;

  if (cycleDay < 1) return 'Unknown'; // Date is before last period start

  // Menstruation
  if (cycleDay <= averagePeriodLength) {
    return 'Menstruation';
  }

  // Ovulation day approximation
  const ovulationStartsOnDay = averageCycleLength - LUTEAL_PHASE_LENGTH; // Ovulation day relative to cycle start
  
  // Follicular Phase (after menstruation, before ovulation)
  if (cycleDay < ovulationStartsOnDay) {
    return 'Follicular';
  }

  // Ovulation Day
  if (cycleDay === ovulationStartsOnDay) {
    return 'Ovulation';
  }

  // Luteal Phase (after ovulation, before next period)
  if (cycleDay <= averageCycleLength) {
    return 'Luteal';
  }

  // If cycleDay is beyond averageCycleLength, it's likely into the next cycle's menstruation,
  // but without knowing the *next* period start, this gets complex.
  // For simplicity here, consider it unknown or handle as part of next cycle prediction.
  // This basic model assumes a regular cycle.
  return 'Unknown'; // Or potentially 'Follicular' again if cycle is longer than average
}


export interface FullCycleInfo extends CycleInfo {
  estimatedOvulationDate: Date | null;
  estimatedFertileWindow: { start: Date; end: Date } | null;
  predictedNextPeriodStart: Date | null;
}

export function calculateFullCycleInfoForDate(
  targetDate: Date,
  allEntries: Record<string, DailyEntryData>,
  avgCycleLength: number = DEFAULT_CYCLE_LENGTH,
  avgPeriodLength: number = DEFAULT_PERIOD_LENGTH
): FullCycleInfo {
  const lastPeriodStartEntry = getMostRecentPeriodStart(allEntries);
  const lastPeriodStartDateString = lastPeriodStartEntry ? lastPeriodStartEntry.date : null;

  const cycleDay = lastPeriodStartDateString ? calculateCycleDayNumber(lastPeriodStartDateString, targetDate) : 0;
  let phase: CyclePhaseName = 'Unknown';
  let isFertile = false;
  let isOvulationDay = false;
  
  let estimatedOvulationDate: Date | null = null;
  let estimatedFertileWindow: { start: Date; end: Date } | null = null;
  let predictedNextPeriodStart: Date | null = null;

  if (lastPeriodStartEntry && lastPeriodStartDateString && cycleDay && cycleDay > 0) {
    const lastPeriodStart = startOfDay(parseISO(lastPeriodStartDateString));
    
    // Estimate ovulation and fertile window based on this cycle's start
    const ovulationDayInThisCycle = addDays(lastPeriodStart, (avgCycleLength - LUTEAL_PHASE_LENGTH) - 1);
    estimatedOvulationDate = ovulationDayInThisCycle;

    const fertileStart = addDays(ovulationDayInThisCycle, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION);
    const fertileEnd = addDays(ovulationDayInThisCycle, FERTILE_WINDOW_DAYS_AFTER_OVULATION);
    estimatedFertileWindow = { start: fertileStart, end: fertileEnd };

    // Determine phase
    if (cycleDay <= avgPeriodLength) {
      phase = 'Menstruation';
    } else if (targetDate >= fertileStart && targetDate <= fertileEnd) {
      phase = targetDate.getTime() === ovulationDayInThisCycle.getTime() ? 'Ovulation' : 'Follicular'; // Technically fertile window is part of follicular/ovulation
      isFertile = true;
      if (targetDate.getTime() === ovulationDayInThisCycle.getTime()) {
        isOvulationDay = true;
        phase = 'Ovulation';
      }
    } else if (cycleDay < (avgCycleLength - LUTEAL_PHASE_LENGTH)) {
      phase = 'Follicular';
    } else if (cycleDay <= avgCycleLength) {
      phase = 'Luteal';
    } else { // Beyond the current estimated cycle length, into next cycle prediction
      phase = 'Unknown';
    }
    
    // If today is in the estimated fertile window for current cycle
    if (targetDate >= estimatedFertileWindow.start && targetDate <= estimatedFertileWindow.end) {
        isFertile = true;
        if (targetDate.getTime() === estimatedOvulationDate.getTime()) {
            isOvulationDay = true;
            phase = 'Ovulation';
        } else if (phase !== 'Menstruation') { // Don't override menstruation if it's also fertile
             phase = 'Follicular'; // Or 'Luteal' if ovulation day is much earlier
        }
    }


    // Predict next period start for this cycle
    predictedNextPeriodStart = addDays(lastPeriodStart, avgCycleLength);

  } else {
    // No period data, can't determine much
    phase = 'Unknown';
  }

  return {
    phase,
    cycleDay: cycleDay || 0,
    isFertile,
    isOvulationDay,
    nextPeriodStartDate: predictedNextPeriodStart ? format(predictedNextPeriodStart, 'yyyy-MM-dd') : null,
    estimatedOvulationDate,
    estimatedFertileWindow,
    predictedNextPeriodStart,
  };
}


export function getPredictedOvulationDate(lastPeriodStartDate: Date, avgCycleLength: number = DEFAULT_CYCLE_LENGTH): Date {
  return addDays(lastPeriodStartDate, (avgCycleLength - LUTEAL_PHASE_LENGTH) - 1);
}

export function getPredictedFertileWindow(
  ovulationDate: Date
): { start: Date; end: Date } {
  const start = addDays(ovulationDate, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION);
  const end = addDays(ovulationDate, FERTILE_WINDOW_DAYS_AFTER_OVULATION);
  return { start, end };
}

export function getPredictedNextPeriodDates(
  lastPeriodStartDate: Date,
  count: number = 3, // Number of future periods to predict
  avgCycleLength: number = DEFAULT_CYCLE_LENGTH
): Date[] {
  const dates: Date[] = [];
  for (let i = 1; i <= count; i++) {
    dates.push(addDays(lastPeriodStartDate, avgCycleLength * i));
  }
  return dates;
}

// Helper to determine bleeding background class based on intensity
export const getBleedingBackgroundClass = (intensity?: BleedingIntensity): string => {
  if (!intensity || intensity === 'none') return '';
  switch (intensity) {
    case 'spotting': return 'bg-destructive/20'; // Softer for spotting
    case 'light': return 'bg-destructive/40';
    case 'medium': return 'bg-destructive/60';
    case 'heavy': return 'bg-destructive/80'; // Most prominent for heavy
    default: return '';
  }
};
