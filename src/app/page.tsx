
'use client';

import React, { useState, useEffect } from 'react';
import { useCycleContext } from '@/contexts/CycleContext';
import { CycleCalendar } from '@/components/CycleCalendar';
import { calculateCycleDay, getEstimatedNextPeriod } from '@/lib/cycle-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';

export default function HomePage() {
  const { 
    lastPeriodDate, 
    lastPeriodEndDate,
    lastPeriodDuration,
    setPeriodDates, 
    isLoading,
    clearPeriodData
  } = useCycleContext();
  
  const [inputStartDate, setInputStartDate] = useState<string>('');
  const [inputEndDate, setInputEndDate] = useState<string>('');
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null);
  const [estimatedNextPeriod, setEstimatedNextPeriod] = useState<Date | null>(null);

  useEffect(() => {
    if (lastPeriodDate) {
      setInputStartDate(lastPeriodDate);
      const today = new Date();
      setCurrentCycleDay(calculateCycleDay(lastPeriodDate, today));
      setEstimatedNextPeriod(getEstimatedNextPeriod(lastPeriodDate));
    } else {
      setInputStartDate('');
      setCurrentCycleDay(null);
      setEstimatedNextPeriod(null);
    }
    if (lastPeriodEndDate) {
      setInputEndDate(lastPeriodEndDate);
    } else {
      setInputEndDate('');
    }
  }, [lastPeriodDate, lastPeriodEndDate]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputEndDate(event.target.value);
  };

  const handleSaveDates = () => {
    let finalStartDate: string | null = null;
    let finalEndDate: string | null = null;

    if (inputStartDate && isValid(parseISO(inputStartDate))) {
      finalStartDate = inputStartDate;
    } else if (inputStartDate) { // if input is not empty but invalid
        alert("Please enter a valid start date in YYYY-MM-DD format.");
        return;
    }


    if (inputEndDate && isValid(parseISO(inputEndDate))) {
      finalEndDate = inputEndDate;
    } else if (inputEndDate) { // if input is not empty but invalid
        alert("Please enter a valid end date in YYYY-MM-DD format.");
        return;
    }
    
    if (finalStartDate && finalEndDate && parseISO(finalEndDate) < parseISO(finalStartDate)) {
        alert("Period end date cannot be before the start date.");
        return;
    }
    
    // If only start date is provided, save it and keep/clear end date based on context logic
    // If both are provided (or cleared), update context.
    setPeriodDates(finalStartDate, finalEndDate);
  };
  
  const handleClearDates = () => {
    clearPeriodData();
    setInputStartDate('');
    setInputEndDate('');
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <div>
              <Label htmlFor="last-period-start-date" className="block text-md font-medium mb-2 text-primary">
                Start Date of Your Last Period
              </Label>
              <Input
                type="date"
                id="last-period-start-date"
                value={inputStartDate}
                onChange={handleStartDateChange}
                className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div>
              <Label htmlFor="last-period-end-date" className="block text-md font-medium mb-2 text-primary">
                End Date of Your Last Period
              </Label>
              <Input
                type="date"
                id="last-period-end-date"
                value={inputEndDate}
                onChange={handleEndDateChange}
                className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                max={format(new Date(), 'yyyy-MM-dd')}
                min={inputStartDate || undefined} // End date cannot be before start date
                disabled={!inputStartDate} // Disable if no start date
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Button onClick={handleSaveDates} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Dates
            </Button>
            {(lastPeriodDate || lastPeriodEndDate) && (
                 <Button onClick={handleClearDates} variant="outline" className="w-full sm:w-auto">
                    Clear & Reset Cycle Data
                </Button>
            )}
          </div>
          
          {lastPeriodDate && currentCycleDay && (
            <p className="mt-4 text-center text-lg">
              You are on <strong className="text-accent">Cycle Day {currentCycleDay}</strong> of an estimated 28-day cycle.
            </p>
          )}
          {lastPeriodDuration !== null && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Your last period lasted <strong className="text-accent">{lastPeriodDuration}</strong> days.
            </p>
          )}
           {estimatedNextPeriod && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Next estimated period around: {format(estimatedNextPeriod, 'MMMM do, yyyy')}.
            </p>
          )}
          {!lastPeriodDate && (
            <p className="mt-4 text-center text-muted-foreground">
              Enter your last period start date to begin tracking your cycle.
            </p>
          )}
        </section>

        <CycleCalendar 
          lastPeriodStartDate={lastPeriodDate} 
          lastPeriodEndDate={lastPeriodEndDate} 
        />
      </main>

      <footer className="w-full max-w-3xl text-center my-12 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Lunar Rhythms. Embrace your flow.</p>
      </footer>
    </div>
  );
}
