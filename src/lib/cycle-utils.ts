
import type { DailyEntryData, CycleInfo, CyclePhase } from './types';
import { differenceInDays, parseISO, format, addDays } from 'date-fns';

const DEFAULT_CYCLE_LENGTH = 28;
const MENSTRUATION_MAX_DAYS = 7; // Typical max, can be adjusted
const FOLLICULAR_END_DAY = 13; // Approx end relative to period start
const OVULATION_START_DAY = 14; // Approx start
const OVULATION_END_DAY = 16; // Approx end

/**
 * Finds the start date of the most recent period based on bleeding entries.
 * Iterates backwards from the most recent entry.
 */
function findLastPeriodStartDate(entries: DailyEntryData[]): string | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  // Sort entries by date descending to process most recent first
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let lastPeriodStart: string | undefined = undefined;
  let currentBleedingSequenceStartDate: string | undefined = undefined;

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    if (entry.isBleeding) {
      // If this is a bleeding day, it could be the start of the current sequence
      currentBleedingSequenceStartDate = entry.date;
      // If the previous day (if exists and is in map) was NOT bleeding, this is a new start
      const prevDayDate = format(addDays(parseISO(entry.date), -1), 'yyyy-MM-dd');
      const prevDayEntry = sortedEntries.find(e => e.date === prevDayDate);
      if (!prevDayEntry || !prevDayEntry.isBleeding) {
        // This is the start of a bleeding sequence.
        // Since we iterate backwards, the first one we find is the most recent period start.
        lastPeriodStart = entry.date;
        break; 
      }
    } else {
      // If we encounter a non-bleeding day AND we were in a bleeding sequence,
      // the 'currentBleedingSequenceStartDate' holds the start of the *previous* sequence.
      // However, due to iterating backwards, the logic above should catch the latest start directly.
    }
  }
  
  // If we found a bleeding sequence, but it went to the oldest entry,
  // currentBleedingSequenceStartDate would be the start of that one.
  if (!lastPeriodStart && currentBleedingSequenceStartDate) {
      lastPeriodStart = currentBleedingSequenceStartDate;
  }

  return lastPeriodStart;
}

export function calculateCycleInfo(currentDateStr: string, allEntries: DailyEntryData[]): CycleInfo {
  const lastPeriodStartDateStr = findLastPeriodStartDate(allEntries);

  if (!lastPeriodStartDateStr) {
    return { phase: 'Unknown', cycleDay: 0, estimatedCycleLength: DEFAULT_CYCLE_LENGTH };
  }

  const lastPeriodStartDate = parseISO(lastPeriodStartDateStr);
  const currentDate = parseISO(currentDateStr);
  
  let cycleDay = differenceInDays(currentDate, lastPeriodStartDate) + 1;

  if (cycleDay < 1) { 
    // This can happen if currentDate is before lastPeriodStartDate (e.g. looking at past entries)
    // Or if data is inconsistent. For simplicity, treat as unknown or adjust logic.
    // For now, let's assume we're calculating for a date on or after the period start.
    // If we are calculating for a date *within* the bleeding entries that *is* the start, day is 1.
     cycleDay = 1; // Or handle as 'Unknown' if currentDate is truly before period start.
  }


  let phase: CyclePhase = 'Unknown';
  const currentEntry = allEntries.find(e => e.date === currentDateStr);

  // 1. Menstruation Phase
  if (currentEntry?.isBleeding && cycleDay <= MENSTRUATION_MAX_DAYS) {
    phase = 'Menstruation';
  }
  // 2. Follicular Phase (can overlap with end of menstruation if menstruation is short)
  // Typically up to ovulation.
  else if (cycleDay <= FOLLICULAR_END_DAY) {
    phase = 'Follicular';
  }
  // 3. Ovulation Phase (approximate)
  else if (cycleDay >= OVULATION_START_DAY && cycleDay <= OVULATION_END_DAY) {
    phase = 'Ovulation';
  }
  // 4. Luteal Phase
  else if (cycleDay > OVULATION_END_DAY && cycleDay <= DEFAULT_CYCLE_LENGTH) {
    // After ovulation, before next period (assuming default cycle length)
    phase = 'Luteal';
  }
  // If cycleDay is beyond the default length, it might be late Luteal or new cycle hasn't been logged.
  else if (cycleDay > DEFAULT_CYCLE_LENGTH) {
     phase = 'Luteal'; // Could also be 'Unknown' or 'Awaiting Next Cycle'
  }


  // If still bleeding after typical menstruation days but within follicular, it's still menstruation.
  if (phase === 'Follicular' && currentEntry?.isBleeding) {
    phase = 'Menstruation';
  }


  return {
    phase,
    cycleDay,
    lastPeriodStartDate: lastPeriodStartDateStr,
    estimatedCycleLength: DEFAULT_CYCLE_LENGTH,
  };
}
