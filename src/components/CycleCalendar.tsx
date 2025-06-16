
'use client';

import React, { useState, useEffect } from 'react';
// Removed Image import as it's no longer used in this file
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
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
// getDailyTarotCard import is removed as tarot is no longer displayed in this dialog
import type { DailyCalendarInfo, PeriodLogEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCycleContext } from '@/contexts/CycleContext';
import { cn } from '@/lib/utils';
import { 
  calculateCycleDay, 
  // Ovulation/Fertility utils are not used for display in this minimalist version
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
          
          {/* Display bleeding information if logged */}
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

          {/* Removed Tarot Card Section */}
          {/* Fertile/Ovulation day indicators were removed in a previous step based on minimalist design prompt */}

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

    // Predictions removed as per prior prompt for minimalist design
    // const ovulationDay = lastPeriodDate ? getEstimatedOvulationDay(lastPeriodDate) : null;
    // const fertileWindow = ovulationDay ? getEstimatedFertileWindow(ovulationDay) : null;

    while(dayPointer <= endDate) {
      const formattedDateKey = format(dayPointer, 'yyyy-MM-dd');
      const periodLog = getPeriodLog(formattedDateKey);
      // Tarot card for the dialog is removed from this component's direct concern for day cell prep
      // const dailyTarot = getDailyTarotCard(dayPointer); 
      
      const currentDayStart = dateFnsStartOfDay(dayPointer);
      let isBleedingThisDay = periodLog?.intensity !== 'none' && periodLog?.intensity !== undefined;
      
      // This logic is kept to show a general period range indication on calendar if main dates are set
      // but specific daily log might not exist for every day in that range
      if (!isBleedingThisDay && hasSufficientDataForDisplay && lastPeriodDate && lastPeriodEndDate) {
        const periodStartParsed = dateFnsStartOfDay(parseISO(lastPeriodDate));
        const periodEndParsed = dateFnsStartOfDay(parseISO(lastPeriodEndDate));
        if (currentDayStart >= periodStartParsed && currentDayStart <= periodEndParsed) {
          isBleedingThisDay = true; 
        }
      }

      // isOvulationThisDay and isFertileThisDay were removed as per previous minimalist prompt
      // const isOvulationThisDay = ovulationDay ? isSameDay(currentDayStart, ovulationDay) : false;
      // const isFertileThisDay = fertileWindow 
      //   ? (currentDayStart >= fertileWindow.start && currentDayStart <= fertileWindow.end) 
      //   : false;

      infos.push({
        date: new Date(dayPointer),
        dayOfMonth: parseInt(format(dayPointer, 'd')),
        isCurrentMonth: isSameMonth(dayPointer, monthStart),
        isToday: isSameDay(dayPointer, new Date()),
        cycleDay: lastPeriodDate ? calculateCycleDay(lastPeriodDate, dayPointer) : null,
        moonPhase: getMoonPhase(dayPointer),
        moonEmoji: getMoonEmoji(getMoonPhase(dayPointer)),
        periodLog: periodLog, // Pass the full log for the dialog
        isBleedingDay: isBleedingThisDay, // Used for calendar cell styling
        // isOvulationDay: isOvulationThisDay, // Removed
        // isFertileDay: isFertileThisDay && !isOvulationThisDay, // Removed
        // tarotCard: dailyTarot, // Removed from cell prep as it's not shown in cell overview
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
        
        let textColor = 'text-[hsl(var(--calendar-normal-text))]';
        let bgColor = 'bg-card'; 
        let bleedingIndicatorIcon = null;

        // Show bleeding style only if sufficient data context flag is true AND it's a bleeding day
        const showBleedingStyle = hasSufficientDataForDisplay && dayInfo.isBleedingDay;

        if (dayInfo.isToday) {
          bgColor = 'bg-[hsla(var(--calendar-today-bg-raw),0.5)]'; // Use 50% opacity from variable
          textColor = 'text-[hsl(var(--calendar-today-text))] font-semibold';
        }
        
        if (dayInfo.isCurrentMonth) {
          if (showBleedingStyle) {
            bgColor = 'bg-[hsla(var(--calendar-bleeding-bg-raw),0.1)]'; // Crimson at 10% opacity
            textColor = 'text-[hsl(var(--calendar-bleeding-text))]'; // White text on crimson bg
            bleedingIndicatorIcon = (
              <span className="absolute top-1.5 right-1.5 text-xs text-[hsl(var(--calendar-bleeding-indicator))]">●</span>
            );
          }
          // Predictions (fertile/ovulation) removed based on earlier minimalist prompt.
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
            {bleedingIndicatorIcon}
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

