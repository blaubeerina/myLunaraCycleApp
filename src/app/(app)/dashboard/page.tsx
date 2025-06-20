
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import type { GeneratedImpulse, DailyEntryData } from '@/lib/types'; 
import { format, parseISO } from 'date-fns';
import { Loader2, Sparkles, Info, CalendarDays, BookHeart, Moon, Droplet, Leaf, Sun, Activity } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { calculateFullCycleInfoForDate, type FullCycleInfo, type CyclePhaseName } from '@/lib/cycle-utils';


export default function DashboardPage() {
  const { t, userPreferences, appData, loadAppData } = useAppContext();
  const { user } = useAuth();
  const [latestImpulse, setLatestImpulse] = useState<GeneratedImpulse | null>(null);
  const [isLoadingImpulse, setIsLoadingImpulse] = useState(false); 
  
  const [currentMoon, setCurrentMoon] = useState<{ name: ReturnType<typeof getMoonPhase> | null; emoji: string | null }>({ name: 'New Moon', emoji: '🌑' }); // Demo data
  const [currentCycleDetails, setCurrentCycleDetails] = useState<FullCycleInfo | null>({
    phase: 'Follicular', // Demo data
    cycleDay: 10,
    isFertile: false,
    isOvulationDay: false,
    nextPeriodStartDate: '2025-07-15', // Demo data
    estimatedOvulationDate: parseISO('2025-07-01'), // Demo data
    estimatedFertileWindow: { start: parseISO('2025-06-28'), end: parseISO('2025-07-02') }, // Demo data
    predictedNextPeriodStart: parseISO('2025-07-15') // Demo data
  });
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(false); // Hardcoded to false for demo

  const userId = user?.id;

  useEffect(() => {
    // In Demo Mode, we use hardcoded data, so no real fetching/calculation here.
    // The initial state values serve as the demo data.
    // If you wanted to simulate a load:
    // setIsLoadingDashboardData(true);
    // const timer = setTimeout(() => {
    //   const today = new Date();
    //   const phaseName = getMoonPhase(today);
    //   setCurrentMoon({ name: phaseName, emoji: getMoonEmoji(phaseName) });
    //   if (userId && userPreferences.appMode === 'cycle') {
    //     const cycleInfo = calculateFullCycleInfoForDate(today, appData.dailyEntries);
    //     setCurrentCycleDetails(cycleInfo);
    //   } else {
    //     setCurrentCycleDetails(null);
    //   }
    //   setIsLoadingDashboardData(false);
    // }, 500); // Simulate short load
    // return () => clearTimeout(timer);
  }, [userId, userPreferences.appMode, appData.dailyEntries]); // Dependencies kept for structure but effect body is demo-fied


  const getPhaseDisplay = (phase: CyclePhaseName | undefined) => {
    if (!phase || phase === 'Unknown') return { icon: <Info className="mr-2 h-4 w-4 text-muted-foreground" />, text: t('cyclePhaseUnknown') };
    switch (phase) {
        case 'Menstruation': return { icon: <Droplet className="mr-2 h-4 w-4 text-destructive" />, text: t('cyclePhaseMenstruation') };
        case 'Follicular': return { icon: <Leaf className="mr-2 h-4 w-4 text-green-500" />, text: t('cyclePhaseFollicular') };
        case 'Ovulation': return { icon: <Sun className="mr-2 h-4 w-4 text-yellow-500" />, text: t('cyclePhaseOvulation') };
        case 'Luteal': return { icon: <Activity className="mr-2 h-4 w-4 text-purple-500" />, text: t('cyclePhaseLuteal') };
        default: return { icon: <Info className="mr-2 h-4 w-4 text-muted-foreground" />, text: t('cyclePhaseUnknown') };
    }
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            {t('dashboard')} - {userPreferences.appMode === 'cycle' ? t('cycleMode') : t('pregnancyMode')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('welcomeMessage', { name: user?.displayName || user?.email || t('user', {defaultValue: 'User'}) })} {t('tagline')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/80 hover:shadow-indigo-500/30 transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-important-text"><CalendarDays className="h-6 w-6 text-primary"/>{t('calendar')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* isLoadingDashboardData is false in demo mode, so the loading spinner won't show */}
              {/* Display mocked moon phase */}
              {currentMoon.name && (
                  <div className="flex items-center text-sm text-muted-foreground mb-1">
                      <Moon className="mr-2 h-4 w-4 text-primary" />
                      {t('currentMoonPhaseLabel', { defaultValue: 'Moon' })}: {currentMoon.emoji} {t(`moonPhase${currentMoon.name.replace(/\s/g, '')}` as any, { defaultValue: currentMoon.name })}
                  </div>
              )}
              {/* Always display mocked cycle details for the demo mock-up */}
              {currentCycleDetails && currentCycleDetails.phase !== 'Unknown' && (
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                      {getPhaseDisplay(currentCycleDetails.phase).icon}
                      {t('currentCyclePhaseLabel', { defaultValue: 'Cycle' })}: {getPhaseDisplay(currentCycleDetails.phase).text}
                      {currentCycleDetails.cycleDay && currentCycleDetails.cycleDay > 0 ? ` - ${t('dayAbbreviation', {defaultValue: 'D'})}${currentCycleDetails.cycleDay}` : ''}
                  </div>
              )}
              {/* The "log period for cycle info" prompt is commented out for a cleaner mock-up display */}
              {/*
              {userPreferences.appMode === 'cycle' && (!currentCycleDetails || currentCycleDetails.phase === 'Unknown') && !isLoadingDashboardData && (
                   <div className="flex items-center text-sm text-accent-foreground bg-accent/20 p-2 rounded-md mb-3">
                      <Info className="mr-2 h-4 w-4 shrink-0" />
                      <span>{t('logPeriodForCycleInfo', {defaultValue: 'Log period start in calendar to see cycle info.'})}</span>
                  </div>
              )}
              */}
              <p className="text-muted-foreground mb-4">{t('viewYourCycleMilestones', {defaultValue: 'View your cycle, ovulation, or pregnancy milestones.'})}</p>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Calendar placeholder" 
                width={600} 
                height={400} 
                className="rounded-md aspect-video object-cover"
                data-ai-hint="calendar schedule" 
              />
              <Link href="/calendar" passHref className="mt-4 block">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">{t('viewCalendar')}</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 hover:shadow-purple-500/30 transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-important-text"><BookHeart className="h-6 w-6 text-primary"/>{t('journal')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('journalCardDescription', {defaultValue: 'Record your daily mood and journal entries.'})}</p>
               <Image 
                src="https://placehold.co/600x400.png" 
                alt="Journal placeholder" 
                width={600} 
                height={400} 
                className="rounded-md aspect-video object-cover"
                data-ai-hint="journal diary"
              />
              <Link href="/journal" passHref className="mt-4 block">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">{t('openJournal')}</Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {userPreferences.appMode === 'cycle' && (
        <>
        {/* Removed the old Cycle specific cards that were commented out - new info is in calendar card */}
        </>
      )}

         <Card className="shadow-lg bg-card text-card-foreground">
          <CardHeader>
              <CardTitle className="text-important-text">{t('affirmationForToday')}</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-lg italic text-primary p-4 bg-primary/10 rounded-md">
                "{t('sampleAffirmation')}" 
              </p>
              <Link href="/journal#affirmation" passHref className="mt-4 block">
                  <Button variant="link" className="text-primary hover:text-primary/80">{t('generateNewAffirmation')}</Button>
              </Link>
          </CardContent>
        </Card>

    </div>
  );
}

