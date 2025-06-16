
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
  parseISO // Added parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import type { DailyCalendarInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';
import { cn } from '@/lib/utils';
import { calculateCycleDay } from '@/lib/cycle-utils';


interface CycleCalendarProps {
  onDayClick: (date: Date) => void;
  hasSufficientDataForDisplay?: boolean; // New prop
}

export function CycleCalendar({ onDayClick, hasSufficientDataForDisplay }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const { getPeriodLog, lastPeriodDate } = useCycleContext(); // get lastPeriodDate for cycle day calculation

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDisplayMonth(subMonths(currentDisplayMonth, 1))}
          aria-label="Previous month"
          className="text-foreground/70 hover:text-foreground"
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
          className="text-foreground/70 hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); 
    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-xs py-1.5">
          {format(addDays(firstDayOfWeek, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border/30 bg-border/20">{daysHeader}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDisplayMonth);
    const monthEnd = endOfMonth(monthStart);
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
        
        const dayInfo: DailyCalendarInfo = {
          date: dayClone,
          dayOfMonth: parseInt(format(dayClone, 'd')),
          isCurrentMonth: isSameMonth(dayClone, monthStart),
          isToday: isSameDay(dayClone, new Date()),
          cycleDay: lastPeriodDate ? calculateCycleDay(lastPeriodDate, dayClone) : null,
          moonPhase: getMoonPhase(dayClone),
          moonEmoji: getMoonEmoji(getMoonPhase(dayClone)),
          periodLog: periodLog,
          isBleedingDay: periodLog?.intensity !== 'none' && periodLog?.intensity !== undefined,
        };
        
        let cellClasses = `min-h-[4rem] md:min-h-[4.5rem] p-1.5 flex flex-col items-start justify-between 
                           cursor-pointer transition-all duration-150 ease-in-out relative
                           border-r border-b border-border/20 rounded-sm
                           hover:shadow-[0_0_8px_1px_hsl(var(--secondary)/0.2)]`;
        
        if (getDay(dayClone) === 0 ) { // Sunday (last day of week if weekStartsOn: 1)
           cellClasses = cn(cellClasses, 'border-r-0');
        }
        
        let textColor = 'text-[hsl(var(--calendar-normal-text))]';
        let bgColor = 'bg-transparent';
        
        if (dayInfo.isToday) {
          bgColor = 'bg-[hsla(var(--calendar-today-bg-raw),0.5)]';
          textColor = 'text-[hsl(var(--calendar-today-text))]';
        }
        
        // Conditional bleeding day styling based on hasSufficientDataForDisplay
        const showBleedingStyle = hasSufficientDataForDisplay && dayInfo.isBleedingDay;

        if (showBleedingStyle) {
          bgColor = 'bg-[hsla(var(--calendar-bleeding-bg-raw),0.1)]'; 
          textColor = 'text-[hsl(var(--calendar-bleeding-text))]'; 
        }

        if (!dayInfo.isCurrentMonth) {
          textColor = 'text-muted-foreground/30'; 
          bgColor = 'bg-background/20'; 
        }
        
        cellClasses = cn(cellClasses, bgColor, textColor);


        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => onDayClick(dayInfo.date)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}${showBleedingStyle ? ', Bleeding Logged' : ''}`}
          >
            {showBleedingStyle && (
              <span className="absolute top-1 right-1.5 text-[10px] text-[hsl(var(--calendar-bleeding-indicator))]">●</span>
            )}
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm font-medium ${dayInfo.isToday ? 'font-bold' : ''}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-xs opacity-50`} style={{color: 'hsl(var(--color-moon))'}}>
                {dayInfo.moonEmoji}
              </span>
            </div>
            {/* Removed cycle day and other text from here for minimalism */}
          </div>
        );
        dayPointer = addDays(dayPointer, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border/20" key={`week-${format(dayPointer, 'yyyy-MM-dd')}`}>
          {weekDays}
        </div>
      );
    }
    return <div className="border-l border-t border-border/30 rounded-md overflow-hidden shadow-sm bg-background/5 ">{rows}</div>;
  };

  return (
    <div className="w-full bg-card/30 rounded-md overflow-hidden border border-border/30">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
