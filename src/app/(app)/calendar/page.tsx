'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar'; // ShadCN Calendar
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    if (userPreferences.appMode === 'cycle') {
      // Mock cycle data
      if (day.getDate() % 28 < 5) dayType = 'Period';
      else if (day.getDate() % 28 === 13 || day.getDate() % 28 === 14) dayType = 'Ovulation';
    } else {
      // Mock pregnancy data
      if (day.getDate() % 7 === 0) dayType = 'New Week';
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
          <div className="md:col-span-2 bg-[var(--lunara-calendar-bg)] p-4 rounded-lg shadow-inner">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border border-border"
              modifiersClassNames={{
                period: 'bg-destructive/20 text-destructive-foreground',
                ovulation: 'bg-ovulation-glow/30 text-yellow-900',
                newWeek: 'bg-pregnancy-growth/30 text-green-900',
              }}
              modifiers={{
                period: (d) => getDayData(d).dayType === 'Period',
                ovulation: (d) => getDayData(d).dayType === 'Ovulation',
                newWeek: (d) => getDayData(d).dayType === 'New Week',
              }}
              components={{
                DayContent: ({ date, displayMonth }) => {
                  if (date.getMonth() !== displayMonth.getMonth()) return <div className="text-muted-foreground/50">{date.getDate()}</div>;
                  const { moonPhase } = getDayData(date);
                  return (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div>{date.getDate()}</div>
                      {moonPhase && (
                        <div className="text-xs text-muted-foreground truncate" title={`${moonPhase.phaseName} (${moonPhase.illumination.toFixed(0)}%)`}>
                          {/* Basic moon emoji based on phase */}
                          {moonPhase.phaseName.includes('New') && '🌑'}
                          {moonPhase.phaseName.includes('Crescent') && '🌒'}
                          {moonPhase.phaseName.includes('Quarter') && '🌓'}
                          {moonPhase.phaseName.includes('Gibbous') && '🌔'}
                          {moonPhase.phaseName.includes('Full') && '🌕'}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-xl">Selected Day</CardTitle></CardHeader>
              <CardContent>
                {date ? (
                  <>
                    <p className="font-semibold">{date.toLocaleDateString(userPreferences.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    {getDayData(date).dayType && <p>Event: <span className="font-medium">{getDayData(date).dayType}</span></p>}
                    {getDayData(date).moonPhase && (
                       <p>Moon: <span className="font-medium">{getDayData(date).moonPhase?.phaseName} ({getDayData(date).moonPhase?.illumination.toFixed(0)}%)</span></p>
                    )}
                  </>
                ) : (
                  <p>Select a day to see details.</p>
                )}
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="text-xl">Legend</CardTitle></CardHeader>
                <CardContent className="space-y-1 text-sm">
                    {userPreferences.appMode === 'cycle' && (
                        <>
                        <p><span className="inline-block w-3 h-3 mr-2 rounded-full bg-destructive/20"></span> Period Day</p>
                        <p><span className="inline-block w-3 h-3 mr-2 rounded-full bg-ovulation-glow/30"></span> Ovulation Est.</p>
                        </>
                    )}
                    {userPreferences.appMode === 'pregnancy' && (
                        <p><span className="inline-block w-3 h-3 mr-2 rounded-full bg-pregnancy-growth/30"></span> New Pregnancy Week</p>
                    )}
                    <p className="flex items-center"><span className="mr-2">🌑🌒🌓🌔🌕</span> Moon Phases</p>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
       {isLoadingMoonData && <p>Loading moon data...</p>}
    </div>
  );
}

// Define custom CSS vars if needed, e.g. in globals.css
// --ovulation-glow: hsl(55 100% 85%);
// --pregnancy-growth: hsl(125 50% 88%);
// This is already done in globals.css
