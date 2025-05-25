
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar'; // ShadCN Calendar
import { buttonVariants } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';

// Mock NASA API data structure
interface MoonPhaseData {
  phaseName: string;
  illumination: number; // percentage
  date: string; // YYYY-MM-DD
}

// Mock function to simulate fetching NASA moon data
async function fetchMoonDataForMonth(year: number, month: number): Promise<MoonPhaseData[]> {
  // In a real app, this would call NASA API or a backend service
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  return Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    phaseName: phases[Math.floor(i / (daysInMonth / 8)) % 8],
    illumination: Math.abs( (i / (daysInMonth/2)) -1 ) * 100 // Simplified illumination
  }));
}


export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moonData, setMoonData] = useState<MoonPhaseData[]>([]);
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(false);

  useEffect(() => {
    const loadMoonData = async () => {
      setIsLoadingMoonData(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1; // getMonth is 0-indexed
      const data = await fetchMoonDataForMonth(year, month);
      setMoonData(data);
      setIsLoadingMoonData(false);
    };
    loadMoonData();
  }, [currentMonth]);

  const getDayData = (day: Date) => {
    const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const moonPhase = moonData.find(m => m.date === dateString);
    
    let dayType = '';
    const dayOfMonth = day.getDate();
    if (userPreferences.appMode === 'cycle') {
      if (dayOfMonth >= 1 && dayOfMonth <= 5) dayType = 'Period';
      else if (dayOfMonth === 14 || dayOfMonth === 15) dayType = 'Ovulation';
    } else {
      const weekOfPregnancy = Math.floor(dayOfMonth / 7) + 1;
      if (dayOfMonth % 7 === 1) dayType = `New Week (${weekOfPregnancy})`;
    }
    return { moonPhase, dayType };
  };

  const formatWeekdayName = (weekday: Date, options: { locale?: Locale }) => {
    const language = options.locale?.code === 'de' ? 'de-DE' : 'en-US';
    let shortName = weekday.toLocaleDateString(language, { weekday: 'short' });
    // For GCal like "MO", "TU"
    return shortName.substring(0, 2).toUpperCase();
  };
  
  const today = new Date();
  const todayModifier: Modifier = { date: today, disabled: false };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="p-4 md:p-6">
          {/* Title and description removed for a cleaner GCal look */}
          {/* Placeholder for GCal-like header controls (Today button, view toggles etc.) */}
        </CardHeader>
        <CardContent className="p-0 sm:p-0 md:p-0"> {/* Adjusted padding */}
          {/* Calendar takes full width now */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full" // Ensure calendar takes full width of its container
            formatters={{ formatWeekdayName }}
            modifiers={{ today: todayModifier }}
            modifiersClassNames={{
              today: 'bg-primary text-primary-foreground rounded-full',
            }}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-0",
              month: "space-y-2 p-0", // Removed default padding from month
              caption: "flex justify-center pt-1 relative items-center text-xl font-semibold text-foreground mb-2 px-2 sm:px-4",
              caption_label: "text-lg font-semibold",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                buttonVariants({ variant: "outline" }),
                "h-9 w-9 bg-transparent p-0 hover:opacity-100 border-border",
                "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
              ),
              nav_button_previous: "absolute left-2 top-1/2 -translate-y-1/2 transform",
              nav_button_next: "absolute right-2 top-1/2 -translate-y-1/2 transform",
              table: "w-full border-collapse", // Removed outer border, cell borders will define grid
              head_row: "flex border-b border-border bg-muted/10",
              head_cell: "text-muted-foreground font-normal text-xs w-full h-8 flex items-center justify-center uppercase border-r border-border last:border-r-0",
              row: "flex w-full border-b border-border last:border-b-0", 
              cell: cn(
                "h-24 sm:h-28 md:h-32 w-full text-sm p-0 relative overflow-hidden border-r border-border last:border-r-0", // Taller cells, border-r for vertical lines
                "focus-within:relative focus-within:z-10" 
              ),
              day: cn(
                buttonVariants({ variant: "ghost" }),
                "h-full w-full p-1 font-normal flex flex-col items-end justify-start focus:z-10 rounded-none text-right" 
              ),
              day_selected: "bg-primary/20 text-primary-foreground font-semibold", // More subtle selection
              day_today: "", // Resetting direct day_today style, will use modifier for the number
              day_outside: "day-outside text-muted-foreground/40",
              day_disabled: "text-muted-foreground opacity-40 pointer-events-none",
              day_hidden: "invisible",
            }}
            components={{
              DayContent: ({ date: dayDate, displayMonth }) => {
                const { moonPhase } = getDayData(dayDate);
                const isCurrentMonth = dayDate.getMonth() === displayMonth.getMonth();
                const isToday = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth() && dayDate.getFullYear() === today.getFullYear();
                const isSelected = date?.getTime() === dayDate.getTime();

                return (
                  <div className={cn(
                    "relative w-full h-full flex flex-col items-end p-1",
                    !isCurrentMonth && "text-muted-foreground/60"
                  )}>
                    <span className={cn(
                      "text-xs w-6 h-6 flex items-center justify-center rounded-full",
                       isToday && "bg-primary text-primary-foreground font-bold",
                       isSelected && !isToday && "ring-1 ring-primary", // Circle for selected if not today
                    )}>
                      {dayDate.getDate()}
                    </span>
                    
                    {isCurrentMonth && moonPhase && (
                        <div className="mt-auto self-center text-[10px] text-muted-foreground/70 pb-1" title={`${moonPhase.phaseName} (${moonPhase.illumination.toFixed(0)}%)`}>
                          {moonPhase.phaseName.includes('New') && '🌑'}
                          {moonPhase.phaseName.includes('Crescent') && (moonPhase.illumination < 50 ? '🌒' : '🌓')}
                          {moonPhase.phaseName.includes('Quarter') && (moonPhase.illumination < 50 ? '🌒' : '🌓')} {/* Simple distinction */}
                          {moonPhase.phaseName.includes('Gibbous') && (moonPhase.illumination < 50 ? '🌔' : '🌖')}
                          {moonPhase.phaseName.includes('Full') && '🌕'}
                        </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>
       {isLoadingMoonData && <p className="p-4 text-center text-muted-foreground">Loading moon data...</p>}
    </div>
  );
}
