
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
  parseISO,
  startOfDay as dateFnsStartOfDay // Renamed to avoid conflict
} from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { getDailyTarotCard } from '@/lib/tarot-utils';
import type { DailyCalendarInfo, PeriodLogEntry, TarotCard } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';
import { cn } from '@/lib/utils';
import { 
  calculateCycleDay, 
  getEstimatedOvulationDay, 
  getEstimatedFertileWindow 
} from '@/lib/cycle-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface DayDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dayInfo: DailyCalendarInfo | null;
  onOpenLogDialog: (date: Date) => void;
}

function DayDetailDialog({ isOpen, onClose, dayInfo, onOpenLogDialog }: DayDetailDialogProps) {
  if (!isOpen || !dayInfo) return null;

  const formattedDate = format(dayInfo.date, 'EEEE, dd MMMM yyyy');
  const cycleDayDisplay = dayInfo.cycleDay ? `Cycle Day ${dayInfo.cycleDay}` : 'Cycle Day N/A';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-md text-foreground">
        <DialogHeader className="text-center">
          <DialogTitle className="text-primary">{formattedDate}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Moon Phase:</span>
            <span className="text-muted-foreground">{dayInfo.moonEmoji} {dayInfo.moonPhase}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Cycle:</span>
            <span className="text-muted-foreground">{cycleDayDisplay}</span>
          </div>
          
          {dayInfo.periodLog && dayInfo.periodLog.intensity !== 'none' && (
             <div className="flex items-center justify-between text-[hsl(var(--primary))]">
                <span className="font-semibold">Period Logged:</span>
                <span className="capitalize">{dayInfo.periodLog.intensity}</span>
            </div>
          )}
           {dayInfo.isOvulationDay && (
            <div className="flex items-center justify-between text-[hsl(var(--color-ovulation))]">
                <span className="font-semibold">Ovulation Day</span>
                <span>🥚</span>
            </div>
          )}
          {dayInfo.isFertileDay && !dayInfo.isOvulationDay && (
            <div className="flex items-center justify-between text-[hsl(var(--color-fertile-start))]">
                <span className="font-semibold">Fertile Day</span>
                <span>✨</span>
            </div>
          )}


          <Separator className="my-3 bg-border/50" />

          {dayInfo.tarotCard && (
            <div className="space-y-2 text-center">
              <h3 className="font-semibold text-accent text-md">Card for the Day:</h3>
              <p className="font-bold text-lg">{dayInfo.tarotCard.title}</p>
              <Image
                src={dayInfo.tarotCard.image}
                alt={dayInfo.tarotCard.title}
                width={100}
                height={170}
                className="rounded-md shadow-lg mx-auto my-2 border-2 border-primary/30 object-contain"
                data-ai-hint="tarot card"
                unoptimized={dayInfo.tarotCard.image.startsWith('https://placehold.co')}
              />
              {dayInfo.tarotCard.meaning && (
                <p className="text-xs text-muted-foreground italic px-2">"{dayInfo.tarotCard.meaning}"</p>
              )}
            </div>
          )}
        </div>
        <DialogClose asChild>
          <div className="flex justify-end space-x-2 pt-3">
            <Button
              variant="outline"
              onClick={() => onOpenLogDialog(dayInfo.date)}
              className="rounded-sm border-primary/50 text-primary/90 hover:bg-primary/10 hover:text-primary"
            >
              <Edit3 className="h-4 w-4 mr-2" /> Log Details
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-sm">Close</Button>
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}


interface CycleCalendarProps {
  onDayClick: (date: Date) => void;
  hasSufficientDataForDisplay?: boolean;
}

export function CycleCalendar({ onDayClick, hasSufficientDataForDisplay }: CycleCalendarProps) {
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const { getPeriodLog, lastPeriodDate, lastPeriodEndDate } = useCycleContext();

  const [selectedDayInfo, setSelectedDayInfo] = useState<DailyCalendarInfo | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  const [monthDayInfos, setMonthDayInfos] = useState<DailyCalendarInfo[]>([]);

  useEffect(() => {
    const monthStart = startOfMonth(currentDisplayMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday first
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Monday first
    
    const infos: DailyCalendarInfo[] = [];
    let dayPointer = startDate;

    const ovulationDay = lastPeriodDate ? getEstimatedOvulationDay(lastPeriodDate) : null;
    const fertileWindow = ovulationDay ? getEstimatedFertileWindow(ovulationDay) : null;

    while(dayPointer <= endDate) {
      const formattedDateKey = format(dayPointer, 'yyyy-MM-dd');
      const periodLog = getPeriodLog(formattedDateKey);
      const dailyTarot = getDailyTarotCard(dayPointer);
      
      const currentDayStart = dateFnsStartOfDay(dayPointer);
      let isBleedingThisDay = periodLog?.intensity !== 'none' && periodLog?.intensity !== undefined;
      if (!isBleedingThisDay && lastPeriodDate && lastPeriodEndDate && hasSufficientDataForDisplay) {
        const periodStartParsed = dateFnsStartOfDay(parseISO(lastPeriodDate));
        const periodEndParsed = dateFnsStartOfDay(parseISO(lastPeriodEndDate));
        if (currentDayStart >= periodStartParsed && currentDayStart <= periodEndParsed) {
          isBleedingThisDay = true; 
        }
      }

      const isOvulationThisDay = ovulationDay ? isSameDay(currentDayStart, ovulationDay) : false;
      const isFertileThisDay = fertileWindow 
        ? (currentDayStart >= fertileWindow.start && currentDayStart <= fertileWindow.end) 
        : false;

      infos.push({
        date: new Date(dayPointer),
        dayOfMonth: parseInt(format(dayPointer, 'd')),
        isCurrentMonth: isSameMonth(dayPointer, monthStart),
        isToday: isSameDay(dayPointer, new Date()),
        cycleDay: lastPeriodDate ? calculateCycleDay(lastPeriodDate, dayPointer) : null,
        moonPhase: getMoonPhase(dayPointer),
        moonEmoji: getMoonEmoji(getMoonPhase(dayPointer)),
        periodLog: periodLog,
        isBleedingDay: isBleedingThisDay,
        isOvulationDay: isOvulationThisDay,
        isFertileDay: isFertileThisDay && !isOvulationThisDay, // Ovulation takes precedence
        tarotCard: dailyTarot,
      });
      dayPointer = addDays(dayPointer, 1);
    }
    setMonthDayInfos(infos);

  }, [currentDisplayMonth, getPeriodLog, lastPeriodDate, lastPeriodEndDate, hasSufficientDataForDisplay]);


  const handleDayCellClick = (dayInfo: DailyCalendarInfo) => {
    setSelectedDayInfo(dayInfo);
    setIsDetailDialogOpen(true);
  };
  
  const handleOpenLogDialogFromDetail = (date: Date) => {
    setIsDetailDialogOpen(false);
    onDayClick(date); 
  };


  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-2 px-1">
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
    const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); 
    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-xs py-1.5">
          {format(addDays(firstDayOfWeek, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border/30 bg-background/10">{daysHeader}</div>;
  };

  const renderCells = () => {
    const rows: JSX.Element[] = [];
    let weekDays: JSX.Element[] = [];

    monthDayInfos.forEach((dayInfo, index) => {
        let cellClasses = `min-h-[4.8rem] md:min-h-[5.2rem] p-1.5 flex flex-col items-start justify-between 
                           cursor-pointer transition-all duration-150 ease-in-out relative
                           border-r border-b border-border/20 rounded-sm
                           hover:shadow-[0_0_8px_1px_hsl(var(--color-ovulation)/0.3)]`; // Peach hover glow
        
        if ((index + 1) % 7 === 0 ) { 
           cellClasses = cn(cellClasses, 'border-r-0');
        }
        
        let textColor = 'text-[hsl(var(--calendar-normal-text))]';
        let bgColor = 'bg-card'; 
        let iconContent = null;

        const showBleedingStyle = hasSufficientDataForDisplay && dayInfo.isBleedingDay;

        if (dayInfo.isToday) {
          bgColor = 'bg-[hsla(var(--calendar-today-bg-raw),0.5)]';
          textColor = 'text-[hsl(var(--calendar-today-text))] font-semibold';
        }
        
        if (dayInfo.isCurrentMonth) {
          if (showBleedingStyle) {
            bgColor = 'bg-primary/10'; // Soft crimson background
            iconContent = <span className="absolute top-1.5 right-1.5 text-xs text-[hsl(var(--primary))]">🩸</span>;
            textColor = 'text-[hsl(var(--calendar-bleeding-text))]';
          } else if (dayInfo.isOvulationDay && hasSufficientDataForDisplay) {
            bgColor = 'bg-[hsl(var(--color-ovulation))]/20'; // Luminous peach background
            iconContent = <span className="absolute top-1.5 right-1.5 text-xs text-[hsl(var(--color-ovulation))]">🥚</span>;
            cellClasses = cn(cellClasses, 'animate-pulse-ovulation');
          } else if (dayInfo.isFertileDay && hasSufficientDataForDisplay) {
            bgColor = 'bg-gradient-to-br from-[hsl(var(--color-fertile-start))] to-[hsl(var(--color-fertile-end))] opacity-70';
            iconContent = <span className="absolute top-1.5 right-1.5 text-xs text-white">✨</span>;
          }
        }
        
        if (!dayInfo.isCurrentMonth) {
          textColor = 'text-muted-foreground/40'; 
          bgColor = 'bg-background/30'; 
        }
        
        cellClasses = cn(cellClasses, bgColor, textColor);

        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => handleDayCellClick(dayInfo)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}${showBleedingStyle ? ', Bleeding Logged' : ''}`}
          >
            {iconContent}
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm ${dayInfo.isToday ? 'font-bold' : 'font-medium'}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-xs text-[hsl(var(--color-moon))] opacity-30`}>
                {dayInfo.moonEmoji}
              </span>
            </div>
            {dayInfo.isCurrentMonth && dayInfo.cycleDay && (
                <span className="text-[10px] self-end text-muted-foreground/50 mt-auto">
                    D{dayInfo.cycleDay}
                </span>
            )}
          </div>
        );

      if ((index + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7 gap-px bg-background/10" key={`week-${format(dayInfo.date, 'yyyy-MM-dd')}`}>
            {weekDays}
          </div>
        );
        weekDays = [];
      }
    });
    return <div className="border-l border-t border-border/30 rounded-md overflow-hidden shadow-sm bg-background/10 ">{rows}</div>;
  };

  return (
    <div className="w-full bg-card/50 rounded-lg overflow-hidden border border-border/30 shadow-md">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      <DayDetailDialog 
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        dayInfo={selectedDayInfo}
        onOpenLogDialog={handleOpenLogDialogFromDetail}
      />
    </div>
  );
}
