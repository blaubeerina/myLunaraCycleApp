
import { differenceInDays, parseISO, startOfDay, addDays, isValid } from 'date-fns';

const DEFAULT_CYCLE_LENGTH = 28;
const TYPICAL_OVULATION_DAY_FROM_START = 14; // Day of cycle (1-indexed)
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;
const FERTILE_WINDOW_DAYS_AFTER_OVULATION = 0; // Ovulation day itself is fertile

export function calculateCycleDay(
  lastPeriodDateString: string | null,
  targetDate: Date
): number | null {
  if (!lastPeriodDateString) {
    return null;
  }
  try {
    const lastPeriodDate = startOfDay(parseISO(lastPeriodDateString));
    const currentTargetDate = startOfDay(targetDate);

    if (currentTargetDate < lastPeriodDate) {
      return null; 
    }

    const diffSinceLastPeriodStart = differenceInDays(currentTargetDate, lastPeriodDate);
    
    // Ensure cycle day doesn't exceed typical cycle length for display,
    // but base calculations on actual difference for predictions.
    // For display, it's often preferred to reset after default length for visual consistency if not predicting.
    // However, since predictions now use this, the raw day is better.
    return diffSinceLastPeriodStart + 1;

  } catch (error) {
    console.error("Error parsing lastPeriodDateString for cycle day:", error);
    return null;
  }
}


export function getEstimatedNextPeriod(lastPeriodDateString: string | null): Date | null {
    if (!lastPeriodDateString) return null;
    try {
        const lastPeriodDate = startOfDay(parseISO(lastPeriodDateString));
        return addDays(lastPeriodDate, DEFAULT_CYCLE_LENGTH);
    } catch {
        return null;
    }
}

export function calculatePeriodDuration(
  startDateString: string | null,
  endDateString: string | null
): number | null {
  if (!startDateString || !endDateString) {
    return null;
  }
  try {
    const startDate = parseISO(startDateString);
    const endDate = parseISO(endDateString);

    if (!isValid(startDate) || !isValid(endDate) || endDate < startDate) {
      return null;
    }
    return differenceInDays(endDate, startDate) + 1;
  } catch (error) {
    console.error("Error calculating period duration:", error);
    return null;
  }
}

export function getEstimatedOvulationDay(lastPeriodDateString: string | null): Date | null {
  if (!lastPeriodDateString) return null;
  try {
    const lastPeriodStartDate = startOfDay(parseISO(lastPeriodDateString));
    // Ovulation is typically mid-cycle. For a 28-day cycle, around day 14.
    // Day 1 of cycle is lastPeriodStartDate. So day 14 is lastPeriodStartDate + 13 days.
    return addDays(lastPeriodStartDate, TYPICAL_OVULATION_DAY_FROM_START - 1);
  } catch {
    return null;
  }
}

export function getEstimatedFertileWindow(ovulationDay: Date | null): { start: Date; end: Date } | null {
  if (!ovulationDay) return null;
  try {
    const fertileStart = addDays(ovulationDay, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION);
    const fertileEnd = addDays(ovulationDay, FERTILE_WINDOW_DAYS_AFTER_OVULATION);
    return { start: startOfDay(fertileStart), end: startOfDay(fertileEnd) };
  } catch {
    return null;
  }
}
