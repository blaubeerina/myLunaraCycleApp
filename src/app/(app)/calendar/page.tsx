
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import type { DailyEntryData, MoonPhaseName, CalendarCellData, CyclePhaseName, BleedingIntensity, AppMode } from '@/lib/types';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Droplet, Sun, Leaf, Flower2, AlertTriangle } from 'lucide-react';
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog';
import { cn } from '@/lib/utils';
import { 
  getMostRecentPeriodStart, // Still used by dialog logic if not overridden
  calculateCycleDayNumber,
  determineCyclePhase,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  getPredictedOvulationDate,
  getPredictedFertileWindow,
  getPredictedNextPeriodDates,
  getBleedingBackgroundClass,
  calculateFullCycleInfoForDate, // Not directly used for grid, but can be for dialog context
} from '@/lib/cycle-utils';


// Removed fetchMoonDataForMonth as moon data will be calculated directly or mocked

export default function CalendarPage() {
  const { t, userPreferences, appData, saveDailyEntry, loadAppData } = useAppContext();
  const { user } = useAuth();

  // Mock current month to June 2025 for the demo
  const [currentMonth, setCurrentMonth] = useState(new Date('2025-06-01T00:00:00'));
  
  // monthMoonData can be used by DayEntryDialog if needed, populate it statically.
  const [monthMoonData, setMonthMoonData] = useState<Record<string, MoonPhaseName>>({});
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(false); // Keep for consistency, but set to false

  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedDateForEntry, setSelectedDateForEntry] = useState<Date | null>(null);

  const userId = user?.id;

  // Mock "today" for consistent display in the mock-up
  const MOCK_TODAY_DATE = useMemo(() => new Date('2025-06-19T00:00:00'), []);


  // Mock user preferences for the calendar view, forcing cycle mode
  const mockUserPreferences = useMemo(() => ({
    language: userPreferences.language,
    appMode: 'cycle' as AppMode,
    theme: userPreferences.theme,
  }), [userPreferences.language, userPreferences.theme]);

  // Define the mock period
  const MOCK_PERIOD_START_DATE_STR = '2025-05-29';
  const MOCK_PERIOD_END_DATE_STR = '2025-06-01';
  const MOCK_PERIOD_START_DATE = useMemo(() => parseISO(MOCK_PERIOD_START_DATE_STR), []);
  const MOCK_PERIOD_END_DATE = useMemo(() => parseISO(MOCK_PERIOD_END_DATE_STR), []);

  // Disable dynamic data loading effects for the mock-up
  useEffect(() => {
    // console.log("DEMO MODE: Skipping appData load for calendar mock.");
    // console.log("DEMO MODE: Skipping moon data load for calendar mock, calculating per cell or statically.");
    setIsLoadingMoonData(false); // Ensure loading is false

    // Statically populate monthMoonData for DayEntryDialog or other potential uses
    const monthStart = startOfMonth(currentMonth);
    const monthEndVal = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1, locale: mockUserPreferences.language === 'de' ? de : undefined });
    const gridEnd = endOfWeek(monthEndVal, { weekStartsOn: 1, locale: mockUserPreferences.language === 'de' ? de : undefined });
    
    const staticMoonData: Record<string, MoonPhaseName> = {};
    let dayPointerMoon = gridStart;
    while (dayPointerMoon <= gridEnd) {
      const dateStr = format(dayPointerMoon, 'yyyy-MM-dd');
      staticMoonData[dateStr] = getMoonPhase(dayPointerMoon);
      dayPointerMoon = addDays(dayPointerMoon, 1);
    }
    setMonthMoonData(staticMoonData);

  }, [currentMonth, mockUserPreferences.language]);


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
      // Note: This will save to the actual appData via context,
      // but the calendar grid itself is based on mock data and won't visually update from this save.
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
        aria-label={t('previousMonth', { month: format(subMonths(currentMonth,1), 'MMMM yyyy', { locale: mockUserPreferences.language === 'de' ? de : undefined })})}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <h2 className="text-lg md:text-xl font-semibold text-primary">
        {format(currentMonth, 'MMMM yyyy', { locale: mockUserPreferences.language === 'de' ? de : undefined })}
      </h2>
      <Button 
        variant="ghost"
        size="icon"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="text-foreground hover:bg-primary/10"
        aria-label={t('nextMonth', { month: format(addMonths(currentMonth,1), 'MMMM yyyy', { locale: mockUserPreferences.language === 'de' ? de : undefined })})}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    const weekStartsOn = 1; 
    const firstDayOfWeek = startOfWeek(new Date(), { locale: mockUserPreferences.language === 'de' ? de : undefined, weekStartsOn });

    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-xs sm:text-sm py-2 border-b border-border">
          {format(addDays(firstDayOfWeek, i), 'EE', { locale: mockUserPreferences.language === 'de' ? de : undefined })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 sticky top-[calc(3.5rem+1px)] md:top-[calc(4rem+1px)] z-10 bg-card">{daysHeader}</div>;
  };

  const calendarGridData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEndValue = endOfMonth(monthStart); // Corrected: use monthStart
    const weekStartsOn = 1; // Monday
    const startDate = startOfWeek(monthStart, { locale: mockUserPreferences.language === 'de' ? de : undefined, weekStartsOn });
    const endDate = endOfWeek(monthEndValue, { locale: mockUserPreferences.language === 'de' ? de : undefined, weekStartsOn });
    
    const grid: CalendarCellData[] = [];
    let dayPointer = startDate;

    const mockOvulationDate = getPredictedOvulationDate(MOCK_PERIOD_START_DATE);
    const mockFertileWindow = getPredictedFertileWindow(mockOvulationDate);
    const mockNextPeriodDates = getPredictedNextPeriodDates(MOCK_PERIOD_START_DATE, 1);

    while(dayPointer <= endDate) {
      const dateStr = format(dayPointer, 'yyyy-MM-dd');
      const dayStartVal = startOfDay(dayPointer);

      const cycleDay = calculateCycleDayNumber(MOCK_PERIOD_START_DATE_STR, dayPointer);
      let currentPhase = determineCyclePhase(dayPointer, MOCK_PERIOD_START_DATE_STR, DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH);
      let bleedingIntensity: BleedingIntensity | undefined = undefined;
      let isPeriodStartMarker = false;
      let isPeriodEndMarker = false;

      if (dayStartVal >= MOCK_PERIOD_START_DATE && dayStartVal <= MOCK_PERIOD_END_DATE) {
        currentPhase = 'Menstruation';
        if (isSameDay(dayStartVal, MOCK_PERIOD_START_DATE)) {
          bleedingIntensity = 'medium'; isPeriodStartMarker = true;
        } else if (isSameDay(dayStartVal, addDays(MOCK_PERIOD_START_DATE, 1))) { // May 30th
          bleedingIntensity = 'heavy';
        } else if (isSameDay(dayStartVal, addDays(MOCK_PERIOD_START_DATE, 2))) { // May 31st
          bleedingIntensity = 'medium';
        } else if (isSameDay(dayStartVal, MOCK_PERIOD_END_DATE)) { // June 1st
          bleedingIntensity = 'light'; isPeriodEndMarker = true;
        }
      }

      let cellData: CalendarCellData = {
        date: dateStr,
        dayOfMonth: dayPointer.getDate(),
        isCurrentMonth: isSameMonth(dayPointer, monthStart),
        isToday: isSameDay(dayPointer, MOCK_TODAY_DATE), // Use mocked "today"
        mood: undefined, notes: undefined, // No mood/notes in this static mock grid
        bleeding: bleedingIntensity ? { intensity: bleedingIntensity } : undefined,
        isPeriodStart: isPeriodStartMarker,
        isPeriodEnd: isPeriodEndMarker,
        moonPhaseName: getMoonPhase(dayPointer), // Calculate moon phase
        currentCyclePhase: currentPhase,
        cycleDayNumber: cycleDay || undefined,
        isFertilePredicted: false,
        isOvulationPredicted: false,
        isNextPeriodPredicted: false,
      };

      if (isSameDay(dayPointer, mockOvulationDate)) {
          cellData.isOvulationPredicted = true;
          if (cellData.currentCyclePhase !== 'Menstruation') cellData.currentCyclePhase = 'Ovulation';
      }
      if (dayPointer >= mockFertileWindow.start && dayPointer <= mockFertileWindow.end) {
          cellData.isFertilePredicted = true;
           if (cellData.currentCyclePhase !== 'Menstruation' && cellData.currentCyclePhase !== 'Ovulation') cellData.currentCyclePhase = 'Follicular';
      }
      if (mockNextPeriodDates[0] && isSameDay(dayPointer, mockNextPeriodDates[0])) {
          cellData.isNextPeriodPredicted = true;
           if (cellData.currentCyclePhase !== 'Menstruation') cellData.currentCyclePhase = 'Menstruation';
      }
      
      grid.push(cellData);
      dayPointer = addDays(dayPointer, 1);
    }
    return grid;
  }, [currentMonth, mockUserPreferences.language, MOCK_PERIOD_START_DATE, MOCK_PERIOD_END_DATE, MOCK_TODAY_DATE]);


  const renderCells = () => {
    const rows = [];
    let days = [];
    
    for (let i = 0; i < calendarGridData.length; i++) {
      const cellInfo = calendarGridData[i];
      const day = parseISO(cellInfo.date); 

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

      if (mockUserPreferences.appMode === 'cycle' && cellInfo.isCurrentMonth) {
        const isLoggedBleeding = cellInfo.bleeding && cellInfo.bleeding.intensity !== 'none';
        
        if (isLoggedBleeding) {
            cellClasses = cn(cellClasses, getBleedingBackgroundClass(cellInfo.bleeding?.intensity));
            phaseIcon = <Droplet className="h-4 w-4 text-destructive-foreground/80" />;
            phaseTooltip = t('calendarPhaseMenstruation');
        } else { 
            switch (cellInfo.currentCyclePhase) {
                case 'Follicular':
                    cellClasses = cn(cellClasses, 'bg-green-500/10 dark:bg-green-800/20');
                    phaseIcon = <Leaf className="h-3 w-3 text-green-600 dark:text-green-400" />;
                    phaseTooltip = t('calendarPhaseFollicular');
                    break;
                case 'Ovulation':
                    cellClasses = cn(cellClasses, 'bg-accent/30 dark:bg-accent/20');
                    phaseIcon = <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
                    phaseTooltip = t('calendarPhaseOvulation');
                    break;
                case 'Luteal':
                    cellClasses = cn(cellClasses, 'bg-purple-500/10 dark:bg-purple-800/20');
                    phaseTooltip = t('calendarPhaseLuteal');
                    break;
            }
        }

        if (cellInfo.isFertilePredicted && !isLoggedBleeding && cellInfo.currentCyclePhase !== 'Ovulation') {
             cellClasses = cn(cellClasses, 'bg-accent/20');
             if (!phaseIcon) phaseIcon = <Flower2 className="h-3 w-3 text-yellow-700 dark:text-yellow-500 opacity-70" />;
             phaseTooltip = phaseTooltip ? `${phaseTooltip} - ${t('calendarPhaseFertile')}` : t('calendarPhaseFertile');
        }
        if (cellInfo.isOvulationPredicted && cellInfo.currentCyclePhase === 'Ovulation') {
             if(!isLoggedBleeding) cellClasses = cn(cellClasses, 'bg-accent/40');
             phaseIcon = <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
             phaseTooltip = `${t('calendarPhaseOvulation')} ${t('calendarPredicted')}`;
        }
         if (cellInfo.isNextPeriodPredicted && !isLoggedBleeding) {
            cellClasses = cn(cellClasses, 'border-dashed border-destructive/70');
            if (!phaseIcon) phaseIcon = <AlertTriangle className="h-3 w-3 text-destructive opacity-70" />;
            phaseTooltip = phaseTooltip ? `${phaseTooltip} - ${t('cyclePhaseMenstruation')} ${t('calendarPredicted')}` : `${t('cyclePhaseMenstruation')} ${t('calendarPredicted')}`;
        }
      }
      
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
          aria-label={`Date ${format(day, 'PPP', { locale: mockUserPreferences.language === 'de' ? de : undefined })}${phaseTooltip ? ', ' + phaseTooltip : ''}${cellInfo.moonPhaseName ? `, ${t('moonPhaseLabel')}: ${cellInfo.moonPhaseName}` : ''}`}
          title={phaseTooltip || format(day, 'PPP', { locale: mockUserPreferences.language === 'de' ? de : undefined })}
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
            {/* Mood and notes display can be kept if dialog saves them, but grid is static for mock */}
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
            {mockUserPreferences.appMode === 'cycle' && cellInfo.isCurrentMonth && cellInfo.cycleDayNumber && cellInfo.cycleDayNumber > 0 && (
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
  
  // Find initial data for dialog from the static grid data
  const getInitialDialogData = () => {
    if (!selectedDateForEntry) return undefined;
    const dateStr = format(selectedDateForEntry, 'yyyy-MM-dd');
    return calendarGridData.find(cell => cell.date === dateStr);
  };


  return (
    <div className="w-full h-full flex flex-col bg-card shadow-sm rounded-lg overflow-hidden">
      {/* Removed the "Please log period start" notice for mock-up */}
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
          initialData={getInitialDialogData()} // Use data from the static grid
          onSaveEntry={handleSaveEntry}
          language={mockUserPreferences.language}
          t={t}
          appMode={mockUserPreferences.appMode}
          currentMoonPhase={monthMoonData[format(selectedDateForEntry, 'yyyy-MM-dd')]}
        />
      )}
    </div>
  );
}

