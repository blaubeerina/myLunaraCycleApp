
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
  getDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import type { DailyCalendarInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';
import { cn } from '@/lib/utils';

interface CycleCalendarProps {
  onDayClick: (date: Date) => void;
}

export function CycleCalendar({ onDayClick }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const { getPeriodLog } = useCycleContext();

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-3 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDisplayMonth(subMonths(currentDisplayMonth, 1))}
          aria-label="Previous month"
          className="text-foreground/80 hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentDisplayMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDisplayMonth(addMonths(currentDisplayMonth, 1))}
          aria-label="Next month"
          className="text-foreground/80 hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    // Ensure week starts on Monday for display
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); 
    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-xs py-1.5">
          {format(addDays(firstDayOfWeek, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border/50 bg-border/30">{daysHeader}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDisplayMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday first
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: JSX.Element[] = [];
    let dayPointer = startDate;

    while (dayPointer <= endDate) {
      const weekDays: JSX.Element[] = [];
      for (let i = 0; i < 7; i++) {
        const dayClone = new Date(dayPointer);
        const formattedDateKey = format(dayClone, 'yyyy-MM-dd');
        const periodLog = getPeriodLog(formattedDateKey);
        
        const dayInfo: DailyCalendarInfo = {
          date: dayClone,
          dayOfMonth: parseInt(format(dayClone, 'd')),
          isCurrentMonth: isSameMonth(dayClone, monthStart),
          isToday: isSameDay(dayClone, new Date()),
          cycleDay: null, // Not displayed directly
          moonPhase: getMoonPhase(dayClone),
          moonEmoji: getMoonEmoji(getMoonPhase(dayClone)),
          periodLog: periodLog,
          isBleedingDay: periodLog?.intensity !== 'none' && periodLog?.intensity !== undefined,
          // isFertileDay and isOvulationDay removed
        };
        
        let cellClasses = `min-h-[4.5rem] md:min-h-[5rem] p-1.5 flex flex-col items-start justify-between 
                           cursor-pointer transition-all duration-150 ease-in-out relative
                           border-r border-b border-border/30 
                           ${getDay(dayClone) === 0 ? 'border-r-0' : ''} rounded-sm`; // Using rounded-sm
        
        let textColor = 'text-[hsl(var(--calendar-normal-text))]';
        let bgColor = 'bg-transparent'; // Default normal day background
        
        if (dayInfo.isToday) {
          bgColor = 'bg-[hsla(var(--calendar-today-bg-raw),0.5)]'; // Current Day background #2D374850
          textColor = 'text-[hsl(var(--calendar-today-text))]'; // Current Day text #F6D365
        }
        
        if (dayInfo.isBleedingDay) {
          // Bleeding day background #E53E3E10 (10% opacity)
          bgColor = 'bg-[hsla(var(--calendar-bleeding-bg-raw),0.1)]'; 
          // Bleeding day text #FFFFFF
          textColor = 'text-[hsl(var(--calendar-bleeding-text))]'; 
        }

        if (!dayInfo.isCurrentMonth) {
          textColor = 'text-muted-foreground/40'; 
          bgColor = 'bg-background/30'; 
        }
        
        cellClasses = cn(cellClasses, bgColor, textColor, 'hover:shadow-[0_0_8px_1px_hsl(var(--primary)/0.15)]');


        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => onDayClick(dayInfo.date)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}`}
          >
            {dayInfo.isBleedingDay && (
              <span className="absolute top-1 right-1.5 text-[10px] text-[hsl(var(--calendar-bleeding-indicator))]">●</span>
            )}
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm font-medium ${dayInfo.isToday ? 'font-bold' : ''}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-xs opacity-60`} style={{color: 'hsl(var(--color-moon))'}}>
                {dayInfo.moonEmoji}
              </span>
            </div>
          </div>
        );
        dayPointer = addDays(dayPointer, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border/30" key={`week-${format(dayPointer, 'yyyy-MM-dd')}`}>
          {weekDays}
        </div>
      );
    }
    return <div className="border-l border-t border-border/30 rounded-md overflow-hidden shadow-sm bg-background/10">{rows}</div>;
  };

  return (
    <div className="w-full bg-card/50 rounded-md overflow-hidden">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
