
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
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import type { DailyCalendarInfo, PeriodLogEntry, PeriodIntensity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';

interface CycleCalendarProps {
  onDayClick: (date: Date) => void;
}

const BleedingIcon: React.FC<{ intensity: PeriodIntensity | undefined }> = ({ intensity }) => {
  if (!intensity || intensity === 'none') return null;
  switch (intensity) {
    case 'spotting':
    case 'light':
      return <span className="text-primary text-xs ml-0.5" title="Light Flow">🩸</span>;
    case 'medium':
      return <span className="text-red-500 text-xs ml-0.5" title="Medium Flow">🔴</span>;
    case 'heavy':
      return <span className="text-red-700 text-xs ml-0.5" title="Heavy Flow">🟥</span>;
    default:
      return null;
  }
};

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
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-primary">
          {format(currentDisplayMonth, 'MMMM yyyy')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDisplayMonth(addMonths(currentDisplayMonth, 1))}
          aria-label="Next month"
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
    return <div className="grid grid-cols-7 gap-px border-b bg-border">{daysHeader}</div>;
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
          cycleDay: null, 
          moonPhase: getMoonPhase(dayClone),
          moonEmoji: getMoonEmoji(getMoonPhase(dayClone)),
          periodLog: periodLog,
        };
        
        let cellClasses = `min-h-[4.5rem] md:min-h-[5rem] p-1.5 flex flex-col items-start justify-between 
                           cursor-pointer transition-all duration-150 ease-in-out
                           border-r border-b 
                           ${getDay(dayClone) === 0 ? 'border-r-0' : ''} 
                           hover:shadow-[0_0_10px_2px_hsl(var(--primary)/0.2)] hover:z-10 relative`;
        
        if (!dayInfo.isCurrentMonth) {
          cellClasses += ' bg-muted/20 text-muted-foreground/50 hover:bg-muted/30';
        } else if (dayInfo.isToday) {
          cellClasses += ' bg-primary/10 border-primary/50';
        } else if (periodLog && periodLog.intensity !== 'none') {
          cellClasses += ' bg-primary/5';
        }
        else {
          cellClasses += ' bg-card hover:bg-accent/10';
        }

        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => onDayClick(dayInfo.date)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}`}
          >
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm font-medium ${dayInfo.isToday ? 'text-primary font-bold' : dayInfo.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-lg ${!dayInfo.isCurrentMonth ? 'opacity-60' : ''} self-center`}>
                {dayInfo.moonEmoji}
              </span>
            </div>
            <div className="self-center mt-auto">
              {dayInfo.periodLog && dayInfo.periodLog.intensity !== 'none' && (
                <BleedingIcon intensity={dayInfo.periodLog.intensity} />
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
    return <div className="border-l border-t rounded-lg overflow-hidden shadow-sm">{rows}</div>;
  };

  return (
    <div className="w-full bg-card rounded-lg overflow-hidden">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}
