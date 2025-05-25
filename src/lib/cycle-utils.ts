
import type { DailyEntryData, CycleInfo, CyclePhase } from './types';
import { differenceInDays, parseISO, format, addDays, startOfDay } from 'date-fns';

const DEFAULT_AVERAGE_CYCLE_LENGTH = 28;
const DEFAULT_MENSTRUATION_LENGTH = 5; // Typical, can be overridden by actual bleeding logs
const OVULATION_DAY_IN_CYCLE = 14; // Relative to period start, for a typical 28-day cycle
const FERTILE_WINDOW_BEFORE_OVULATION = 2; // Days before ovulation are fertile
const FERTILE_WINDOW_AFTER_OVULATION = 2; // Days after ovulation are fertile (includes ovulation day)
const LUTEAL_PHASE_LENGTH = 14; // Typically stable
const PREMENSTRUAL_PHASE_DAYS_BEFORE_PERIOD = 5;


/**
 * Finds the start date of the most recent period based on bleeding entries.
 * Iterates backwards from the most recent entry.
 */
function findLastPeriodStartDate(entries: DailyEntryData[], forDate?: string): string | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  // Consider entries up to and including forDate if provided, otherwise all entries
  const relevantEntries = forDate 
    ? entries.filter(e => parseISO(e.date) <= parseISO(forDate))
    : entries;

  if (relevantEntries.length === 0) return undefined;


  const sortedEntries = [...relevantEntries].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  let lastActualBleedingDay: DailyEntryData | undefined = undefined;

  // Find the most recent actual bleeding day
  for (const entry of sortedEntries) {
    if (entry.isBleeding) {
      lastActualBleedingDay = entry;
      break;
    }
  }

  if (!lastActualBleedingDay) return undefined; // No bleeding logged at all

  // Now, from this lastActualBleedingDay, go backwards to find the first day of that bleeding sequence
  let currentPeriodStartDate = lastActualBleedingDay.date;
  let dayBefore = addDays(parseISO(currentPeriodStartDate), -1);

  // Create a map for quick lookup of entries by date string
  const entriesMap = new Map(entries.map(e => [e.date, e]));

  while (true) {
    const dayBeforeEntry = entriesMap.get(format(dayBefore, 'yyyy-MM-dd'));
    if (dayBeforeEntry && dayBeforeEntry.isBleeding) {
      currentPeriodStartDate = dayBeforeEntry.date;
      dayBefore = addDays(parseISO(currentPeriodStartDate), -1);
    } else {
      break; // Found the start of this bleeding sequence
    }
  }
  return currentPeriodStartDate;
}


export function calculateCycleInfo(
  currentDateStr: string,
  allEntries: DailyEntryData[],
  averageCycleLength: number = DEFAULT_AVERAGE_CYCLE_LENGTH
): CycleInfo {
  const currentDate = startOfDay(parseISO(currentDateStr));
  const lastPeriodStartDateStr = findLastPeriodStartDate(allEntries, currentDateStr);

  if (!lastPeriodStartDateStr) {
    return {
      phase: 'Unknown',
      cycleDay: 0,
      estimatedCycleLength: averageCycleLength,
    };
  }

  const lastPeriodStartDate = startOfDay(parseISO(lastPeriodStartDateStr));
  const cycleDay = differenceInDays(currentDate, lastPeriodStartDate) + 1;

  if (cycleDay < 1) { // Should not happen if findLastPeriodStartDate is correct for currentDate
    return { phase: 'Unknown', cycleDay: 0, estimatedCycleLength: averageCycleLength, lastPeriodStartDate: lastPeriodStartDateStr };
  }
  
  const currentEntry = allEntries.find(e => e.date === currentDateStr);

  // Phase boundaries (relative to cycleDay)
  // These are simplified; a real app might adjust based on average luteal length, etc.
  const menstrualPhaseEndDay = DEFAULT_MENSTRUATION_LENGTH; // Can be shorter if bleeding stops earlier

  // Ovulation day is tricky. For a standard 28-day cycle, it's day 14.
  // If averageCycleLength differs, ovulation is typically LUTEAL_PHASE_LENGTH days before next period.
  const ovulationDayEstimated = averageCycleLength - LUTEAL_PHASE_LENGTH;

  const fertileWindowStartDay = Math.max(1, ovulationDayEstimated - FERTILE_WINDOW_BEFORE_OVULATION);
  const fertileWindowEndDay = ovulationDayEstimated + FERTILE_WINDOW_AFTER_OVULATION;

  const follicularPhaseEndDay = ovulationDayEstimated - 1;
  const lutealPhaseStartDay = ovulationDayEstimated + 1;
  const lutealPhaseEndDay = averageCycleLength; // End of cycle
  
  const premenstrualPhaseStartDay = Math.max(lutealPhaseStartDay, lutealPhaseEndDay - PREMENSTRUAL_PHASE_DAYS_BEFORE_PERIOD + 1);

  let phase: CyclePhase = 'Unknown';
  let isFertile = false;
  let isOvulationDay = false;

  // Determine Phase
  if (currentEntry?.isBleeding && cycleDay <= menstrualPhaseEndDay + 2) { // Allow slight overrun if still bleeding
    phase = 'Menstruation';
  } else if (cycleDay <= follicularPhaseEndDay) {
    phase = 'Follicular';
  } else if (cycleDay >= ovulationDayEstimated && cycleDay <= ovulationDayEstimated) { // Ovulation Day
    phase = 'Ovulation';
    isOvulationDay = true;
  } else if (cycleDay >= lutealPhaseStartDay && cycleDay <= lutealPhaseEndDay) {
    phase = 'Luteal';
    if (cycleDay >= premenstrualPhaseStartDay) {
      phase = 'Premenstrual';
    }
  }

  // Check for fertile window, ovulation can override general follicular/luteal if logic is simplified
  if (cycleDay >= fertileWindowStartDay && cycleDay <= fertileWindowEndDay) {
    isFertile = true;
    if (cycleDay === ovulationDayEstimated) {
        phase = 'Ovulation'; // Ensure Ovulation phase takes precedence if it's the day
        isOvulationDay = true;
    } else if (phase !== 'Menstruation' && phase !== 'Ovulation') { // Don't override Menstruation
        // If fertile but not ovulation day itself, and not menstruation
        // we might not assign a specific "Fertile" phase unless desired.
        // 'Follicular' or 'Luteal' would still be the primary phase name.
    }
  }
  
  // Refine menstruation if still bleeding after typical window but before ovulation estimation
  if (currentEntry?.isBleeding && phase !== 'Menstruation' && cycleDay <= follicularPhaseEndDay) {
    phase = 'Menstruation';
  }


  const nextPeriodStartDate = format(addDays(lastPeriodStartDate, averageCycleLength), 'yyyy-MM-dd');

  return {
    phase,
    cycleDay,
    lastPeriodStartDate: lastPeriodStartDateStr,
    estimatedCycleLength: averageCycleLength,
    isFertile,
    isOvulationDay,
    nextPeriodStartDate,
    menstrualPhaseEndDay: currentEntry?.isBleeding ? cycleDay : menstrualPhaseEndDay, // More accurate if bleeding
    follicularPhaseEndDay,
    ovulationDayEstimated,
    fertileWindowStartDay,
    fertileWindowEndDay,
    lutealPhaseStartDay,
    premenstrualPhaseStartDay,
  };
}
