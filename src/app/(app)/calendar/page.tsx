
'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale'; // For German locale
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import type { DailyEntryData, MoonPhaseName } from '@/lib/types';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog'; // New dialog
import { cn } from '@/lib/utils';

// Mock function to simulate fetching NASA moon data - replace with actual API call later
// For now, this will use our local moon-utils.ts
async function fetchMoonDataForMonth(date: Date): Promise<Record<string, MoonPhaseName>> {
  const monthStart = startOfMonth(date);
  // Ensure grid covers all displayed days, starting from Monday
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); 
  const gridEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  
  const data: Record<string, MoonPhaseName> = {};
  let currentDay = gridStart;
  while (currentDay <= gridEnd) {
    const dateStr = format(currentDay, 'yyyy-MM-dd');
    data[dateStr] = getMoonPhase(currentDay); // Using local calculation
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
        loadAppData(userId); // Load data when user ID is available
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
    // Optionally, trigger a re-fetch or optimistic update for the calendar display
    // For now, AppContext update should trigger re-render if appData is used as dependency
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
    const weekStartsOn = 1; // Monday
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

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const weekStartsOn = 1; // Monday
    const startDate = startOfWeek(monthStart, { locale: userPreferences.language === 'de' ? de : undefined, weekStartsOn });
    const endDate = endOfWeek(monthEnd, { locale: userPreferences.language === 'de' ? de : undefined, weekStartsOn });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dailyEntry = appData?.dailyEntries?.[dateStr];
        const moonPhaseName = monthMoonData[dateStr];
        const currentMoonEmoji = moonPhaseName ? getMoonEmoji(moonPhaseName) : '';
        const isCurrentMonthDay = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        const hasBleeding = dailyEntry?.bleeding && dailyEntry.bleeding.intensity !== 'none';

        let cellClasses = `min-h-[6rem] md:min-h-[7rem] p-1.5 flex flex-col 
                           cursor-pointer transition-colors duration-150 ease-in-out
                           border-r border-b border-border/40 relative group`;
        
        if (i === 6) cellClasses = cn(cellClasses, 'border-r-0'); // No right border for last cell in row

        let dayNumberStyle = "text-sm font-medium self-start text-foreground/90";
        let moonIconStyle = "text-lg text-[hsl(var(--color-moon))] opacity-70 group-hover:opacity-90";
        
        // Hover effect
        cellClasses = cn(cellClasses, 'hover:bg-muted/20');

        if (isToday) {
          cellClasses = cn(cellClasses, 'border-2 border-primary'); 
          dayNumberStyle = cn(dayNumberStyle, 'text-primary font-bold');
        }
        
        if (!isCurrentMonthDay) {
          cellClasses = cn(cellClasses, 'bg-muted/10'); 
          dayNumberStyle = cn(dayNumberStyle, 'text-muted-foreground opacity-60'); 
          moonIconStyle = cn(moonIconStyle, 'opacity-40');
        } else {
          cellClasses = cn(cellClasses, 'bg-card'); 
        }
        
        if (hasBleeding && isCurrentMonthDay) {
            // Selected day (bleeding) style: #E8B4BC (destructive color)
            cellClasses = cn(cellClasses, 'bg-destructive/20'); 
        }
        
        days.push(
          <div
            key={day.toISOString()}
            className={cellClasses}
            onClick={() => handleDayClick(day)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDayClick(day)}
            aria-label={`Date ${format(day, 'PPP', { locale: userPreferences.language === 'de' ? de : undefined })}${hasBleeding ? `, ${t('bleedingLogged')}` : ''}${currentMoonEmoji ? `, ${t('moonPhaseLabel')}: ${moonPhaseName}` : ''}`}
          >
            <div className="flex justify-between items-start w-full">
                <span className={dayNumberStyle}>
                  {format(day, 'd')}
                </span>
                {isCurrentMonthDay && currentMoonEmoji && (
                  <span className={moonIconStyle} title={moonPhaseName}>
                    {isLoadingMoonData ? <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" /> : currentMoonEmoji}
                  </span>
                )}
            </div>
            
            {isCurrentMonthDay && hasBleeding && (
                <div className="absolute bottom-1.5 right-1.5 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-destructive opacity-80" title={t('bleedingLogged')}></span>
                </div>
            )}
            {isCurrentMonthDay && dailyEntry?.mood && (
                 <div className="absolute bottom-1.5 left-1.5 text-sm" title={dailyEntry.mood}>
                    {dailyEntry.mood}
                 </div>
            )}

            {/* Display first few characters of notes if available */}
            {isCurrentMonthDay && dailyEntry?.notes && (
              <p className="text-xs text-muted-foreground mt-auto truncate w-full">
                {dailyEntry.notes.substring(0,15)}{dailyEntry.notes.length > 15 ? '...' : ''}
              </p>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={`week-${format(day, 'yyyy-MM-dd')}`}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-border/40 bg-background flex-grow">{rows}</div>;
  };

  return (
    <div className="w-full h-full flex flex-col bg-card shadow-sm rounded-lg overflow-hidden">
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
          appMode={userPreferences.appMode} // Pass appMode
          currentMoonPhase={monthMoonData[format(selectedDateForEntry, 'yyyy-MM-dd')]}
        />
      )}
    </div>
  );
}
