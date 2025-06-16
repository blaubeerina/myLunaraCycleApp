
'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import de from 'date-fns/locale/de';

interface BloodEntry {
  [date: string]: boolean;
}

interface MoonPhaseData {
  [date: string]: string; // Stores the moon phase name like 'new_moon'
}

const BLOOD_ENTRIES_STORAGE_KEY = 'myLunaraCycle_bloodEntries';

export default function CycleMoonCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bloodEntries, setBloodEntries] = useState<BloodEntry>({});
  const [moonData, setMoonData] = useState<MoonPhaseData>({});

  // Mapping for moon phase names to emojis
  const moonPhaseToEmoji: Record<string, string> = {
    'new_moon': '🌑', 'waxing_crescent': '🌒', 'first_quarter': '🌓',
    'waxing_gibbous': '🌔', 'full_moon': '🌕', 'waning_gibbous': '🌖',
    'last_quarter': '🌗', 'waning_crescent': '🌘',
  };
  const moonPhaseNames: string[] = Object.keys(moonPhaseToEmoji);

  useEffect(() => {
    const storedBloodEntries = localStorage.getItem(BLOOD_ENTRIES_STORAGE_KEY);
    if (storedBloodEntries) {
      try {
        setBloodEntries(JSON.parse(storedBloodEntries));
      } catch (e) {
        console.error("Failed to parse blood entries from localStorage", e);
        setBloodEntries({}); // Initialize empty if parsing fails
      }
    } else {
        setBloodEntries({}); // Initialize empty if not found
    }

    // Dummy moon phase loader
    const MOCK_START_DATE_FOR_MOON = startOfMonth(currentMonth);
    const localMoonData: MoonPhaseData = {};
    // Generate for current month + padding for previous/next month days shown in grid
    const firstDayOfGrid = startOfWeek(startOfMonth(currentMonth), { locale: de, weekStartsOn: 1 });
    const lastDayOfGrid = endOfWeek(endOfMonth(currentMonth), { locale: de, weekStartsOn: 1 });
    
    let tempDay = firstDayOfGrid;
    while(tempDay <= lastDayOfGrid) {
        const dateKey = format(tempDay, 'yyyy-MM-dd');
        // Simple repeating cycle for phases for dummy data
        const dayOffset = Math.abs(tempDay.getDate() - MOCK_START_DATE_FOR_MOON.getDate());
        const phaseName = moonPhaseNames[dayOffset % moonPhaseNames.length];
        localMoonData[dateKey] = phaseName;
        tempDay = addDays(tempDay, 1);
    }
    setMoonData(localMoonData);
  }, [currentMonth]);

  const toggleBloodEntry = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setBloodEntries(prev => {
      const newEntries = { ...prev, [dateStr]: !prev[dateStr] };
      localStorage.setItem(BLOOD_ENTRIES_STORAGE_KEY, JSON.stringify(newEntries));
      return newEntries;
    });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center py-4 px-2 bg-card border-b border-border">
      <button 
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 rounded-md hover:bg-primary/30 text-foreground" // Adjusted hover for light theme
        aria-label="Previous month"
      >
        &lt;
      </button>
      <h2 className="text-xl font-semibold text-foreground">
        {format(currentMonth, 'MMMM yyyy', { locale: de })}
      </h2>
      <button 
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 rounded-md hover:bg-primary/30 text-foreground" // Adjusted hover
        aria-label="Next month"
      >
        &gt;
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    const weekStartsOn = de.options?.weekStartsOn ?? 1;
    const firstDayOfWeek = startOfWeek(new Date(), { locale: de, weekStartsOn });

    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-foreground text-sm py-2"> {/* 14pt: text-sm */}
          {format(addDays(firstDayOfWeek, i), 'EE', { locale: de })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border bg-border/10">{daysHeader}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: de, weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { locale: de, weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isBloodDay = bloodEntries[dateStr];
        const moonPhaseName = moonData[dateStr];
        const currentMoonEmoji = moonPhaseName ? moonPhaseToEmoji[moonPhaseName] : '';
        const isCurrentMonthDay = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        let cellClasses = `min-h-[6rem] md:min-h-[7rem] p-2 flex flex-col items-start 
                           cursor-pointer transition-colors duration-150 ease-in-out
                           border-r border-b border-border/40 
                           ${i === 6 ? 'border-r-0' : ''}`;
        
        let dayNumberStyle = "text-base font-medium self-end mr-0.5"; // 16pt: text-base. Margin for moon.
        let moonIconStyle = "text-lg text-[hsl(var(--color-moon))]"; // 18pt: text-lg. Soft Lilac.
        let bloodIndicator = null;

        if (isToday) {
          cellClasses += ' bg-[hsla(var(--calendar-current-day-bg-raw),0.2)]'; // Pale Sunrise 20%
          dayNumberStyle += ' text-foreground'; // Slate Grey
        } else if (!isCurrentMonthDay) {
          cellClasses += ' bg-[hsl(var(--calendar-other-month-bg))]'; // Light Grey #ECEFF4
          dayNumberStyle += ' text-[hsl(var(--calendar-other-month-fg))] opacity-50'; // Text for other month days with 50% opacity
          moonIconStyle += ' opacity-50';
        } else {
          cellClasses += ' bg-background'; // Dawn Grey (default)
          dayNumberStyle += ' text-foreground'; // Slate Grey
        }

        if (isBloodDay && isCurrentMonthDay) {
            cellClasses += ' bg-[hsla(var(--calendar-bleeding-bg-raw),0.1)]'; // Crimson 10% opacity
            // Day number text can remain slate, or a specific contrast if needed
            bloodIndicator = <span className="text-[hsl(var(--calendar-bleeding-indicator))] text-xs absolute top-2 right-2">●</span>;
        }
        
        days.push(
          <div
            key={day.toISOString()}
            className={`${cellClasses} relative`} // Added relative for absolute positioning of dot
            onClick={() => toggleBloodEntry(day)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleBloodEntry(day)}
            aria-pressed={isBloodDay}
            aria-label={`Date ${format(day, 'PPP', { locale: de })}${isBloodDay ? ', bleeding logged' : ''}${currentMoonEmoji ? `, moon phase: ${moonPhaseName}` : ''}`}
          >
            {bloodIndicator}
            <span className={dayNumberStyle}>
              {format(day, 'd')}
              {format(day,'d') === '1' && !isCurrentMonthDay && <span className="ml-1 text-xs">{format(day, 'MMM', {locale: de})}</span>}
            </span>
            
            <div className="flex-grow mt-1 w-full flex items-center justify-center">
              {currentMoonEmoji && (
                <span className={moonIconStyle} title={moonPhaseName}>
                   {currentMoonEmoji}
                </span>
              )}
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
    return <div className="border-l border-border/40">{rows}</div>;
  };

  return (
    <div className="w-full bg-card shadow-sm rounded-lg overflow-hidden">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </div>
  );
}

