
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
  startOfDay as dateFnsStartOfDay 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, Sparkles, Egg, Droplet } from 'lucide-react'; // Added Droplet, Egg, Sparkles
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { getDailyTarotCard } from '@/lib/tarot-utils';
import type { DailyCalendarInfo, PeriodLogEntry } from '@/lib/types';
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

  const intensityDisplay = (intensity: PeriodLogEntry['intensity'] | undefined) => {
    if (!intensity || intensity === 'none') return 'Not Logged';
    return intensity.charAt(0).toUpperCase() + intensity.slice(1);
  };

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
          
          <Separator className="my-3 bg-border/50" />
          <h3 className="font-semibold text-accent text-md">Bleeding Log:</h3>
          {dayInfo.periodLog && dayInfo.periodLog.intensity !== 'none' ? (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">Intensity:</span>
                <span className="text-muted-foreground capitalize">{intensityDisplay(dayInfo.periodLog.intensity)}</span>
              </div>
              {dayInfo.periodLog.symptoms && dayInfo.periodLog.symptoms.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="font-medium">Symptoms:</span>
                  <span className="text-muted-foreground text-right">{dayInfo.periodLog.symptoms.join(', ')}</span>
                </div>
              )}
              {dayInfo.periodLog.notes && (
                 <div className="flex items-start justify-between">
                  <span className="font-medium">Notes:</span>
                  <p className="text-muted-foreground italic text-right">"{dayInfo.periodLog.notes}"</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No bleeding details logged for this day.</p>
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
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); 
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); 
    
    const infos: DailyCalendarInfo[] = [];
    let dayPointer = startDate;

    const ovulationDayDate = lastPeriodDate ? getEstimatedOvulationDay(lastPeriodDate) : null;
    const fertileWindow = ovulationDayDate ? getEstimatedFertileWindow(ovulationDayDate) : null;

    while(dayPointer <= endDate) {
      const formattedDateKey = format(dayPointer, 'yyyy-MM-dd');
      const periodLog = getPeriodLog(formattedDateKey);
      const dailyTarot = getDailyTarotCard(dayPointer); 
      
      const currentDayStart = dateFnsStartOfDay(dayPointer);
      let isBleedingThisDay = periodLog?.intensity !== 'none' && periodLog?.intensity !== undefined;
      
      if (!isBleedingThisDay && hasSufficientDataForDisplay && lastPeriodDate && lastPeriodEndDate) {
        const periodStartParsed = dateFnsStartOfDay(parseISO(lastPeriodDate));
        const periodEndParsed = dateFnsStartOfDay(parseISO(lastPeriodEndDate));
        if (currentDayStart >= periodStartParsed && currentDayStart <= periodEndParsed) {
          isBleedingThisDay = true; 
        }
      }

      const isOvulationThisDay = ovulationDayDate ? isSameDay(currentDayStart, ovulationDayDate) : false;
      const isFertileThisDay = fertileWindow 
        ? (currentDayStart >= fertileWindow.start && currentDayStart <= fertileWindow.end && !isOvulationThisDay) // ensure ovulation day isn't also marked as just fertile
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
        isFertileDay: isFertileThisDay, 
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
                           cursor-pointer transition-all duration-150 ease-in-out relative rounded-sm
                           border-r border-b border-border/20 
                           hover:shadow-[0_0_8px_1px_hsl(var(--secondary)/0.3)]`;
        
        if ((index + 1) % 7 === 0 ) { 
           cellClasses = cn(cellClasses, 'border-r-0');
        }
        
        let textColor = 'text-[hsl(var(--foreground))]';
        let bgColor = 'bg-card'; 
        let cycleIndicatorIcon = null;
        let animationClass = '';

        const showBleedingStyle = hasSufficientDataForDisplay && dayInfo.isBleedingDay;

        if (!dayInfo.isCurrentMonth) {
          textColor = 'text-muted-foreground/40'; 
          bgColor = 'bg-muted/30'; 
        } else {
            // Default for current month, non-today days:
            bgColor = 'bg-[hsl(var(--calendar-default-cell-bg))]';
            textColor = 'text-[hsl(var(--text-charcoal))]';

            if (showBleedingStyle) {
                bgColor = 'bg-[hsla(var(--calendar-bleeding-bg-raw),0.2)]';
                textColor = 'text-[hsl(var(--calendar-bleeding-text))]';
                cycleIndicatorIcon = <Droplet className="h-3 w-3 text-[hsl(var(--color-moon))]" />;
            } else if (dayInfo.isOvulationDay && hasSufficientDataForDisplay) {
                bgColor = 'bg-[hsl(var(--color-ovulation))]/20';
                textColor = 'text-[hsl(var(--color-ovulation-foreground))]';
                cycleIndicatorIcon = <Egg className="h-3 w-3 text-[hsl(var(--color-moon))]" />;
                animationClass = 'animate-pulse-ovulation';
            } else if (dayInfo.isFertileDay && hasSufficientDataForDisplay) {
                bgColor = 'bg-gradient-to-br from-[hsl(var(--color-fertile-start))] to-[hsl(var(--color-fertile-end))]';
                textColor = 'text-white'; // Ensure contrast on gradient
                cycleIndicatorIcon = <Sparkles className="h-3 w-3 text-white" />;
            }
        }
        
        if (dayInfo.isToday) {
            // Today's styling overrides background and text for emphasis
            bgColor = cn(bgColor, 'bg-[hsla(var(--calendar-today-bg-raw),0.5)]');
            textColor = 'text-[hsl(var(--calendar-today-text))] font-semibold';
        }
        
        cellClasses = cn(cellClasses, bgColor, textColor, animationClass);

        weekDays.push(
          <div
            key={dayInfo.date.toISOString()}
            onClick={() => handleDayCellClick(dayInfo)}
            className={cellClasses}
            aria-label={`Date ${format(dayInfo.date, 'PPP')}, Moon: ${dayInfo.moonPhase}${showBleedingStyle ? ', Bleeding Logged' : ''}`}
          >
            <div className="flex justify-between w-full items-start">
              <span className={`text-sm ${dayInfo.isToday ? 'font-bold' : 'font-medium'}`}>
                {dayInfo.dayOfMonth}
              </span>
              <span className={`text-xs text-[hsl(var(--color-moon))] opacity-30`}>
                {dayInfo.moonEmoji}
              </span>
            </div>
            <div className="flex flex-col items-end w-full mt-auto">
                {cycleIndicatorIcon && (
                    <div className="self-start mb-0.5"> 
                        {cycleIndicatorIcon}
                    </div>
                )}
                {dayInfo.isCurrentMonth && dayInfo.cycleDay && (
                    <span className="text-[10px] text-muted-foreground/50">
                        D{dayInfo.cycleDay}
                    </span>
                )}
            </div>
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
