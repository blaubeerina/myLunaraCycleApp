
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar'; // ShadCN Calendar
import { buttonVariants } from '@/components/ui/button'; // For nav button styling
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Mock NASA API data structure
interface MoonPhaseData {
  phaseName: string;
  illumination: number; // percentage
  date: string; // YYYY-MM-DD
}

// Mock function to simulate fetching NASA moon data
async function fetchMoonDataForMonth(year: number, month: number): Promise<MoonPhaseData[]> {
  // In a real app, this would call NASA API or a backend service
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
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
    // Mock cycle/pregnancy data - in a real app, this would come from user data
    const dayOfMonth = day.getDate();
    if (userPreferences.appMode === 'cycle') {
      if (dayOfMonth >= 1 && dayOfMonth <= 5) dayType = 'Period'; // Example: Period days 1-5
      else if (dayOfMonth === 14 || dayOfMonth === 15) dayType = 'Ovulation'; // Example: Ovulation around day 14-15
    } else {
      // Example: Assuming pregnancy starts on the 1st of a reference month for simplicity
      // This logic would need to be based on actual pregnancy start date
      const weekOfPregnancy = Math.floor(dayOfMonth / 7) + 1; // Simplistic week calculation
      if (dayOfMonth % 7 === 1) dayType = `New Week (${weekOfPregnancy})`;
    }
    return { moonPhase, dayType };
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{t('calendar')}</CardTitle>
          <CardDescription>
            {userPreferences.appMode === 'cycle' 
              ? 'Track your menstrual cycle, fertile windows, and moon phases.'
              : 'Follow your pregnancy journey week by week, with moon phase insights.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2"> {/* Removed bg, padding, shadow from here */}
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md" // Main calendar container styling removed, relies on classNames
              classNames={{
                months: "flex flex-col sm:flex-row space-y-0",
                month: "space-y-2 p-0",
                caption: "flex justify-center pt-1 relative items-center text-xl font-semibold text-foreground mb-4",
                caption_label: "text-xl font-semibold", // Kept for explicitness if needed
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  buttonVariants({ variant: "outline" }),
                  "h-9 w-9 bg-transparent p-0 hover:opacity-100 border-border", // Custom GCal-like nav buttons
                  "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none"
                ),
                nav_button_previous: "absolute left-2 top-1/2 -translate-y-1/2 transform",
                nav_button_next: "absolute right-2 top-1/2 -translate-y-1/2 transform",
                table: "w-full border-collapse border border-border", // Grid table
                head_row: "flex border-b border-border bg-muted/20",
                head_cell: "text-muted-foreground font-normal text-xs w-full h-8 flex items-center justify-center uppercase", // Day names (Mon, Tue)
                row: "flex w-full", // Week row
                cell: cn( // Day cell
                  "h-28 w-full border border-border text-sm p-0 relative overflow-hidden", // Taller cells, border
                  "focus-within:relative focus-within:z-10" 
                ),
                day: cn( // Button inside cell
                  buttonVariants({ variant: "ghost" }),
                  "h-full w-full p-0 font-normal flex items-start justify-start focus:z-10 rounded-none" 
                ),
                day_selected: "bg-primary/80 text-primary-foreground hover:bg-primary/90 focus:bg-primary/90",
                day_today: "bg-accent/20 text-accent-foreground font-semibold border border-primary",
                day_outside: "day-outside text-muted-foreground/40",
                day_disabled: "text-muted-foreground opacity-40 pointer-events-none",
                day_hidden: "invisible",
              }}
              components={{
                DayContent: ({ date: dayDate, displayMonth }) => {
                  if (dayDate.getMonth() !== displayMonth.getMonth()) {
                    return <div className="w-full h-full p-1 text-right text-muted-foreground/30">{dayDate.getDate()}</div>;
                  }
                  const { moonPhase, dayType } = getDayData(dayDate);
                  const isToday = new Date().toDateString() === dayDate.toDateString(); // Simple today check

                  return (
                    <div className={cn(
                      "relative w-full h-full flex flex-col items-start justify-start p-1",
                    )}>
                      <div className={cn(
                        "self-end text-xs w-6 h-6 flex items-center justify-center rounded-full",
                        isToday && !date?.getTime() === dayDate.getTime() && "bg-primary text-primary-foreground", // Highlight for today if not selected
                         date?.getTime() === dayDate.getTime() && "bg-primary text-primary-foreground" // Highlight for selected
                      )}>
                        {dayDate.getDate()}
                      </div>
                      
                      <div className="mt-auto w-full space-y-0.5 pb-1">
                        {dayType && (
                          <div
                            className={cn(
                              "h-1.5 w-auto mx-0.5 rounded-sm text-[8px] leading-none flex items-center justify-center text-white overflow-hidden",
                              dayType.includes('Period') && 'bg-destructive',
                              dayType.includes('Ovulation') && 'bg-[hsl(var(--lunara-ovulation-glow))] !text-black',
                              dayType.includes('New Week') && 'bg-[hsl(var(--lunara-pregnancy-growth))] !text-black'
                            )}
                            title={dayType}
                          >
                           <span className="px-1">{dayType}</span> {/* Show type text */}
                          </div>
                        )}
                        {moonPhase && (
                          <div className="text-center text-[10px] text-muted-foreground/70" title={`${moonPhase.phaseName} (${moonPhase.illumination.toFixed(0)}%)`}>
                            {moonPhase.phaseName.includes('New') && '🌑'}
                            {moonPhase.phaseName.includes('Crescent') && '🌒'}
                            {moonPhase.phaseName.includes('Quarter') && '🌓'}
                            {moonPhase.phaseName.includes('Gibbous') && '🌔'}
                            {moonPhase.phaseName.includes('Full') && '🌕'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              }}
            />
          </div>
          <div className="space-y-6"> {/* Simplified right panel container */}
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Selected Day</h3>
              <div className="p-4 border border-border rounded-md bg-card">
                {date ? (
                  <>
                    <p className="font-semibold text-card-foreground">{date.toLocaleDateString(userPreferences.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {getDayData(date).dayType && <p className="text-sm text-muted-foreground">Event: <span className="font-medium text-card-foreground">{getDayData(date).dayType}</span></p>}
                    {getDayData(date).moonPhase && (
                       <p className="text-sm text-muted-foreground">Moon: <span className="font-medium text-card-foreground">{getDayData(date).moonPhase?.phaseName} ({getDayData(date).moonPhase?.illumination.toFixed(0)}%)</span></p>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Select a day to see details.</p>
                )}
              </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Legend</h3>
                <div className="p-4 border border-border rounded-md bg-card space-y-2 text-sm">
                    {userPreferences.appMode === 'cycle' && (
                        <>
                        <p className="flex items-center"><span className="inline-block w-3 h-3 mr-2 rounded-sm bg-destructive"></span> Period Day</p>
                        <p className="flex items-center"><span className="inline-block w-3 h-3 mr-2 rounded-sm bg-[hsl(var(--lunara-ovulation-glow))]"></span> Ovulation Est.</p>
                        </>
                    )}
                    {userPreferences.appMode === 'pregnancy' && (
                        <p className="flex items-center"><span className="inline-block w-3 h-3 mr-2 rounded-sm bg-[hsl(var(--lunara-pregnancy-growth))]"></span> New Pregnancy Week</p>
                    )}
                    <p className="flex items-center"><span className="mr-2">🌑🌒🌓🌔🌕</span> Moon Phases</p>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
       {isLoadingMoonData && <p className="p-4 text-center text-muted-foreground">Loading moon data...</p>}
    </div>
  );
}
