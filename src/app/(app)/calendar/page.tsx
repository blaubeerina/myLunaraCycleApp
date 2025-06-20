
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import type { DailyEntryData, MoonPhaseName, CalendarCellData, CyclePhaseName, BleedingIntensity } from '@/lib/types';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Droplet, Sun, Leaf, Flower2, AlertTriangle } from 'lucide-react';
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import { cn } from '@/lib/utils';
import { 
  getMostRecentPeriodStart,
  calculateCycleDayNumber,
  determineCyclePhase,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  getPredictedOvulationDate,
  getPredictedFertileWindow,
  getPredictedNextPeriodDates,
  getBleedingBackgroundClass,
  calculateFullCycleInfoForDate,
} from '@/lib/cycle-utils';


async function fetchMoonDataForMonth(date: Date): Promise<Record<string, MoonPhaseName>> {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); 
  const gridEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  
  const data: Record<string, MoonPhaseName> = {};
  let currentDay = gridStart;
  while (currentDay <= gridEnd) {
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    data[dateStr] = getMoonPhase(currentDay);
    currentDay = addDays(currentDay, 1);
  }
  return data;
}

export default function CalendarPage() {
  const { t, userPreferences, appData, saveDailyEntry, loadAppData } = useAppContext();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthMoonData, setMonthMoonData] = useState<Record<string, MoonPhaseName>>({});
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(true);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedDateForEntry, setSelectedDateForEntry] = useState<Date | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (userId) {
        loadAppData(userId);
    }
  }, [userId, loadAppData]);

  const loadMoonDataForCurrentMonth = useCallback(async () => {
    setIsLoadingMoonData(true);
    try {
      const data = await fetchMoonDataForMonth(currentMonth);
      setMonthMoonData(data);
    } catch (error) {
      console.error("Error fetching moon data:", error);
    } finally {
      setIsLoadingMoonData(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadMoonDataForCurrentMonth();
  }, [loadMoonDataForCurrentMonth]);

  const handleDayClick = (day: Date) => {
    setSelectedDateForEntry(day);
    setIsEntryDialogOpen(true);
  };

  const handleCloseEntryDialog = () => {
    setIsEntryDialogOpen(false);
    setSelectedDateForEntry(null);
  };

  const handleSaveEntry = async (entryData: DailyEntryData) => {
    if (userId) {
      await saveDailyEntry(userId, entryData);
    }
    handleCloseEntryDialog();
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center py-3 px-2 md:px-4 bg-card border-b border-border sticky top-0 z-10">
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="text-foreground hover:bg-primary/10"
        aria-label={t('previousMonth', { month: format(subMonths(currentMonth,1), 'MMMM')})}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h2 className="text-lg md:text-xl font-semibold text-primary">
        {format(currentMonth, 'MMMM yyyy', { locale: userPreferences.language === 'de' ? de : undefined })}
      </h2>
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="text-foreground hover:bg-primary/10"
        aria-label={t('nextMonth', { month: format(addMonths(currentMonth,1), 'MMMM')})}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    const weekStartsOn = 1; 
    const firstDayOfWeek = startOfWeek(new Date(), { locale: userPreferences.language === 'de' ? de : undefined, weekStartsOn });

    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-xs sm:text-sm py-2 border-b border-border">
          {format(addDays(firstDayOfWeek, i), 'EE', { locale: userPreferences.language === 'de' ? de : undefined })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 sticky top-[calc(3.5rem+1px)] md:top-[calc(4rem+1px)] z-10 bg-card">{daysHeader}</div>;
  };

  const calendarGridData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const weekStartsOn = 1; // Monday
    const startDate = startOfWeek(monthStart, { locale: userPreferences.language === 'de' ? de : undefined, weekStartsOn });
    const endDate = endOfWeek(monthEnd, { locale: userPreferences.language === 'de' ? de : undefined, weekStartsOn });
    
    const grid: CalendarCellData[] = [];
    let dayPointer = startDate;

    const lastPeriodStartEntry = userPreferences.appMode === 'cycle' ? getMostRecentPeriodStart(appData.dailyEntries) : null;
    const lastPeriodStartDate = lastPeriodStartEntry ? parseISO(lastPeriodStartEntry.date) : null;

    // Predict for the next 3 cycles
    const futurePeriods = lastPeriodStartDate ? getPredictedNextPeriodDates(lastPeriodStartDate, 3) : [];
    const futureOvulations: { date: Date; fertileWindow: { start: Date; end: Date } }[] = [];
    if (lastPeriodStartDate) {
        for (let i = 0; i < 3; i++) { // Predict for current and next 2 cycles
            const cycleStartDate = addDays(lastPeriodStartDate, DEFAULT_CYCLE_LENGTH * i);
            const ovDate = getPredictedOvulationDate(cycleStartDate);
            futureOvulations.push({ date: ovDate, fertileWindow: getPredictedFertileWindow(ovDate) });
        }
    }

    while(dayPointer <= endDate) {
      const dateStr = format(dayPointer, 'yyyy-MM-dd');
      const dailyEntry = appData?.dailyEntries?.[dateStr];
      const cycleInfo = userPreferences.appMode === 'cycle' ? calculateFullCycleInfoForDate(dayPointer, appData.dailyEntries) : null;

      let cellData: CalendarCellData = {
        date: dateStr,
        dayOfMonth: dayPointer.getDate(),
        isCurrentMonth: isSameMonth(dayPointer, monthStart),
        isToday: isSameDay(dayPointer, new Date()),
        mood: dailyEntry?.mood,
        notes: dailyEntry?.notes,
        bleeding: dailyEntry?.bleeding,
        isPeriodStart: dailyEntry?.isPeriodStart,
        isPeriodEnd: dailyEntry?.isPeriodEnd,
        moonPhaseName: monthMoonData[dateStr],
        currentCyclePhase: cycleInfo?.phase || 'Unknown',
        cycleDayNumber: cycleInfo?.cycleDay,
        isFertilePredicted: false,
        isOvulationPredicted: false,
        isNextPeriodPredicted: false,
      };

      if (userPreferences.appMode === 'cycle') {
        // Check against logged data first
        if (dailyEntry?.isPeriodStart || (dailyEntry?.bleeding && dailyEntry.bleeding.intensity !== 'none')) {
            cellData.currentCyclePhase = 'Menstruation';
        } else if (cycleInfo) {
            cellData.currentCyclePhase = cycleInfo.phase;
            // If the day is beyond the last logged period and within predicted windows:
            if (cycleInfo.estimatedFertileWindow && dayPointer >= cycleInfo.estimatedFertileWindow.start && dayPointer <= cycleInfo.estimatedFertileWindow.end) {
                cellData.isFertilePredicted = true;
                if (cycleInfo.estimatedOvulationDate && isSameDay(dayPointer, cycleInfo.estimatedOvulationDate)) {
                    cellData.isOvulationPredicted = true;
                    cellData.currentCyclePhase = 'Ovulation'; // Override if ovulation is predicted
                } else if(cellData.currentCyclePhase !== 'Menstruation') {
                     // Don't override if it's a logged menstruation day that happens to fall in predicted fertile window
                    cellData.currentCyclePhase = 'Follicular'; // Default to Follicular if fertile but not ovulation
                }
            }
        }

        // Check against future predictions
        futureOvulations.forEach(ov => {
            if (isSameDay(dayPointer, ov.date)) {
                cellData.isOvulationPredicted = true;
                if (cellData.currentCyclePhase !== 'Menstruation') cellData.currentCyclePhase = 'Ovulation';
            }
            if (dayPointer >= ov.fertileWindow.start && dayPointer <= ov.fertileWindow.end) {
                cellData.isFertilePredicted = true;
                 if (cellData.currentCyclePhase !== 'Menstruation' && cellData.currentCyclePhase !== 'Ovulation') cellData.currentCyclePhase = 'Follicular';
            }
        });
        futurePeriods.forEach(fp => {
            if (isSameDay(dayPointer, fp)) {
                cellData.isNextPeriodPredicted = true;
                 if (cellData.currentCyclePhase !== 'Menstruation') cellData.currentCyclePhase = 'Menstruation'; // Predicted menstruation
            }
        });
      }
      grid.push(cellData);
      dayPointer = addDays(dayPointer, 1);
    }
    return grid;
  }, [currentMonth, appData.dailyEntries, monthMoonData, userPreferences.appMode, userPreferences.language]);


  const renderCells = () => {
    const rows = [];
    let days = [];
    
    for (let i = 0; i < calendarGridData.length; i++) {
      const cellInfo = calendarGridData[i];
      const day = parseISO(cellInfo.date); // for date operations

      let cellClasses = `min-h-[7rem] md:min-h-[8rem] p-1.5 flex flex-col 
                         cursor-pointer transition-colors duration-150 ease-in-out
                         border-r border-b border-border/40 relative group text-xs`;
      
      if ((i + 1) % 7 === 0) cellClasses = cn(cellClasses, 'border-r-0'); 

      let dayNumberStyle = "text-sm font-medium self-start text-foreground/90";
      let moonIconStyle = "text-lg text-[hsl(var(--color-moon))] opacity-70 group-hover:opacity-90";
      
      cellClasses = cn(cellClasses, 'hover:bg-muted/20');

      if (cellInfo.isToday) {
        cellClasses = cn(cellClasses, 'border-2 border-primary shadow-lg'); 
        dayNumberStyle = cn(dayNumberStyle, 'text-primary font-bold');
      }
      
      if (!cellInfo.isCurrentMonth) {
        cellClasses = cn(cellClasses, 'bg-muted/10'); 
        dayNumberStyle = cn(dayNumberStyle, 'text-muted-foreground opacity-60'); 
        moonIconStyle = cn(moonIconStyle, 'opacity-40');
      } else {
        cellClasses = cn(cellClasses, 'bg-card');
      }

      let phaseIcon = null;
      let phaseTooltip = "";

      if (userPreferences.appMode === 'cycle' && cellInfo.isCurrentMonth) {
        const isLoggedBleeding = cellInfo.bleeding && cellInfo.bleeding.intensity !== 'none';
        
        if (isLoggedBleeding) {
            cellClasses = cn(cellClasses, getBleedingBackgroundClass(cellInfo.bleeding?.intensity));
            phaseIcon = <Droplet className="h-4 w-4 text-destructive-foreground/80" />;
            phaseTooltip = t('calendarPhaseMenstruation');
        } else { // Not actively bleeding, check phases and predictions
            switch (cellInfo.currentCyclePhase) {
                case 'Follicular':
                    cellClasses = cn(cellClasses, 'bg-green-500/10 dark:bg-green-800/20');
                    phaseIcon = <Leaf className="h-3 w-3 text-green-600 dark:text-green-400" />;
                    phaseTooltip = t('calendarPhaseFollicular');
                    break;
                case 'Ovulation':
                    cellClasses = cn(cellClasses, 'bg-accent/30 dark:bg-accent/20'); // Using accent from theme
                    phaseIcon = <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
                    phaseTooltip = t('calendarPhaseOvulation');
                    break;
                case 'Luteal':
                    cellClasses = cn(cellClasses, 'bg-purple-500/10 dark:bg-purple-800/20');
                    // phaseIcon = <Moon className="h-3 w-3 text-purple-600 dark:text-purple-400" />; // Using Moon for moon phase
                    phaseTooltip = t('calendarPhaseLuteal');
                    break;
            }
        }

        if (cellInfo.isFertilePredicted && !isLoggedBleeding && cellInfo.currentCyclePhase !== 'Ovulation') {
             cellClasses = cn(cellClasses, 'bg-accent/20'); // Consistent with ovulation color but lighter
             if (!phaseIcon) phaseIcon = <Flower2 className="h-3 w-3 text-yellow-700 dark:text-yellow-500 opacity-70" />;
             phaseTooltip = phaseTooltip ? `${phaseTooltip} - ${t('calendarPhaseFertile')}` : t('calendarPhaseFertile');
        }
        if (cellInfo.isOvulationPredicted && cellInfo.currentCyclePhase === 'Ovulation') { // Ensure it's marked as ovulation
             if(!isLoggedBleeding) cellClasses = cn(cellClasses, 'bg-accent/40'); // Stronger for predicted ovulation
             phaseIcon = <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />; // Sun icon for ovulation
             phaseTooltip = `${t('calendarPhaseOvulation')} ${t('calendarPredicted')}`;
        }
         if (cellInfo.isNextPeriodPredicted && !isLoggedBleeding) {
            cellClasses = cn(cellClasses, 'border-dashed border-destructive/70');
            if (!phaseIcon) phaseIcon = <AlertTriangle className="h-3 w-3 text-destructive opacity-70" />;
            phaseTooltip = phaseTooltip ? `${phaseTooltip} - ${t('cyclePhaseMenstruation')} ${t('calendarPredicted')}` : `${t('cyclePhaseMenstruation')} ${t('calendarPredicted')}`;
        }
      }
      
      // Period start/end markers
      if (cellInfo.isPeriodStart && cellInfo.isCurrentMonth) {
        cellClasses = cn(cellClasses, 'border-l-4 border-l-primary'); 
      }
      if (cellInfo.isPeriodEnd && cellInfo.isCurrentMonth) {
        cellClasses = cn(cellClasses, 'border-r-4 border-r-accent');
      }
      
      days.push(
        <div
          key={cellInfo.date}
          className={cellClasses}
          onClick={() => handleDayClick(day)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDayClick(day)}
          aria-label={`Date ${format(day, 'PPP', { locale: userPreferences.language === 'de' ? de : undefined })}${phaseTooltip ? ', ' + phaseTooltip : ''}${cellInfo.moonPhaseName ? `, ${t('moonPhaseLabel')}: ${cellInfo.moonPhaseName}` : ''}`}
          title={phaseTooltip || format(day, 'PPP', { locale: userPreferences.language === 'de' ? de : undefined })}
        >
          <div className="flex justify-between items-start w-full">
              <span className={dayNumberStyle}>
                {cellInfo.dayOfMonth}
              </span>
              {cellInfo.isCurrentMonth && cellInfo.moonPhaseName && (
                <span className={moonIconStyle} title={t(`moonPhase${cellInfo.moonPhaseName.replace(/\s/g, '')}` as any, {defaultValue: cellInfo.moonPhaseName})}>
                  {isLoadingMoonData ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : getMoonEmoji(cellInfo.moonPhaseName)}
                </span>
              )}
          </div>
          
          <div className="mt-auto flex flex-col items-start w-full space-y-0.5">
            {phaseIcon && <div className="self-start">{phaseIcon}</div>}
            {cellInfo.isCurrentMonth && cellInfo.mood && (
               <div className="text-lg" title={cellInfo.mood}>
                  {cellInfo.mood}
               </div>
            )}
            {cellInfo.isCurrentMonth && cellInfo.notes && (
              <p className="text-xs text-muted-foreground truncate w-full">
                {cellInfo.notes.substring(0,15)}{cellInfo.notes.length > 15 ? '...' : ''}
              </p>
            )}
            {userPreferences.appMode === 'cycle' && cellInfo.isCurrentMonth && cellInfo.cycleDayNumber && cellInfo.cycleDayNumber > 0 && (
                 <span className="text-[10px] text-muted-foreground/80">D{cellInfo.cycleDayNumber}</span>
            )}
          </div>
        </div>
      );
      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7" key={`week-${cellInfo.date}`}>
            {days}
          </div>
        );
        days = [];
      }
    }
    return <div className="border-l border-border/40 bg-background flex-grow">{rows}</div>;
  };

  return (
    <div className="w-full h-full flex flex-col bg-card shadow-sm rounded-lg overflow-hidden">
      {userPreferences.appMode === 'cycle' && !getMostRecentPeriodStart(appData.dailyEntries) && (
          <div className="p-3 text-sm bg-accent/20 text-accent-foreground border-b border-border text-center">
              {t('calendarPhaseUnknown')}: Please log your period start date in the calendar to enable cycle phase tracking and predictions.
          </div>
      )}
      {renderHeader()}
      {renderDaysOfWeek()}
      <div className="flex-grow overflow-y-auto">
        {renderCells()}
      </div>

      {isEntryDialogOpen && selectedDateForEntry && userId && (
        <DayEntryDialog
          isOpen={isEntryDialogOpen}
          onClose={handleCloseEntryDialog}
          selectedDate={selectedDateForEntry}
          initialData={appData?.dailyEntries?.[format(selectedDateForEntry, 'yyyy-MM-dd')]}
          onSaveEntry={handleSaveEntry}
          language={userPreferences.language}
          t={t}
          appMode={userPreferences.appMode}
          currentMoonPhase={monthMoonData[format(selectedDateForEntry, 'yyyy-MM-dd')]}
        />
      )}
    </div>
  );
}
