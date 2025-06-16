
'use client';

import React, { useState } from 'react';
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
  isBefore,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateCycleDay } from '@/lib/cycle-utils';
import { getMoonPhase, getMoonEmoji, getAffirmationForMoonPhase } from '@/lib/moon-utils';
import type { DailyCalendarInfo } from '@/lib/types';
import { Button } from '@/components/ui/button'; // Assuming Button component exists and is styled by theme

interface CycleCalendarProps {
  lastPeriodDate: string | null;
}

export function CycleCalendar({ lastPeriodDate }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());

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
    const firstDayOfWeek = startOfWeek(new Date()); // Any date to get week days
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
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Assuming week starts on Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: JSX.Element[] = [];
    let days: DailyCalendarInfo[] = [];
    let dayPointer = startDate;

    while (dayPointer <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cycleDay = calculateCycleDay(lastPeriodDate, dayPointer);
        const moonPhaseName = getMoonPhase(dayPointer);
        
        days.push({
          date: new Date(dayPointer),
          dayOfMonth: parseInt(format(dayPointer, 'd')),
          isCurrentMonth: isSameMonth(dayPointer, monthStart),
          isToday: isSameDay(dayPointer, new Date()),
          cycleDay: cycleDay,
          moonPhase: moonPhaseName,
          moonEmoji: getMoonEmoji(moonPhaseName),
          affirmation: getAffirmationForMoonPhase(moonPhaseName),
        });
        dayPointer = addDays(dayPointer, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border" key={`week-${format(dayPointer, 'yyyy-MM-dd')}`}>
          {days.map((dayInfo) => (
            <div
              key={dayInfo.date.toISOString()}
              className={`min-h-[8rem] md:min-h-[9rem] p-2 flex flex-col items-start
                          ${dayInfo.isCurrentMonth ? 'bg-card hover:bg-card/80' : 'bg-background/50 hover:bg-card/60 text-muted-foreground/70'}
                          cursor-default transition-colors duration-150 ease-in-out
                          border-r border-b border-border 
                          ${dayInfo.date.getDay() === 0 ? 'border-r-0' : ''} 
                         `}
              aria-label={`Date ${format(dayInfo.date, 'PPP')}`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-2xl ${!dayInfo.isCurrentMonth ? 'opacity-50' : ''}`}>
                  {dayInfo.moonEmoji}
                </span>
                <span className={`text-xs font-medium self-start ${dayInfo.isToday ? 'bg-primary text-primary-foreground rounded-full px-1.5 py-0.5' : dayInfo.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                  {dayInfo.dayOfMonth}
                </span>
              </div>
              
              <div className="flex-grow mt-1 w-full space-y-1 text-left">
                {dayInfo.cycleDay && (
                  <p className="text-xs text-primary">Cycle Day {dayInfo.cycleDay}</p>
                )}
                <p className="text-xs text-foreground/80 leading-tight">
                  {dayInfo.affirmation}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-border">{rows}</div>;
  };

  return (
    <div className="w-full bg-card shadow-lg rounded-lg overflow-hidden my-8">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
