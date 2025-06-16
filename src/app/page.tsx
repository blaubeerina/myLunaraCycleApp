
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useCycleContext } from '@/contexts/CycleContext';
import { CycleCalendar } from '@/components/CycleCalendar';
import { PeriodLogDialog } from '@/components/PeriodLogDialog';
import { calculateCycleDay } from '@/lib/cycle-utils';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { format, parseISO, isValid, isToday } from 'date-fns'; // isToday is used
import type { TarotCard, WisdomAffirmation, DailyWisdom, PeriodLogEntry } from '@/lib/types';
import { tarotCards, fallbackTarotCard } from '@/lib/tarot-data';
import { drawNewDailyCard, updateRecentCardIds, getCardById } from '@/lib/tarot-utils';
import { wisdomAffirmations } from '@/lib/affirmations-data';
import { selectNewDailyAffirmation } from '@/lib/affirmation-utils';
import { Droplet, Sparkles, RefreshCcw, BookOpen, Edit3, FileText, Moon } from 'lucide-react';

const DAILY_WISDOM_STORAGE_KEY = 'lunarRhythmsDailyWisdom_v1'; 

const initialDailyWisdomState: DailyWisdom = {
  tarot: { cardId: null, drawDate: null, recentIds: [] },
  affirmation: { text: null, author: null, displayDate: null, previousText: null },
};

export default function HomePage() {
  const {
    lastPeriodDate,
    lastPeriodEndDate,
    lastPeriodDuration,
    setPeriodDates,
    isLoading: isCycleContextLoading,
    clearPeriodData,
    periodLogs,
    addPeriodLog,
    getPeriodLog,
    hasSufficientDataForDisplay, // Get the new flag
  } = useCycleContext();

  const [inputStartDate, setInputStartDate] = useState<string>('');
  const [inputEndDate, setInputEndDate] = useState<string>('');
  const [currentCycleDay, setCurrentCycleDay] = useState<number | null>(null);
  
  const [dailyWisdom, setDailyWisdom] = useState<DailyWisdom>(initialDailyWisdomState);
  const [currentTarotCard, setCurrentTarotCard] = useState<TarotCard>(fallbackTarotCard);
  const [currentAffirmation, setCurrentAffirmation] = useState<WisdomAffirmation | null>(null);
  const [isUiLoading, setIsUiLoading] = useState(true);

  const [isPeriodLogDialogOpen, setIsPeriodLogDialogOpen] = useState(false);
  const [selectedDateForLog, setSelectedDateForLog] = useState<Date | null>(null);

  const [todayMoonPhaseName, setTodayMoonPhaseName] = useState<string>('');
  const [todayMoonEmoji, setTodayMoonEmoji] = useState<string>('');


  useEffect(() => {
    const today = new Date();
    setTodayMoonPhaseName(getMoonPhase(today));
    setTodayMoonEmoji(getMoonEmoji(getMoonPhase(today)));
  }, []);

  const loadAndProcessDailyWisdom = useCallback(() => {
    let storedWisdom: DailyWisdom = initialDailyWisdomState;
    try {
      const storedData = localStorage.getItem(DAILY_WISDOM_STORAGE_KEY);
      if (storedData) {
        storedWisdom = JSON.parse(storedData) as DailyWisdom;
        if (!storedWisdom.tarot) storedWisdom.tarot = initialDailyWisdomState.tarot;
        if (!storedWisdom.affirmation) storedWisdom.affirmation = initialDailyWisdomState.affirmation;
        if (!Array.isArray(storedWisdom.tarot.recentIds)) storedWisdom.tarot.recentIds = [];
      }
    } catch (error) { console.error("Failed to load daily wisdom", error); }

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let wisdomNeedsUpdate = false;

    let newCardId = storedWisdom.tarot.cardId;
    if (storedWisdom.tarot.drawDate !== todayStr || !newCardId) {
      const drawnCard = drawNewDailyCard(tarotCards, storedWisdom.tarot.recentIds);
      if (drawnCard) {
        newCardId = drawnCard.id;
        storedWisdom.tarot = {
          cardId: newCardId,
          drawDate: todayStr,
          recentIds: updateRecentCardIds(drawnCard.id, storedWisdom.tarot.recentIds),
        };
        wisdomNeedsUpdate = true;
      }
    }
    setCurrentTarotCard(getCardById(newCardId));

    let newAffirmationText = storedWisdom.affirmation.text;
    let newAffirmationAuthor = storedWisdom.affirmation.author;
    if (storedWisdom.affirmation.displayDate !== todayStr || !newAffirmationText) {
      const affirmation = selectNewDailyAffirmation(wisdomAffirmations, storedWisdom.affirmation.previousText);
      newAffirmationText = affirmation.text;
      newAffirmationAuthor = affirmation.author;
      storedWisdom.affirmation = {
        text: newAffirmationText, author: newAffirmationAuthor,
        displayDate: todayStr, previousText: newAffirmationText,
      };
      wisdomNeedsUpdate = true;
    }
    setCurrentAffirmation({ text: newAffirmationText || "", author: newAffirmationAuthor });

    setDailyWisdom(storedWisdom);
    if (wisdomNeedsUpdate) {
      localStorage.setItem(DAILY_WISDOM_STORAGE_KEY, JSON.stringify(storedWisdom));
    }
  }, []);

  useEffect(() => {
    if (!isCycleContextLoading) {
      loadAndProcessDailyWisdom();
      setIsUiLoading(false);
    }
  }, [isCycleContextLoading, loadAndProcessDailyWisdom]);

  useEffect(() => {
    const today = new Date();
    if (lastPeriodDate) {
      setInputStartDate(lastPeriodDate);
      setCurrentCycleDay(calculateCycleDay(lastPeriodDate, today));
    } else {
      setInputStartDate('');
      setCurrentCycleDay(null);
    }
    setInputEndDate(lastPeriodEndDate || '');
  }, [lastPeriodDate, lastPeriodEndDate]);

  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputStartDate(event.target.value);
  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => setInputEndDate(event.target.value);

  const handleSaveDates = () => {
    let finalStartDate: string | null = null;
    if (inputStartDate && isValid(parseISO(inputStartDate))) finalStartDate = inputStartDate;
    else if (inputStartDate) { alert("Invalid start date. Use YYYY-MM-DD."); return; }

    let finalEndDate: string | null = null;
    if (inputEndDate && isValid(parseISO(inputEndDate))) finalEndDate = inputEndDate;
    else if (inputEndDate) { alert("Invalid end date. Use YYYY-MM-DD."); return; }
    
    if (finalStartDate && finalEndDate && parseISO(finalEndDate) < parseISO(finalStartDate)) {
      alert("Period end date cannot be before start date."); return;
    }
    setPeriodDates(finalStartDate, finalEndDate);
  };

  const handleClearDates = () => {
    clearPeriodData();
    setInputStartDate('');
    setInputEndDate('');
  };

  const handleManualWisdomRefresh = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const drawnCard = drawNewDailyCard(tarotCards, dailyWisdom.tarot.recentIds);
    let newCardId = dailyWisdom.tarot.cardId;
    let newRecentIds = dailyWisdom.tarot.recentIds;
    if (drawnCard) {
      newCardId = drawnCard.id;
      newRecentIds = updateRecentCardIds(drawnCard.id, dailyWisdom.tarot.recentIds);
    }
    setCurrentTarotCard(getCardById(newCardId));

    const affirmation = selectNewDailyAffirmation(wisdomAffirmations, dailyWisdom.affirmation.text);
    setCurrentAffirmation(affirmation);
    
    const newDailyWisdomData: DailyWisdom = {
        tarot: { cardId: newCardId, drawDate: todayStr, recentIds: newRecentIds },
        affirmation: { text: affirmation.text, author: affirmation.author, displayDate: todayStr, previousText: affirmation.text }
    };
    setDailyWisdom(newDailyWisdomData);
    localStorage.setItem(DAILY_WISDOM_STORAGE_KEY, JSON.stringify(newDailyWisdomData));
  };

  const handleDayClickCalendar = (date: Date) => {
    setSelectedDateForLog(date);
    setIsPeriodLogDialogOpen(true);
  };

  const handleSavePeriodLog = (logEntry: PeriodLogEntry) => {
    addPeriodLog(logEntry);
    setIsPeriodLogDialogOpen(false);
  };

  const sortedPeriodLogs = Object.values(periodLogs).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  if (isCycleContextLoading || isUiLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background text-foreground">
        <Moon className="h-12 w-12 animate-pulse text-primary mb-4" />
        <p className="text-lg">Loading your sacred cosmic space...</p>
      </div>
    );
  }

  const displayStartDateShort = lastPeriodDate ? format(parseISO(lastPeriodDate), 'dd.MM') : '--.--';
  const displayEndDateShort = lastPeriodEndDate ? format(parseISO(lastPeriodEndDate), 'dd.MM') : '--.--';
  const displayDurationText = lastPeriodDuration ? `(${lastPeriodDuration} days)` : '';
  const displayCycleDayText = currentCycleDay ? `Day ${currentCycleDay}/28` : 'Day --/28';

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6 bg-background text-foreground">
      <header className="w-full max-w-3xl mx-auto text-center my-4 md:my-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary mb-1 tracking-tight">Lunar Rhythms</h1>
        <p className="text-sm md:text-md text-foreground/80">Track your cycle, align with the cosmos.</p>
      </header>
      
      <section className="w-full max-w-xl mx-auto p-4 bg-card/50 rounded-lg shadow-md mb-6">
        <div className='mb-3 text-center'>
            <h2 className="text-md font-medium text-foreground/90 flex items-center justify-center space-x-2">
              <span className="text-xl" style={{color: 'hsl(var(--color-moon))'}}>{todayMoonEmoji}</span>
              <span className="capitalize">{todayMoonPhaseName} Cycle</span>
              <span className={currentCycleDay ? 'text-[hsl(var(--calendar-today-text))] font-semibold' : 'text-foreground/80'}>
                {displayCycleDayText}
              </span>
            </h2>
            <div className="text-xs text-foreground/80 space-x-1.5 flex justify-center items-center flex-wrap mt-1">
                <span className="text-md text-[hsl(var(--primary))]">🩸</span> 
                <span className="text-foreground/90">{displayStartDateShort}</span> 
                {lastPeriodDate && lastPeriodEndDate && <span className="text-foreground/70">&rarr;</span>}
                {lastPeriodDate && lastPeriodEndDate && <span className="text-foreground/90">{displayEndDateShort}</span>}
                {displayDurationText && <span className="text-xs text-foreground/70 ml-0.5">{displayDurationText}</span>}
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label htmlFor="last-period-start-date" className="text-xs font-medium text-foreground/80">
              Last Period Start
            </Label>
            <Input
              type="date" id="last-period-start-date" value={inputStartDate} onChange={handleStartDateChange}
              className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground mt-1 text-sm h-9 rounded-sm"
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div>
            <Label htmlFor="last-period-end-date" className="text-xs font-medium text-foreground/80">
              Last Period End (Optional)
            </Label>
            <Input
              type="date" id="last-period-end-date" value={inputEndDate} onChange={handleEndDateChange}
              className="w-full bg-input border-border text-foreground placeholder:text-muted-foreground mt-1 text-sm h-9 rounded-sm"
              max={format(new Date(), 'yyyy-MM-dd')} min={inputStartDate || undefined} disabled={!inputStartDate}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Button onClick={handleSaveDates} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-sm rounded-sm">
              Save Period Dates
            </Button>
            {(lastPeriodDate || lastPeriodEndDate) && (
                 <Button onClick={handleClearDates} variant="outline" className="w-full sm:w-auto h-9 text-sm rounded-sm text-muted-foreground hover:text-foreground">
                    Clear Dates
                </Button>
            )}
        </div>
         {!lastPeriodDate && <p className="text-center text-xs text-muted-foreground mt-3">Enter your last period start date to see cycle stats and log bleeding days.</p>}
      </section>
      <Separator className="my-5 md:my-6 max-w-3xl mx-auto bg-border/30" />

      <section className="w-full max-w-2xl mx-auto mb-6">
        <CycleCalendar 
          onDayClick={handleDayClickCalendar}
          hasSufficientDataForDisplay={hasSufficientDataForDisplay} // Pass the flag
        />
      </section>

      {selectedDateForLog && (
        <PeriodLogDialog
          isOpen={isPeriodLogDialogOpen}
          onClose={() => setIsPeriodLogDialogOpen(false)}
          selectedDate={selectedDateForLog}
          onSaveLog={handleSavePeriodLog}
          initialLogData={getPeriodLog(format(selectedDateForLog, 'yyyy-MM-dd'))}
        />
      )}
      
      <Separator className="my-5 md:my-6 max-w-3xl mx-auto bg-border/30" />
      <section className="w-full max-w-2xl mx-auto">
        <Tabs defaultValue="daily-wisdom" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/30 rounded-md border border-border/50">
            <TabsTrigger value="cycle-logs" className="rounded-sm data-[state=active]:bg-card/70 data-[state=active]:shadow-sm"><BookOpen className="inline h-4 w-4 mr-1.5"/>Cycle Logs</TabsTrigger>
            <TabsTrigger value="daily-wisdom" className="rounded-sm data-[state=active]:bg-card/70 data-[state=active]:shadow-sm"><Sparkles className="inline h-4 w-4 mr-1.5"/>Daily Wisdom</TabsTrigger>
          </TabsList>
          <TabsContent value="cycle-logs" className="p-4 bg-card/50 rounded-b-md shadow-lg min-h-[200px] mt-2 border border-border/50">
            <h3 className="text-lg font-medium text-primary mb-3">Past Cycle Logs</h3>
            {sortedPeriodLogs.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedPeriodLogs.map(log => (
                  <li key={log.date} className="p-3 bg-background/50 rounded-sm shadow-sm border border-border/70">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm text-foreground/90">{format(parseISO(log.date), 'EEE, dd MMM yyyy')}</span>
                      <div className="flex items-center space-x-2">
                        {log.intensity !== 'none' && <span className="text-xs text-[hsl(var(--calendar-bleeding-indicator))]">● Bleeding Logged</span>}
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-secondary hover:text-secondary/80" onClick={() => {setSelectedDateForLog(parseISO(log.date)); setIsPeriodLogDialogOpen(true);}}>
                            <Edit3 className="h-3 w-3 mr-1"/> Edit
                        </Button>
                      </div>
                    </div>
                    {log.intensity !== 'none' && <p className="text-xs text-muted-foreground capitalize">Intensity: {log.intensity}</p>}
                    {log.symptoms && log.symptoms.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">Symptoms: {log.symptoms.join(', ')}</p>
                    )}
                    {log.notes && <p className="text-sm mt-1 italic text-foreground/80">"{log.notes}"</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No period logs recorded yet. Click a day on the calendar to add a log.</p>
            )}
          </TabsContent>
          <TabsContent value="daily-wisdom" className="p-4 md:p-6 bg-card/50 rounded-b-md shadow-lg min-h-[200px] mt-2 border border-border/50">
            <div className="text-center mb-5">
              <h3 className="text-md font-semibold text-accent mb-2">✨ Today’s Reflection:</h3>
              {currentAffirmation?.text ? (
                <>
                  <p className="text-lg italic text-foreground/90">"{currentAffirmation.text}"</p>
                  {currentAffirmation.author && (
                    <p className="text-xs text-muted-foreground mt-1">— {currentAffirmation.author}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Loading wisdom...</p>
              )}
            </div>

            <Separator className="my-4 bg-border/30" />

            <div className="text-center">
              <h3 className="text-md font-semibold text-accent mb-3">🔮 Tarot Insight:</h3>
              {currentTarotCard && currentTarotCard.id !== 'fallback' ? (
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src={currentTarotCard.image} alt={currentTarotCard.title} width={100} height={170}
                    className="rounded-md shadow-lg border-2 border-primary/30 object-contain"
                    data-ai-hint="tarot card"
                    unoptimized={currentTarotCard.image.startsWith('https://placehold.co')}
                  />
                  <h4 className="text-lg font-bold text-foreground mt-1">{currentTarotCard.title}</h4>
                  <p className="text-xs text-muted-foreground italic max-w-xs">"{currentTarotCard.meaning}"</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src={fallbackTarotCard.image} alt={fallbackTarotCard.title} width={100} height={170}
                    className="rounded-md shadow-md border-2 border-border object-contain opacity-70"
                    data-ai-hint="tarot card placeholder" unoptimized
                  />
                  <h4 className="text-lg font-bold text-muted-foreground mt-1">{fallbackTarotCard.title}</h4>
                  <p className="text-xs text-muted-foreground italic max-w-xs">"{fallbackTarotCard.meaning}"</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
              <Button onClick={handleManualWisdomRefresh} variant="outline" size="sm" className="rounded-sm text-muted-foreground hover:text-foreground">
                <RefreshCcw className="mr-2 h-4 w-4" /> New Wisdom
              </Button>
              <Button onClick={() => alert('Save to Journal feature not implemented yet.')} variant="secondary" size="sm" className="rounded-sm">
                <FileText className="mr-2 h-4 w-4" /> Save to Journal
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <footer className="w-full max-w-3xl mx-auto text-center my-8 md:my-10 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Lunar Rhythms. Embrace your flow.</p>
      </footer>
    </div>
  );
}
