
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
  parseISO,
  isValid,
  getDay,
  isWithinInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { getEstimatedOvulationDay, getEstimatedFertileWindow } from '@/lib/cycle-utils';
import type { DailyCalendarInfo, PeriodLogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';
import { cn } from '@/lib/utils';

interface CycleCalendarProps {
  onDayClick: (date: Date) => void;
  lastPeriodStartDate: string | null;
}

export function CycleCalendar({ onDayClick, lastPeriodStartDate }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const { getPeriodLog } = useCycleContext();
  const [ovulationDay, setOvulationDay] = useState<Date | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (lastPeriodStartDate) {
      const ovDay = getEstimatedOvulationDay(lastPeriodStartDate);
      setOvulationDay(ovDay);
      if (ovDay) {
        setFertileWindow(getEstimatedFertileWindow(ovDay));
      } else {
        setFertileWindow(null);
      }
    } else {
      setOvulationDay(null);
      setFertileWindow(null);
    }
  }, [lastPeriodStartDate]);


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
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday first
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
          cycleDay: null, 
          moonPhase: getMoonPhase(dayClone),
          moonEmoji: getMoonEmoji(getMoonPhase(dayClone)),
          periodLog: periodLog,
          isBleedingDay: periodLog?.intensity !== 'none',
          isOvulationDay: ovulationDay ? isSameDay(dayClone, ovulationDay) : false,
          isFertileDay: fertileWindow ? isWithinInterval(dayClone, fertileWindow) : false,
        };
        
        let cellClasses = `min-h-[5rem] md:min-h-[5.5rem] p-1.5 flex flex-col items-start justify-between 
                           cursor-pointer transition-all duration-150 ease-in-out relative
                           border-r border-b border-border/30 
                           ${getDay(dayClone) === 0 ? 'border-r-0' : ''} 
                           hover:shadow-[0_0_10px_3px_hsl(var(--secondary)/0.4)] hover:z-10`;
        
        if (!dayInfo.isCurrentMonth) {
          cellClasses = cn(cellClasses, 'bg-background/30 text-muted-foreground/40 hover:bg-background/50');
        } else if (dayInfo.isOvulationDay) {
          cellClasses = cn(cellClasses, 'bg-secondary/20 animate-pulse-peach');
        } else if (dayInfo.isFertileDay) {
          cellClasses = cn(cellClasses, 'bg-gradient-to-br from-[hsl(var(--color-fertile-start))] to-[hsl(var(--color-fertile-end))] opacity-50 hover:opacity-75');
        } else if (dayInfo.isBleedingDay) {
          cellClasses = cn(cellClasses, 'bg-primary/20');
        } else if (dayInfo.isToday) {
          cellClasses = cn(cellClasses, 'bg-accent/10 border-accent/50');
        }
        else {
          cellClasses = cn(cellClasses, 'bg-card/80 hover:bg-card');
        }

        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => onDayClick(dayInfo.date)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}`}
          >
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm font-medium ${dayInfo.isToday ? 'text-secondary font-bold' : dayInfo.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-lg opacity-30`} style={{color: 'hsl(var(--color-moon))'}}>
                {dayInfo.moonEmoji}
              </span>
            </div>
            <div className="self-center mt-auto flex items-center space-x-1">
              {dayInfo.isBleedingDay && <span className="text-lg" style={{color: 'hsl(var(--color-bleeding))'}}>🩸</span>}
              {dayInfo.isOvulationDay && <span className="text-lg">🥚</span>}
              {dayInfo.isFertileDay && !dayInfo.isOvulationDay && <span className="text-lg">✨</span>}
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
