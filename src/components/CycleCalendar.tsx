
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateCycleDay } from '@/lib/cycle-utils';
import { getMoonPhase, getMoonEmoji, getAffirmationForMoonPhase } from '@/lib/moon-utils';
import { getDailyTarotCard } from '@/lib/tarot-utils';
import type { DailyCalendarInfo, TarotCard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface CycleCalendarProps {
  lastPeriodStartDate: string | null;
  lastPeriodEndDate: string | null;
}

export function CycleCalendar({ lastPeriodStartDate, lastPeriodEndDate }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [periodInterval, setPeriodInterval] = useState<{start: Date, end: Date} | null>(null);
  const [selectedDay, setSelectedDay] = useState<DailyCalendarInfo | null>(null);
  const [selectedDayTarot, setSelectedDayTarot] = useState<TarotCard | null>(null);

  useEffect(() => {
    if (lastPeriodStartDate && lastPeriodEndDate) {
      const start = parseISO(lastPeriodStartDate);
      const end = parseISO(lastPeriodEndDate);
      if (isValid(start) && isValid(end) && end >= start) {
        setPeriodInterval({ start: startOfDay(start), end: startOfDay(end) });
      } else {
        setPeriodInterval(null);
      }
    } else if (lastPeriodStartDate) { 
        const start = parseISO(lastPeriodStartDate);
        if (isValid(start)) {
            setPeriodInterval({start: startOfDay(start), end: startOfDay(start)});
        } else {
            setPeriodInterval(null);
        }
    } else {
      setPeriodInterval(null);
    }
  }, [lastPeriodStartDate, lastPeriodEndDate]);

  useEffect(() => {
    if (selectedDay) {
      const tarot = getDailyTarotCard(selectedDay.date);
      setSelectedDayTarot(tarot);
    } else {
      setSelectedDayTarot(null);
    }
  }, [selectedDay]);

  const handleDayClick = (dayInfo: DailyCalendarInfo) => {
    setSelectedDay(dayInfo);
  };

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
    const firstDayOfWeek = startOfWeek(new Date()); 
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
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows: JSX.Element[] = [];
    let daysData: DailyCalendarInfo[] = [];
    let dayPointer = startDate;

    while (dayPointer <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cycleDay = calculateCycleDay(lastPeriodStartDate, dayPointer);
        const moonPhaseName = getMoonPhase(dayPointer);
        const isPeriod = periodInterval ? isWithinInterval(startOfDay(dayPointer), periodInterval) : false;
        
        daysData.push({
          date: new Date(dayPointer),
          dayOfMonth: parseInt(format(dayPointer, 'd')),
          isCurrentMonth: isSameMonth(dayPointer, monthStart),
          isToday: isSameDay(dayPointer, new Date()),
          cycleDay: cycleDay,
          moonPhase: moonPhaseName,
          moonEmoji: getMoonEmoji(moonPhaseName),
          affirmation: getAffirmationForMoonPhase(moonPhaseName), // Keep for detail view
          isPeriodDay: isPeriod,
        });
        dayPointer = addDays(dayPointer, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border" key={`week-${format(dayPointer, 'yyyy-MM-dd')}`}>
          {daysData.map((dayInfo) => (
            <div
              key={dayInfo.date.toISOString()}
              onClick={() => handleDayClick(dayInfo)}
              className={`min-h-[6rem] md:min-h-[7rem] p-2 flex flex-col items-start justify-between
                          ${dayInfo.isCurrentMonth ? 'bg-card hover:bg-card/80' : 'bg-background/50 hover:bg-card/60 text-muted-foreground/70'}
                          ${dayInfo.isPeriodDay ? 'bg-primary/10' : ''}
                          cursor-pointer transition-colors duration-150 ease-in-out
                          border-r border-b border-border 
                          ${dayInfo.date.getDay() === 0 ? 'border-r-0' : ''} 
                         `}
              aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}${dayInfo.cycleDay ? `, Cycle Day ${dayInfo.cycleDay}` : ''}`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-xs font-medium ${dayInfo.isToday ? 'bg-primary text-primary-foreground rounded-full px-1.5 py-0.5' : dayInfo.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                  {dayInfo.dayOfMonth}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center w-full flex-grow space-y-1">
                <span className={`text-2xl ${!dayInfo.isCurrentMonth ? 'opacity-50' : ''}`}>
                  {dayInfo.moonEmoji}
                </span>
                {dayInfo.cycleDay && (
                  <p className={`text-xs ${dayInfo.isPeriodDay ? 'text-primary font-semibold' : 'text-primary/80'}`}>
                    D{dayInfo.cycleDay}
                    {dayInfo.isPeriodDay && <span className="ml-0.5">🩸</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
      daysData = [];
    }
    return <div className="border-l border-border">{rows}</div>;
  };

  return (
    <div className="w-full bg-card shadow-lg rounded-lg overflow-hidden my-8">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}

      {selectedDay && selectedDayTarot && (
        <Dialog open={!!selectedDay} onOpenChange={(isOpen) => !isOpen && setSelectedDay(null)}>
          <DialogContent className="sm:max-w-md bg-card text-card-foreground p-6">
            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-2xl font-semibold text-primary">
                {format(selectedDay.date, 'MMMM do, yyyy')}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground flex flex-col items-center space-y-1 mt-1">
                <span>{selectedDay.moonEmoji} {selectedDay.moonPhase}</span>
                {selectedDay.cycleDay && (
                  <span>
                    Cycle Day {selectedDay.cycleDay}
                    {selectedDay.isPeriodDay && <span className="ml-1 text-primary"> (Period)</span>}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <Separator className="my-4 bg-border" />

            <div className="text-center space-y-3">
              <p className="text-sm font-medium text-primary">Your Card Today</p>
              <h3 className="text-xl font-semibold text-foreground">{selectedDayTarot.title}</h3>
              <div className="flex justify-center my-3">
                <Image
                  src={selectedDayTarot.image}
                  alt={selectedDayTarot.title}
                  width={128}
                  height={200}
                  className="rounded-lg shadow-md border-2 border-primary/30 object-contain"
                  data-ai-hint="tarot card"
                  unoptimized={selectedDayTarot.image.startsWith('https://placehold.co')}
                />
              </div>
              {selectedDayTarot.meaning && (
                <p className="text-xs text-muted-foreground italic px-4">
                  "{selectedDayTarot.meaning}"
                </p>
              )}
            </div>

            <Separator className="my-4 bg-border" />
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-primary">Moon Affirmation</p>
              <p className="text-md italic text-foreground">
                "{selectedDay.affirmation}"
              </p>
            </div>

            <DialogClose asChild>
              <Button variant="outline" className="mt-6 w-full">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
