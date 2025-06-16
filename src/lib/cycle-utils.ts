
import { differenceInDays, parseISO, startOfDay, addDays } from 'date-fns';

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
      return null; // Target date is before the last period
    }

    const diff = differenceInDays(currentTargetDate, lastPeriodDate);
    return (diff % DEFAULT_CYCLE_LENGTH) + 1;
  } catch (error) {
    console.error("Error parsing lastPeriodDateString:", error);
    return null;
  }
}

export function getEstimatedNextPeriod(lastPeriodDateString: string | null): Date | null {
    if (!lastPeriodDateString) return null;
    try {
        const lastPeriodDate = startOfDay(parseISO(lastPeriodDateString));
        // This simple model assumes periods always start after DEFAULT_CYCLE_LENGTH days
        // More complex models would track multiple cycles to get an average.
        return addDays(lastPeriodDate, DEFAULT_CYCLE_LENGTH);
    } catch {
        return null;
    }
}
