
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Import next/image
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
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Droplet, Sparkles, BookOpen } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils'; // getAffirmationForMoonPhase removed from imports
import { getDailyTarotCard } from '@/lib/tarot-utils';
import type { DailyCalendarInfo, PeriodLogEntry, TarotCard } from '@/lib/types'; // Added TarotCard
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';
import { cn } from '@/lib/utils';
import { calculateCycleDay, getEstimatedNextPeriod } from '@/lib/cycle-utils'; // Removed ovulation/fertility utils
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
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
             <div className="flex items-center justify-between text-primary">
                <span className="font-semibold">Period Logged:</span>
                <span className="capitalize">{dayInfo.periodLog.intensity}</span>
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
          
          {/* Affirmation from moon-utils is no longer used here, page.tsx handles wisdom affirmations */}

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
  
  // Effect to recalculate day infos when dependencies change
  const [monthDayInfos, setMonthDayInfos] = useState<DailyCalendarInfo[]>([]);

  useEffect(() => {
    const monthStart = startOfMonth(currentDisplayMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const infos: DailyCalendarInfo[] = [];
    let dayPointer = startDate;
    while(dayPointer <= endDate) {
      const formattedDateKey = format(dayPointer, 'yyyy-MM-dd');
      const periodLog = getPeriodLog(formattedDateKey);
      const dailyTarot = getDailyTarotCard(dayPointer); // Fetches or generates card for THIS day
      
      // Determine if this specific day is a bleeding day based on log or main period range
      let isBleedingThisDay = periodLog?.intensity !== 'none' && periodLog?.intensity !== undefined;
      if (!isBleedingThisDay && lastPeriodDate && lastPeriodEndDate) {
        const currentDayParsed = startOfDay(dayPointer);
        const periodStartParsed = startOfDay(parseISO(lastPeriodDate));
        const periodEndParsed = startOfDay(parseISO(lastPeriodEndDate));
        if (currentDayParsed >= periodStartParsed && currentDayParsed <= periodEndParsed) {
          isBleedingThisDay = true; 
        }
      }


      infos.push({
        date: new Date(dayPointer),
        dayOfMonth: parseInt(format(dayPointer, 'd')),
        isCurrentMonth: isSameMonth(dayPointer, monthStart),
        isToday: isSameDay(dayPointer, new Date()),
        cycleDay: lastPeriodDate ? calculateCycleDay(lastPeriodDate, dayPointer) : null,
        moonPhase: getMoonPhase(dayPointer),
        moonEmoji: getMoonEmoji(getMoonPhase(dayPointer)),
        periodLog: periodLog,
        isBleedingDay: isBleedingThisDay, // Use the refined logic
        tarotCard: dailyTarot,
        // Affirmation from moon-utils is not used here anymore
      });
      dayPointer = addDays(dayPointer, 1);
    }
    setMonthDayInfos(infos);

  }, [currentDisplayMonth, getPeriodLog, lastPeriodDate, lastPeriodEndDate]);


  const handleDayCellClick = (dayInfo: DailyCalendarInfo) => {
    setSelectedDayInfo(dayInfo);
    setIsDetailDialogOpen(true);
  };
  
  const handleOpenLogDialogFromDetail = (date: Date) => {
    setIsDetailDialogOpen(false); // Close detail dialog
    onDayClick(date); // Trigger log dialog on main page
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
        let cellClasses = `min-h-[4.5rem] md:min-h-[5rem] p-1.5 flex flex-col items-start justify-between 
                           cursor-pointer transition-all duration-150 ease-in-out relative
                           border-r border-b border-border/20 rounded-sm
                           hover:shadow-[0_0_8px_1px_hsl(var(--secondary)/0.2)]`;
        
        if ((index + 1) % 7 === 0 ) { // Last day of a week
           cellClasses = cn(cellClasses, 'border-r-0');
        }
        
        let textColor = 'text-[hsl(var(--calendar-normal-text))]';
        let bgColor = 'bg-card'; // Default card background, which is dark
        
        const showBleedingStyle = hasSufficientDataForDisplay && dayInfo.isBleedingDay;

        if (dayInfo.isToday) {
          bgColor = 'bg-[hsla(var(--calendar-today-bg-raw),0.5)]';
          textColor = 'text-[hsl(var(--calendar-today-text))] font-semibold';
        } else if (showBleedingStyle) {
          bgColor = 'bg-[hsla(var(--calendar-bleeding-bg-raw),0.1)]'; 
          textColor = 'text-[hsl(var(--calendar-bleeding-text))]'; 
        } else if (!dayInfo.isCurrentMonth) {
          textColor = 'text-muted-foreground/40'; 
          bgColor = 'bg-background/30'; // Slightly different for out-of-month
        }
        
        cellClasses = cn(cellClasses, bgColor, textColor);

        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => handleDayCellClick(dayInfo)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}${showBleedingStyle ? ', Bleeding Logged' : ''}`}
          >
            {showBleedingStyle && (
              <span className="absolute top-1.5 right-1.5 text-xs text-[hsl(var(--calendar-bleeding-indicator))]">●</span>
            )}
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm ${dayInfo.isToday ? 'font-bold' : 'font-medium'}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-xs opacity-60`} style={{color: 'hsl(var(--color-moon))'}}>
                {dayInfo.moonEmoji}
              </span>
            </div>
            {/* Cycle day or other brief info can go here at the bottom of the cell if needed */}
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
