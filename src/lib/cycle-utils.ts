
import { differenceInDays, parseISO, startOfDay, addDays, isValid } from 'date-fns';

const DEFAULT_CYCLE_LENGTH = 28;

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

// getEstimatedOvulationDay and getEstimatedFertileWindow functions removed as predictions are off.
