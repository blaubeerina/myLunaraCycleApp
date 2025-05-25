'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect, useMemo } from 'react';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Search, HelpCircle, Settings, GripVertical, Calendar as CalendarIconLucide } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MoonPhaseData {
  phaseName: string;
  illumination: number;
  date: string; // YYYY-MM-DD
}

// Expanded mock function to simulate fetching NASA moon data
async function fetchMoonDataForMonth(year: number, month: number): Promise<MoonPhaseData[]> {
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  
  // A simple deterministic way to assign phases for mock data
  // This ensures consistent phases for a given date for the mock
  const getPhaseForDay = (day: number) => {
    // Cycle through phases every ~3-4 days to get a varied month
    const phaseIndex = Math.floor(((year * 100 + month * 31 + day) % 29.5) / (29.5 / 8)) % 8;
    return phases[phaseIndex];
  };

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      phaseName: getPhaseForDay(day),
      illumination: Math.abs(( ( (day % 29.5) / (29.5/2)) -1 ) * 100) // Rough illumination cycle
    };
  });
}

function getMoonEmoji(phaseName: string): string {
  switch (phaseName) {
    case 'New Moon': return '🌑';
    case 'Waxing Crescent': return '🌒';
    case 'First Quarter': return '🌓';
    case 'Waxing Gibbous': return '🌔';
    case 'Full Moon': return '🌕';
    case 'Waning Gibbous': return '🌖';
    case 'Last Quarter': return '🌗';
    case 'Waning Crescent': return '🌘';
    default: return ' '; // No emoji if phase unknown
  }
}

export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentDisplayMonth, setCurrentDisplayMonth] = useState(new Date());
  const [moonDataMap, setMoonDataMap] = useState<Map<string, MoonPhaseData>>(new Map());
  const [isLoadingMoonData, setIsLoadingMoonData] = useState(false);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const loadAllMoonData = async () => {
      setIsLoadingMoonData(true);
      const year = currentDisplayMonth.getFullYear();
      const month = currentDisplayMonth.getMonth(); // 0-indexed

      // Fetch for previous, current, and next months to cover "outside" days
      const monthsToFetchDates = [
        new Date(year, month - 1, 1), // Previous month
        new Date(year, month, 1),     // Current month
        new Date(year, month + 1, 1), // Next month
      ];

      const newMap = new Map<string, MoonPhaseData>();
      // Use Promise.all to fetch in parallel
      const results = await Promise.all(
        monthsToFetchDates.map(dateToFetch =>
          fetchMoonDataForMonth(dateToFetch.getFullYear(), dateToFetch.getMonth() + 1) // getMonth()+1 for 1-indexed API
        )
      );
      
      results.flat().forEach(phase => {
        if (phase && phase.date) { // Ensure phase and phase.date are defined
          newMap.set(phase.date, phase);
        }
      });
      
      setMoonDataMap(newMap);
      setIsLoadingMoonData(false);
    };
    loadAllMoonData();
  }, [currentDisplayMonth]);


  const formatWeekdayName = (weekday: Date, options: { locale?: Locale }) => {
    const language = userPreferences.language === 'de' ? 'de-DE' : 'en-US';
    let shortName = weekday.toLocaleDateString(language, { weekday: 'short' });
    return shortName.substring(0, 2).toUpperCase();
  };
  
  const todayModifier: Modifier = { date: today, disabled: false };

  const handleTodayClick = () => {
    setCurrentDisplayMonth(today);
    setSelectedDate(today);
  };

  return (
    <div className="flex-grow flex flex-col h-full w-full"> {/* Occupy available space */}
        <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentDisplayMonth}
            onMonthChange={setCurrentDisplayMonth}
            className="w-full flex-grow flex flex-col" // Calendar takes full width and grows
            formatters={{ formatWeekdayName }}
            modifiers={{ today: todayModifier }}
            showOutsideDays={true}
            classNames={{
              root: "flex flex-col flex-grow w-full", // Ensure root is flex-col and takes height
              months: "flex flex-col sm:flex-row flex-grow",
              month: "space-y-0 flex flex-col flex-grow p-0", // No space, flex column, grow
              
              caption_layout: 'flex items-center justify-between py-2 px-1 md:px-2 relative border-b',
              caption: "flex items-center gap-1", 
              caption_label: "text-lg font-semibold text-foreground text-center flex-grow justify-start", // Align left
              
              nav_container: "flex items-center gap-1",
              nav_button: cn(
                buttonVariants({ variant: "ghost" }),
                "h-8 w-8 p-0 hover:bg-accent/50"
              ),
              nav_button_previous: "",
              nav_button_next: "",

              table: "w-full border-collapse mt-0 flex-grow grid grid-rows-[auto_repeat(6,minmax(0,1fr))]", // CSS Grid for 6 rows, flex-grow
              head_row: "flex border-b",
              head_cell: "text-muted-foreground font-normal text-[0.70rem] flex items-center justify-center uppercase border-r last:border-r-0 pt-1 pb-1 w-[calc(100%/7)] h-8",

              row: "flex w-full border-b last:border-b-0", // Each row will take 1fr due to grid-rows on table
              cell: cn(
                "text-sm p-0 relative border-r last:border-r-0 text-right flex flex-col items-center justify-start", // Center content, start from top
                "focus-within:relative focus-within:z-10 w-[calc(100%/7)]" 
              ),
              day: cn( // The button inside the cell
                buttonVariants({ variant: "ghost" }),
                "h-full w-full p-1 font-normal flex flex-col items-center justify-start focus:z-10 rounded-none text-center" 
              ),
              day_selected: "bg-accent/30", // More subtle selection
              day_today: "", // Handled in DayContent for specific number styling
              day_outside: "text-muted-foreground/60",
              day_disabled: "text-muted-foreground opacity-40 pointer-events-none",
              day_hidden: "invisible",
            }}
            components={{
              Caption: ({ displayMonth }) => (
                <div className="flex items-center justify-between py-2 px-2 md:px-4 border-b border-border h-14">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleTodayClick} className="text-sm h-9">
                      {t('today') || 'Heute'} 
                    </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() -1, 1))}>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Previous Month</span>
                     </Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setCurrentDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next Month</span>
                    </Button>
                     <h2 className="text-xl font-medium text-foreground ml-3">
                        {displayMonth.toLocaleDateString(userPreferences.language, { month: 'long', year: 'numeric' })}
                     </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Search className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><HelpCircle className="h-5 w-5"/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Settings className="h-5 w-5"/></Button>
                    <Select defaultValue="month">
                      <SelectTrigger className="w-[100px] h-9 text-sm focus:ring-0">
                        <SelectValue placeholder="View" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><GripVertical className="h-5 w-5"/></Button> {/* Placeholder for Apps */}
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth: currentViewDisplayMonth }) => {
                const isCurrentMonth = dayDate.getMonth() === currentViewDisplayMonth.getMonth();
                const isTodayDate = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth() && dayDate.getFullYear() === today.getFullYear();
                const isSelectedDate = selectedDate?.toDateString() === dayDate.toDateString();

                let dayNumberStyle = "text-xs w-6 h-6 flex items-center justify-center rounded-full relative z-10"; // Ensure number is on top
                
                if (isTodayDate) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-primary text-primary-foreground font-bold");
                } else if (isSelectedDate && isCurrentMonth) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-accent/50 ring-1 ring-primary text-primary");
                } else if (!isCurrentMonth) {
                    dayNumberStyle = cn(dayNumberStyle, "text-muted-foreground/70");
                }

                const dateKey = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                const phaseData = moonDataMap.get(dateKey);
                const moonEmoji = phaseData ? getMoonEmoji(phaseData.phaseName) : null;

                return (
                  <div className={cn(
                    "relative w-full h-full flex flex-col items-center p-1 pt-0",
                    !isCurrentMonth && "opacity-70" 
                  )}>
                    <span className={cn(dayNumberStyle, "self-end mt-1 mr-1")}>{dayDate.getDate()}</span>
                    {moonEmoji && (
                      <span className="text-3xl mt-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80"> 
                        {moonEmoji}
                      </span>
                    )}
                    {/* Placeholder for event indicators if needed later */}
                  </div>
                );
              }
            }}
          />
      {isLoadingMoonData && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <p className="text-lg p-4 bg-card rounded shadow-lg">{t('loadingMoonData') || 'Loading moon data...'}</p>
        </div>
      )}
    </div>
  );
}

// Helper for i18n if 'today' or other keys are not present yet
const translationsTemp = {
  today: { en: 'Today', de: 'Heute' },
  loadingMoonData: {en: 'Loading moon data...', de: 'Lade Monddaten...'}
};

