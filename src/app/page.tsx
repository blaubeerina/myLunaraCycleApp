
'use client';

import React, { useState, useEffect } from 'react';
import { useCycleContext } from '@/contexts/CycleContext';
import { CycleCalendar } from '@/components/CycleCalendar';
import { calculateCycleDay, getEstimatedNextPeriod } from '@/lib/cycle-utils';
import { Input } from '@/components/ui/input'; // Assuming Input is styled by theme
import { Button } from '@/components/ui/button'; // Assuming Button is styled by theme
import { Label } from '@/components/ui/label';
import { format, parseISO, isValid } from 'date-fns';

export default function HomePage() {
  const { lastPeriodDate, setLastPeriodDate, isLoading } = useCycleContext();
  const [inputDate, setInputDate] = useState<string>('');
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null);
  const [estimatedNextPeriod, setEstimatedNextPeriod] = useState<Date | null>(null);

  useEffect(() => {
    if (lastPeriodDate) {
      setInputDate(lastPeriodDate);
      const today = new Date();
      setCurrentCycleDay(calculateCycleDay(lastPeriodDate, today));
      setEstimatedNextPeriod(getEstimatedNextPeriod(lastPeriodDate));
    } else {
        setInputDate(''); // Clear input if context has no date
        setCurrentCycleDay(null);
        setEstimatedNextPeriod(null);
    }
  }, [lastPeriodDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDate(event.target.value);
  };

  const handleSaveDate = () => {
    if (inputDate && isValid(parseISO(inputDate))) {
      setLastPeriodDate(inputDate);
    } else {
      // Basic error feedback, could use a toast
      alert("Please enter a valid date in YYYY-MM-DD format.");
    }
  };
  
  const handleClearDate = () => {
    setLastPeriodDate(null);
    setInputDate('');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
        <p>Loading your sacred space...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl text-center my-8">
        <h1 className="text-4xl font-semibold text-primary mb-2">Lunar Rhythms</h1>
        <p className="text-lg text-foreground/80">Track your cycle, align with the moon.</p>
      </header>

      <main className="w-full max-w-4xl">
        <section className="mb-8 p-6 bg-card rounded-lg shadow-md">
          <Label htmlFor="last-period-date" className="block text-md font-medium mb-2 text-primary">
            Date of Your Last Period
          </Label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Input
              type="date"
              id="last-period-date"
              value={inputDate}
              onChange={handleDateChange}
              className="w-full sm:w-auto flex-grow bg-input border-border text-foreground placeholder:text-muted-foreground"
              max={format(new Date(), 'yyyy-MM-dd')} // Prevent future dates
            />
            <Button onClick={handleSaveDate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Date
            </Button>
            {lastPeriodDate && (
                 <Button onClick={handleClearDate} variant="outline" className="w-full sm:w-auto">
                    Clear & Reset Cycle
                </Button>
            )}
          </div>
          {lastPeriodDate && currentCycleDay && (
            <p className="mt-4 text-center text-lg">
              You are on <strong className="text-accent">Cycle Day {currentCycleDay}</strong> of an estimated 28-day cycle.
            </p>
          )}
           {estimatedNextPeriod && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Next estimated period around: {format(estimatedNextPeriod, 'MMMM do, yyyy')}.
            </p>
          )}
          {!lastPeriodDate && (
            <p className="mt-4 text-center text-muted-foreground">
              Enter your last period date to begin tracking your cycle.
            </p>
          )}
        </section>

        <CycleCalendar lastPeriodDate={lastPeriodDate} />
      </main>

      <footer className="w-full max-w-3xl text-center my-12 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Lunar Rhythms. Embrace your flow.</p>
      </footer>
    </div>
  );
}
