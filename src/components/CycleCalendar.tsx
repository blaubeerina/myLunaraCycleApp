
'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
  isValid,
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Droplet, Dot } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import type { DailyCalendarInfo, PeriodLogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext'; // For accessing period logs

interface CycleCalendarProps {
  onDayClick: (date: Date) => void; // To open the log dialog
}

export function CycleCalendar({ onDayClick }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const { lastPeriodDate, lastPeriodEndDate, getPeriodLog } = useCycleContext();
  const [periodInterval, setPeriodInterval] = useState<{start: Date, end: Date} | null>(null);

  useEffect(() => {
    // This interval is for the *main* period defined by user inputs, not individual log days
    if (lastPeriodDate && lastPeriodEndDate) {
      const start = parseISO(lastPeriodDate);
      const end = parseISO(lastPeriodEndDate);
      if (isValid(start) && isValid(end) && end >= start) {
        setPeriodInterval({ start, end });
      } else {
        setPeriodInterval(null);
      }
    } else if (lastPeriodDate) {
        const start = parseISO(lastPeriodDate);
        if (isValid(start)) {
            setPeriodInterval({start, end: start}); // Treat as single day if no end date
        } else {
            setPeriodInterval(null);
        }
    } else {
      setPeriodInterval(null);
    }
  }, [lastPeriodDate, lastPeriodEndDate]);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-4 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDisplayMonth(subMonths(currentDisplayMonth, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h2 className="text-xl font-semibold text-primary">
          {format(currentDisplayMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDisplayMonth(addMonths(currentDisplayMonth, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    // weekStartsOn: 1 for Monday
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-sm py-2">
          {format(addDays(firstDayOfWeek, i), 'EE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border bg-border">{daysHeader}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDisplayMonth);
    const monthEnd = endOfMonth(monthStart);
    // weekStartsOn: 1 for Monday
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: JSX.Element[] = [];
    let dayPointer = startDate;

    while (dayPointer <= endDate) {
      const weekDays: JSX.Element[] = [];
      for (let i = 0; i < 7; i++) {
        const dayClone = new Date(dayPointer);
        const formattedDateKey = format(dayClone, 'yyyy-MM-dd');
        const periodLog = getPeriodLog(formattedDateKey);
        const isPeriodDayFromLog = periodLog && periodLog.intensity !== 'none';

        // isPeriod is from main user input, isPeriodDayFromLog is from detailed log
        const isPeriod = periodInterval ? isWithinInterval(dayClone, periodInterval) : false;

        const dayInfo: DailyCalendarInfo = {
          date: dayClone,
          dayOfMonth: parseInt(format(dayClone, 'd')),
          isCurrentMonth: isSameMonth(dayClone, monthStart),
          isToday: isSameDay(dayClone, new Date()),
          cycleDay: null, // Cycle day logic is handled on the main page now
          moonPhase: getMoonPhase(dayClone),
          moonEmoji: getMoonEmoji(getMoonPhase(dayClone)),
          isPeriodDay: isPeriod, // Main period
          periodLog: periodLog,
        };
        
        // Tailwind classes for day cells
        let cellClasses = `min-h-[4rem] md:min-h-[4.5rem] p-2 flex flex-col items-center justify-center 
                           cursor-pointer transition-colors duration-150 ease-in-out
                           border-r border-b border-border 
                           ${getDay(dayClone) === 0 ? 'border-r-0' : ''}`; // getDay() 0 is Sunday, 6 is Saturday
        
        if (!dayInfo.isCurrentMonth) {
          cellClasses += ' bg-background/30 hover:bg-card/50 text-muted-foreground/50';
        } else if (dayInfo.isToday) {
          cellClasses += ' bg-primary/10 hover:bg-primary/20';
        } else {
          cellClasses += ' bg-card hover:bg-card/80';
        }
        if (isPeriodDayFromLog) {
            cellClasses += ' relative'; // For positioning the dot
        }


        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => onDayClick(dayInfo.date)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}`}
          >
            <span className={`text-xs font-medium self-start ${dayInfo.isToday ? 'bg-primary text-primary-foreground rounded-full px-1.5 py-0.5' : dayInfo.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/70'}`}>
              {dayInfo.dayOfMonth}
            </span>
            <div className="flex-grow flex flex-col items-center justify-center">
              <span className={`text-xl ${!dayInfo.isCurrentMonth ? 'opacity-50' : ''}`}>
                {dayInfo.moonEmoji}
              </span>
              {isPeriodDayFromLog && (
                <Dot className="h-5 w-5 text-destructive absolute bottom-1 right-1" />
              )}
            </div>
          </div>
        );
        dayPointer = addDays(dayPointer, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border" key={`week-${format(dayPointer, 'yyyy-MM-dd')}`}>
          {weekDays}
        </div>
      );
    }
    return <div className="border-l border-border">{rows}</div>;
  };

  return (
    <div className="w-full bg-card shadow-md rounded-lg overflow-hidden my-6">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
