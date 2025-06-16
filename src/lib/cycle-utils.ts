
import { differenceInDays, parseISO, startOfDay, addDays, isValid, subDays } from 'date-fns';

const DEFAULT_CYCLE_LENGTH = 28;
const OVULATION_OFFSET_FROM_CYCLE_START = 13; // Ovulation on day 14 (0-indexed 13)
const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5;
const FERTILE_WINDOW_DAYS_AFTER_OVULATION = 0; // Fertile window includes ovulation day

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

    // Calculate days since last period start
    const diffSinceLastPeriodStart = differenceInDays(currentTargetDate, lastPeriodDate);
    
    // Determine current cycle day within the assumed cycle length
    // If a period is very long, cycle day can exceed DEFAULT_CYCLE_LENGTH before reset
    return (diffSinceLastPeriodStart % DEFAULT_CYCLE_LENGTH) + 1;

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
    const lastPeriodDate = startOfDay(parseISO(lastPeriodDateString));
    return addDays(lastPeriodDate, OVULATION_OFFSET_FROM_CYCLE_START);
  } catch (error) {
    console.error("Error estimating ovulation day:", error);
    return null;
  }
}

export function getEstimatedFertileWindow(ovulationDay: Date | null): { start: Date; end: Date } | null {
  if (!ovulationDay) return null;
  try {
    const startDate = subDays(ovulationDay, FERTILE_WINDOW_DAYS_BEFORE_OVULATION);
    const endDate = addDays(ovulationDay, FERTILE_WINDOW_DAYS_AFTER_OVULATION);
    return { start: startDate, end: endDate };
  } catch (error) {
    console.error("Error estimating fertile window:", error);
    return null;
  }
}
