
'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useAppContext } from '@/contexts/AppContext'; // Using new AppContext
import { useAuth } from '@/components/auth/AuthContext';
import type { DailyEntryData, MoonPhaseName } from '@/lib/types';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils'; // Assuming this exists and is adapted

// Mock function to simulate fetching NASA moon data - replace with actual API call
// For now, this will use our local moon-utils.ts
async function fetchMoonDataForMonth(date: Date): Promise<Record<string, MoonPhaseName>> {
  const monthStart = startOfMonth(date);
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
  const { t, userPreferences, getDailyEntry, saveDailyEntry, appData } = useAppContext();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthMoonData, setMonthMoonData] = useState<Record<string, MoonPhaseName>>({});
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(true);

  const userId = user?.id || 'mockUserId';

  const loadMoonData = useCallback(async () => {
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
    loadMoonData();
  }, [loadMoonData]);

  const handleDayClick = (day: Date) => {
    // Future: Open a dialog to log or view details for this day
    // For now, perhaps log to console or prepare for DayEntryDialog
    console.log("Clicked on day:", day);
    // Example: Open DayEntryDialog
    // setSelectedDateForLog(day);
    // setIsDayEntryDialogOpen(true);
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center py-4 px-2 bg-card border-b border-border">
      <button 
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 rounded-md hover:bg-primary/30 text-foreground"
        aria-label="Previous month"
      >
        &lt;
      </button>
      <h2 className="text-xl font-semibold text-important-text">
        {format(currentMonth, 'MMMM yyyy', { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined })}
      </h2>
      <button 
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 rounded-md hover:bg-primary/30 text-foreground"
        aria-label="Next month"
      >
        &gt;
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    const weekStartsOn = userPreferences.language === 'de' ? 1 : 0; // Monday for DE, Sunday for EN
    const firstDayOfWeek = startOfWeek(new Date(), { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined, weekStartsOn });

    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-sm py-2">
          {format(addDays(firstDayOfWeek, i), 'EE', { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border bg-card/50">{daysHeader}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const weekStartsOn = userPreferences.language === 'de' ? 1 : 0;
    const startDate = startOfWeek(monthStart, { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined, weekStartsOn });
    const endDate = endOfWeek(monthEnd, { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined, weekStartsOn });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dailyEntry = appData?.dailyEntries?.[dateStr]; // Get entry from AppContext safely
        const moonPhaseName = monthMoonData[dateStr];
        const currentMoonEmoji = moonPhaseName ? getMoonEmoji(moonPhaseName) : '';
        const isCurrentMonthDay = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        let cellClasses = `min-h-[6rem] md:min-h-[7rem] p-2 flex flex-col items-start 
                           cursor-pointer transition-colors duration-150 ease-in-out
                           border-r border-b border-border/40 
                           ${i === 6 ? 'border-r-0' : ''}`;
        
        let dayNumberStyle = "text-base font-medium self-end mr-0.5 text-foreground";
        let moonIconStyle = "text-lg text-[hsl(var(--color-moon))] opacity-70";
        let periodIndicator = null;

        if (isToday) {
          cellClasses += ' bg-primary/20'; // Using primary color from theme
          dayNumberStyle += ' text-primary-foreground'; 
        } else if (!isCurrentMonthDay) {
          cellClasses += ' bg-muted/30'; 
          dayNumberStyle += ' text-muted-foreground opacity-50'; 
          moonIconStyle += ' opacity-50';
        } else {
          cellClasses += ' bg-card'; 
          dayNumberStyle += ' text-card-foreground'; 
        }

        if (dailyEntry?.isPeriodStart || dailyEntry?.bleedingStrength && dailyEntry.bleedingStrength !== 'none') {
            cellClasses += ' bg-destructive/10'; 
            periodIndicator = <span className="text-destructive text-xs absolute top-2 right-2">●</span>;
        }
        
        days.push(
          <div
            key={day.toISOString()}
            className={`${cellClasses} relative`}
            onClick={() => handleDayClick(day)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleDayClick(day)}
            aria-label={`Date ${format(day, 'PPP', { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined })}${periodIndicator ? ', period logged' : ''}${currentMoonEmoji ? `, moon phase: ${moonPhaseName}` : ''}`}
          >
            {periodIndicator}
            <span className={dayNumberStyle}>
              {format(day, 'd')}
              {format(day,'d') === '1' && !isCurrentMonthDay && <span className="ml-1 text-xs">{format(day, 'MMM', {locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : undefined})}</span>}
            </span>
            
            <div className="flex-grow mt-1 w-full flex items-center justify-center">
              {isLoadingMoonData ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : (currentMoonEmoji && (
                <span className={moonIconStyle} title={moonPhaseName}>
                   {currentMoonEmoji}
                </span>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border/20" key={`week-${format(day, 'yyyy-MM-dd')}`}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-border/40 bg-background">{rows}</div>;
  };

  return (
    <div className="w-full bg-card shadow-sm rounded-lg overflow-hidden">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}

// Helper Loader component
function Loader2({className}: {className?: string}) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    )
}
