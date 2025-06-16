
'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import de from 'date-fns/locale/de';
// Removed Image import as we'll display phase name as text for now
// import Image from 'next/image';

interface BloodEntry {
  [date: string]: boolean;
}

interface MoonPhaseData {
  [date: string]: string; // e.g. 'new_moon', 'full_moon'
}

const BLOOD_ENTRIES_STORAGE_KEY = 'myLunaraCycle_bloodEntries';

export default function CycleMoonCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bloodEntries, setBloodEntries] = useState<BloodEntry>({});
  const [moonData, setMoonData] = useState<MoonPhaseData>({});

  useEffect(() => {
    // Load blood entries from localStorage
    const storedBloodEntries = localStorage.getItem(BLOOD_ENTRIES_STORAGE_KEY);
    if (storedBloodEntries) {
      try {
        setBloodEntries(JSON.parse(storedBloodEntries));
      } catch (e) {
        console.error("Failed to parse blood entries from localStorage", e);
        // Initialize with empty if parsing fails
        setBloodEntries({});
      }
    } else {
        // Initialize with empty if not found
        setBloodEntries({});
    }

    // Dummy moon phase loader – replace with NASA API or static JSON
    // Note: Ensure your moon phase names here match what you expect for image file names if re-enabling images.
    const exampleMoonData: MoonPhaseData = {
      '2025-06-01': 'new_moon',
      '2025-06-05': 'waxing_crescent',
      '2025-06-09': 'first_quarter',
      '2025-06-13': 'waxing_gibbous',
      '2025-06-17': 'full_moon',
      '2025-06-21': 'waning_gibbous',
      '2025-06-25': 'last_quarter',
      '2025-06-29': 'waning_crescent',
      // Add more for other months or implement dynamic loading
    };
    // Example for current month to make dummy data more relevant
    const MOCK_START_DATE_FOR_MOON = startOfMonth(new Date()); // Or currentMonth if you want it to change
    const localMoonData: MoonPhaseData = {};
    for(let i = 0; i < 30; i++) {
        const dateKey = format(addDays(MOCK_START_DATE_FOR_MOON, i), 'yyyy-MM-dd');
        if (i % 29 === 0) localMoonData[dateKey] = 'new_moon';
        else if (i % 29 === 7) localMoonData[dateKey] = 'first_quarter';
        else if (i % 29 === 14) localMoonData[dateKey] = 'full_moon';
        else if (i % 29 === 21) localMoonData[dateKey] = 'last_quarter';
        else if (i % 29 < 7) localMoonData[dateKey] = 'waxing_crescent';
        else if (i % 29 < 14) localMoonData[dateKey] = 'waxing_gibbous';
        else if (i % 29 < 21) localMoonData[dateKey] = 'waning_gibbous';
        else localMoonData[dateKey] = 'waning_crescent';
    }

    setMoonData(localMoonData);
  }, []); // Removed currentMonth from dependencies to prevent dummy moon data reloading on month change.
            // If moon data should be fetched per month, adjust this effect.

  const toggleBloodEntry = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setBloodEntries(prev => {
      const newEntries = {
        ...prev,
        [dateStr]: !prev[dateStr],
      };
      // Save to localStorage
      localStorage.setItem(BLOOD_ENTRIES_STORAGE_KEY, JSON.stringify(newEntries));
      return newEntries;
    });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center py-4 px-2 bg-background border-b border-border">
      <button 
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
        aria-label="Previous month"
      >
        &lt;
      </button>
      <h2 className="text-xl font-semibold text-foreground">
        {format(currentMonth, 'MMMM yyyy', { locale: de })}
      </h2>
      <button 
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
        aria-label="Next month"
      >
        &gt;
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const daysHeader = [];
    // Ensure Sunday is the start of the week for this header if locale implies it, or stick to Monday for 'de'
    const weekStartsOn = de.options?.weekStartsOn ?? 1; // Default to Monday for 'de'
    const firstDayOfWeek = startOfWeek(new Date(), { locale: de, weekStartsOn });

    for (let i = 0; i < 7; i++) {
      daysHeader.push(
        <div key={i} className="text-center font-medium text-muted-foreground text-sm py-2">
          {format(addDays(firstDayOfWeek, i), 'EE', { locale: de })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-px border-b border-border bg-border">{daysHeader}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    // For 'de' locale, week starts on Monday (1)
    const startDate = startOfWeek(monthStart, { locale: de, weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { locale: de, weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isBloodDay = bloodEntries[dateStr];
        const currentMoonPhase = moonData[dateStr];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toISOString()}
            className={`min-h-[6rem] md:min-h-[7rem] p-2 flex flex-col items-start 
                        ${isCurrentMonth ? 'bg-background hover:bg-accent/10' : 'bg-muted/30 hover:bg-accent/20 text-muted-foreground/70'} 
                        cursor-pointer transition-colors duration-150 ease-in-out
                        border-r border-b border-border 
                        ${i === 6 ? 'border-r-0' : ''} 
                       `}
            onClick={() => toggleBloodEntry(day)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && toggleBloodEntry(day)}
            aria-pressed={isBloodDay}
            aria-label={`Date ${format(day, 'PPP', { locale: de })}${isBloodDay ? ', bleeding logged' : ''}${currentMoonPhase ? `, moon phase: ${currentMoonPhase}` : ''}`}
          >
            <span className={`text-xs font-medium self-end ${isToday ? 'bg-primary text-primary-foreground rounded-full px-1.5 py-0.5' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/70'}`}>
              {format(day, 'd')}
              {format(day,'d') === '1' && !isCurrentMonth && <span className="ml-1">{format(day, 'MMM', {locale: de})}</span>}
            </span>
            
            <div className="flex-grow mt-1 w-full space-y-1">
              {currentMoonPhase && (
                <div className="text-xs text-muted-foreground">
                  {/* Replace with Image component when SVGs are available in public/moon/ */}
                  {/* <Image src={`/moon/${currentMoonPhase}.svg`} alt={currentMoonPhase} width={16} height={16} data-ai-hint="moon phase" /> */}
                   <span>{currentMoonPhase.replace(/_/g, ' ')}</span>
                </div>
              )}
              {isBloodDay && <div className="text-sm text-destructive mt-auto self-center">🩸</div>}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-px bg-border" key={`week-${format(day, 'yyyy-MM-dd')}`}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border-l border-border">{rows}</div>;
  };

  return (
    <div className="w-full bg-card shadow-md rounded-lg overflow-hidden">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      {/* 
        Placeholder for additional features requested in your prompt:
        - Cycle calculation display (follicular, ovulation, luteal)
        - Mood, energy, body feeling entries (would need a dialog like the previous calendar)
        - Statistical analysis section
        - AI Impulses

        These can be built upon this new calendar structure.
      */}
    </div>
  );
}

    