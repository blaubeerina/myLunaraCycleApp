
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCycleContext } from '@/contexts/CycleContext';
import { CycleCalendar } from '@/components/CycleCalendar';
import { calculateCycleDay, getEstimatedNextPeriod } from '@/lib/cycle-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format, parseISO, isValid, isToday, startOfDay } from 'date-fns';
import type { TarotCard, WisdomAffirmation, DailyWisdom } from '@/lib/types';
import { tarotCards, fallbackTarotCard } from '@/lib/tarot-data';
import { drawNewDailyCard, updateRecentCardIds, getCardById } from '@/lib/tarot-utils';
import { wisdomAffirmations } from '@/lib/affirmations-data';
import { selectNewDailyAffirmation } from '@/lib/affirmation-utils';
import { Separator } from '@/components/ui/separator';
import { Sparkles, RefreshCcw } from 'lucide-react';

const DAILY_WISDOM_STORAGE_KEY = 'lunarRhythmsDailyWisdom_v1';

const initialDailyWisdomState: DailyWisdom = {
  tarot: {
    cardId: null,
    drawDate: null,
    recentIds: [],
  },
  affirmation: {
    text: null,
    author: null,
    displayDate: null,
    previousText: null,
  },
};


export default function HomePage() {
  const { 
    lastPeriodDate, 
    lastPeriodEndDate,
    lastPeriodDuration,
    setPeriodDates, 
    isLoading: isCycleContextLoading,
    clearPeriodData
  } = useCycleContext();
  
  const [inputStartDate, setInputStartDate] = useState<string>('');
  const [inputEndDate, setInputEndDate] = useState<string>('');
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null);
  const [estimatedNextPeriod, setEstimatedNextPeriod] = useState<Date | null>(null);

  const [dailyWisdom, setDailyWisdom] = useState<DailyWisdom>(initialDailyWisdomState);
  const [currentTarotCard, setCurrentTarotCard] = useState<TarotCard>(fallbackTarotCard);
  const [currentAffirmation, setCurrentAffirmation] = useState<WisdomAffirmation | null>(null);
  const [isUiLoading, setIsUiLoading] = useState(true);

  const loadAndProcessDailyWisdom = useCallback(() => {
    let storedWisdom: DailyWisdom = initialDailyWisdomState;
    try {
      const storedData = localStorage.getItem(DAILY_WISDOM_STORAGE_KEY);
      if (storedData) {
        storedWisdom = JSON.parse(storedData) as DailyWisdom;
        // Basic validation/migration if structure changes
        if (!storedWisdom.tarot) storedWisdom.tarot = initialDailyWisdomState.tarot;
        if (!storedWisdom.affirmation) storedWisdom.affirmation = initialDailyWisdomState.affirmation;
        if (!Array.isArray(storedWisdom.tarot.recentIds)) storedWisdom.tarot.recentIds = [];

      }
    } catch (error) {
      console.error("Failed to load daily wisdom from localStorage", error);
      // storedWisdom remains initialDailyWisdomState
    }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let wisdomNeedsUpdate = false;

    // Process Tarot Card
    let newCardId = storedWisdom.tarot.cardId;
    let newRecentIds = storedWisdom.tarot.recentIds;

    if (storedWisdom.tarot.drawDate !== todayStr || !newCardId) {
      const drawnCard = drawNewDailyCard(tarotCards, storedWisdom.tarot.recentIds);
      if (drawnCard) {
        newCardId = drawnCard.id;
        newRecentIds = updateRecentCardIds(drawnCard.id, storedWisdom.tarot.recentIds);
        storedWisdom.tarot = {
          cardId: newCardId,
          drawDate: todayStr,
          recentIds: newRecentIds,
        };
        wisdomNeedsUpdate = true;
      }
    }
    setCurrentTarotCard(getCardById(newCardId));

    // Process Affirmation
    let newAffirmationText = storedWisdom.affirmation.text;
    let newAffirmationAuthor = storedWisdom.affirmation.author;

    if (storedWisdom.affirmation.displayDate !== todayStr || !newAffirmationText) {
      const affirmation = selectNewDailyAffirmation(wisdomAffirmations, storedWisdom.affirmation.previousText);
      newAffirmationText = affirmation.text;
      newAffirmationAuthor = affirmation.author;
      storedWisdom.affirmation = {
        text: newAffirmationText,
        author: newAffirmationAuthor,
        displayDate: todayStr,
        previousText: newAffirmationText, // Store current as previous for next draw
      };
      wisdomNeedsUpdate = true;
    }
    setCurrentAffirmation({ text: newAffirmationText || "", author: newAffirmationAuthor });
    
    setDailyWisdom(storedWisdom);
    if (wisdomNeedsUpdate) {
      try {
        localStorage.setItem(DAILY_WISDOM_STORAGE_KEY, JSON.stringify(storedWisdom));
      } catch (error) {
        console.error("Failed to save daily wisdom to localStorage", error);
      }
    }
  }, []);


  useEffect(() => {
    if (!isCycleContextLoading) { // Ensure cycle context is loaded before processing wisdom
      loadAndProcessDailyWisdom();
      setIsUiLoading(false);
    }
  }, [isCycleContextLoading, loadAndProcessDailyWisdom]);


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
    } else if (inputStartDate) { 
        alert("Please enter a valid start date in YYYY-MM-DD format.");
        return;
    }

    if (inputEndDate && isValid(parseISO(inputEndDate))) {
      finalEndDate = inputEndDate;
    } else if (inputEndDate) { 
        alert("Please enter a valid end date in YYYY-MM-DD format.");
        return;
    }
    
    if (finalStartDate && finalEndDate && parseISO(finalEndDate) < parseISO(finalStartDate)) {
        alert("Period end date cannot be before the start date.");
        return;
    }
    
    setPeriodDates(finalStartDate, finalEndDate);
  };
  
  const handleClearDates = () => {
    clearPeriodData();
    setInputStartDate('');
    setInputEndDate('');
  };

  const handleManualDrawNewCard = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const drawnCard = drawNewDailyCard(tarotCards, dailyWisdom.tarot.recentIds);
    if (drawnCard) {
      const newRecentIds = updateRecentCardIds(drawnCard.id, dailyWisdom.tarot.recentIds);
      const updatedTarotState = {
        cardId: drawnCard.id,
        drawDate: todayStr, // Keep draw date as today even on manual re-draw
        recentIds: newRecentIds,
      };
      const newDailyWisdom = { ...dailyWisdom, tarot: updatedTarotState };
      
      setDailyWisdom(newDailyWisdom);
      setCurrentTarotCard(drawnCard);
      try {
        localStorage.setItem(DAILY_WISDOM_STORAGE_KEY, JSON.stringify(newDailyWisdom));
      } catch (error) {
        console.error("Failed to save daily wisdom to localStorage on manual draw", error);
      }
    }
  };


  if (isCycleContextLoading || isUiLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
        <p>Loading your sacred space...</p>
        {/* You can add a spinner here if desired */}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-background text-foreground">
      <header className="w-full max-w-3xl text-center my-8">
        <h1 className="text-4xl font-semibold text-primary mb-2">Lunar Rhythms</h1>
        <p className="text-lg text-foreground/80">Track your cycle, align with the moon.</p>
      </header>

      <main className="w-full max-w-4xl space-y-12">
        <section className="p-6 bg-card rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-primary mb-4">Cycle Tracking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
            <div>
              <Label htmlFor="last-period-start-date" className="block text-md font-medium mb-2 text-foreground/90">
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
              <Label htmlFor="last-period-end-date" className="block text-md font-medium mb-2 text-foreground/90">
                End Date of Your Last Period
              </Label>
              <Input
                type="date"
                id="last-period-end-date"
                value={inputEndDate}
                onChange={handleEndDateChange}
                className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground"
                max={format(new Date(), 'yyyy-MM-dd')}
                min={inputStartDate || undefined}
                disabled={!inputStartDate}
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

        <Separator />

        <section className="p-6 bg-card rounded-lg shadow-md">
            <h2 className="text-2xl font-medium text-primary mb-6 text-center flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6"/> Affirmations & Tarot <Sparkles className="h-6 w-6"/>
            </h2>
            
            <div className="mb-8 text-center">
                <h3 className="text-lg font-semibold text-accent mb-2">✨ Today’s Wisdom:</h3>
                {currentAffirmation?.text ? (
                    <>
                        <p className="text-xl italic text-foreground/90">"{currentAffirmation.text}"</p>
                        {currentAffirmation.author && (
                            <p className="text-sm text-muted-foreground mt-1">— {currentAffirmation.author}</p>
                        )}
                    </>
                ) : (
                    <p className="text-muted-foreground">Loading wisdom...</p>
                )}
            </div>

            <div className="text-center">
                <h3 className="text-lg font-semibold text-accent mb-3">🔮 Tarot Insight:</h3>
                {currentTarotCard && currentTarotCard.id !== 'fallback' ? (
                    <div className="flex flex-col items-center gap-3">
                        <Image
                            src={currentTarotCard.image}
                            alt={currentTarotCard.title}
                            width={150}
                            height={250}
                            className="rounded-lg shadow-lg border-2 border-primary/30 object-contain"
                            data-ai-hint="tarot card"
                            unoptimized={currentTarotCard.image.startsWith('https://placehold.co')}
                        />
                        <h4 className="text-xl font-bold text-foreground mt-1">{currentTarotCard.title}</h4>
                        <p className="text-sm text-muted-foreground italic max-w-xs">"{currentTarotCard.meaning}"</p>
                        <Button onClick={handleManualDrawNewCard} variant="outline" size="sm" className="mt-2">
                           <RefreshCcw className="mr-2 h-4 w-4" /> Draw New Card
                        </Button>
                    </div>
                ) : (
                     <div className="flex flex-col items-center gap-3">
                        <Image
                            src={fallbackTarotCard.image}
                            alt={fallbackTarotCard.title}
                            width={150}
                            height={250}
                            className="rounded-lg shadow-md border-2 border-border object-contain opacity-70"
                            data-ai-hint="tarot card placeholder"
                             unoptimized
                        />
                        <h4 className="text-xl font-bold text-muted-foreground mt-1">{fallbackTarotCard.title}</h4>
                        <p className="text-sm text-muted-foreground italic max-w-xs">"{fallbackTarotCard.meaning}"</p>
                        <p className="text-xs text-muted-foreground mt-2">Ensure tarot images are in /public/cards and listed in tarot-data.ts.</p>
                         <Button onClick={handleManualDrawNewCard} variant="outline" size="sm" className="mt-2">
                           <RefreshCcw className="mr-2 h-4 w-4" /> Try to Draw Card
                        </Button>
                    </div>
                )}
            </div>
            <div className="mt-8 flex justify-center">
                 <Button onClick={() => alert('Save Reflection feature not implemented yet.')} variant="secondary">
                    Save Reflection
                </Button>
            </div>
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
