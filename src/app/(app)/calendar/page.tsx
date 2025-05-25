
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar'; // ShadCN Calendar
import { Button, buttonVariants } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Modifier } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Mock NASA API data structure (currently not used for display to match GCal image)
interface MoonPhaseData {
  phaseName: string;
  illumination: number; // percentage
  date: string; // YYYY-MM-DD
}

// Mock function to simulate fetching NASA moon data
async function fetchMoonDataForMonth(year: number, month: number): Promise<MoonPhaseData[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); 
  const daysInMonth = new Date(year, month, 0).getDate();
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  return Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    phaseName: phases[Math.floor(i / (daysInMonth / 8)) % 8],
    illumination: Math.abs( (i / (daysInMonth/2)) -1 ) * 100 
  }));
}


export default function CalendarPage() {
  const { t, userPreferences } = useAppContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [moonData, setMoonData] = useState<MoonPhaseData[]>([]); // Moon data not displayed
  // const [isLoadingMoonData, setIsLoadingMoonData] = useState(false); // Loading message removed

  // useEffect(() => { // Moon data fetching kept if needed later, but not displayed
  //   const loadMoonData = async () => {
  //     // setIsLoadingMoonData(true);
  //     const year = currentMonth.getFullYear();
  //     const month = currentMonth.getMonth() + 1; 
  //     const data = await fetchMoonDataForMonth(year, month);
  //     // setMoonData(data);
  //     // setIsLoadingMoonData(false);
  //   };
  //   loadMoonData();
  // }, [currentMonth]);

  const formatWeekdayName = (weekday: Date, options: { locale?: Locale }) => {
    const language = userPreferences.language === 'de' ? 'de-DE' : 'en-US';
    // GCal uses single letter for some languages, but two letters (MO, TU) is common
    let shortName = weekday.toLocaleDateString(language, { weekday: 'short' });
    return shortName.substring(0, 2).toUpperCase();
  };
  
  const today = new Date();
  const todayModifier: Modifier = { date: today, disabled: false };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    setDate(today);
  };

  return (
    <div className="space-y-0"> {/* Reduced space if any */}
      <Card className="shadow-none border-0 bg-transparent"> {/* Card as a transparent container */}
        <CardHeader className="p-0 mb-0 md:p-0 flex flex-row items-center justify-between">
           {/* Header content moved into Calendar's caption for GCal look */}
        </CardHeader>
        <CardContent className="p-0 sm:p-0 md:p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="w-full"
            formatters={{ formatWeekdayName }}
            modifiers={{ today: todayModifier }}
            // ModifiersClassNames removed as styling is handled in DayContent
            classNames={{
              months: "flex flex-col sm:flex-row", // Removed space-y-0 as month handles padding
              month: "space-y-4 p-0", // Month itself has padding adjusted below
              
              caption_layout: 'flex items-center justify-between py-2 px-1 md:px-2 relative', // New class for caption overall layout
              caption: "flex items-center gap-2", // For the left part: today, nav
              caption_label: "text-lg font-semibold text-foreground text-center flex-grow", // Centered label
              
              nav_container: "flex items-center gap-1", // Container for nav buttons

              nav_button: cn(
                buttonVariants({ variant: "ghost" }), // Ghost like GCal
                "h-9 w-9 p-0 hover:bg-accent/50"
              ),
              nav_button_previous: "", // Positioning handled by layout
              nav_button_next: "",

              table: "w-full border-collapse mt-2", // Added margin-top
              head_row: "flex border-b border-border", // Weekday headers row
              head_cell: "text-muted-foreground font-normal text-[0.70rem] w-full h-7 flex items-center justify-center uppercase border-r border-border last:border-r-0 pt-1", // Adjusted style for GCal look

              row: "flex w-full border-b border-border last:border-b-0 min-h-[6rem] md:min-h-[7rem]",  // Ensure rows have min height
              cell: cn(
                "w-full text-sm p-0 relative border-r border-border last:border-r-0 text-right",
                "focus-within:relative focus-within:z-10" 
              ),
              day: cn( // The button inside the cell
                buttonVariants({ variant: "ghost" }),
                "h-full w-full p-1 font-normal flex flex-col items-end justify-start focus:z-10 rounded-none items-stretch text-right" // Align content top-right
              ),
              day_selected: "", // Handled in DayContent for specific number styling
              day_today: "", // Handled in DayContent
              day_outside: "text-muted-foreground/60", // Muted text for outside days
              day_disabled: "text-muted-foreground opacity-40 pointer-events-none",
              day_hidden: "invisible",
            }}
            components={{
              Caption: ({ displayMonth }) => (
                <div className="flex items-center justify-between py-3 px-2 md:px-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleTodayClick} className="text-sm h-8">
                      {t('today') || 'Today'} 
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() -1, 1))}>
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Previous Month</span>
                     </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next Month</span>
                    </Button>
                  </div>
                  <h2 className="text-xl font-medium text-foreground">
                    {displayMonth.toLocaleDateString(userPreferences.language, { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                    {/* Placeholder for GCal right-side controls like Search, Settings, View toggles */}
                    {/* <Button variant="ghost" size="icon"><Search className="h-5 w-5"/></Button> */}
                    {/* <Button variant="ghost" size="icon"><Settings className="h-5 w-5"/></Button> */}
                  </div>
                </div>
              ),
              DayContent: ({ date: dayDate, displayMonth }) => {
                const isCurrentMonth = dayDate.getMonth() === displayMonth.getMonth();
                const isToday = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth() && dayDate.getFullYear() === today.getFullYear();
                const isSelected = date?.toDateString() === dayDate.toDateString();

                let dayNumberStyle = "text-xs w-6 h-6 flex items-center justify-center rounded-full";
                if (isToday) {
                  dayNumberStyle = cn(dayNumberStyle, "bg-primary text-primary-foreground font-bold");
                } else if (isSelected && isCurrentMonth) {
                  dayNumberStyle = cn(dayNumberStyle, "ring-1 ring-primary text-primary");
                } else if (!isCurrentMonth) {
                    dayNumberStyle = cn(dayNumberStyle, "text-muted-foreground/70");
                }


                return (
                  <div className={cn(
                    "relative w-full h-full flex flex-col items-end p-1", // Cell content container
                    !isCurrentMonth && "opacity-60" // Fade non-current month days
                  )}>
                    <span className={dayNumberStyle}>
                      {dayDate.getDate()}
                    </span>
                    {/* Event indicators or other content would go here */}
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>
      {/* isLoadingMoonData message removed */}
    </div>
  );
}

// Helper for i18n if 'today' key is not present yet
const translationsTemp = {
  today: { en: 'Today', de: 'Heute' },
};
