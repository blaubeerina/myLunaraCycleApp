
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import type { GeneratedImpulse, DailyEntryData } from '@/lib/types'; 
import { format, parseISO, addDays } from 'date-fns';
import { Loader2, Sparkles, Info, CalendarDays, BookHeart, Moon, Droplet, Leaf, Sun, Activity } from 'lucide-react';
import { getMoonPhase, getMoonEmoji } from '@/lib/moon-utils';
import { 
  calculateFullCycleInfoForDate, 
  type FullCycleInfo, 
  type CyclePhaseName,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
  getPredictedOvulationDate,
  getPredictedFertileWindow
} from '@/lib/cycle-utils';


export default function DashboardPage() {
  const { t, userPreferences, appData, loadAppData } = useAppContext();
  const { user } = useAuth();
  const [latestImpulse, setLatestImpulse] = useState<GeneratedImpulse | null>(null);
  const [isLoadingImpulse, setIsLoadingImpulse] = useState(false); 
  
  // Mock data for New Moon
  const [currentMoon, setCurrentMoon] = useState<{ name: ReturnType<typeof getMoonPhase> | null; emoji: string | null }>({ name: 'New Moon', emoji: '🌑' }); 

  // Mock data for Day 1 Menstruation
  const today = new Date();
  const mockNextPeriodStart = addDays(today, DEFAULT_CYCLE_LENGTH);
  const mockOvulationDateBasedOnToday = addDays(today, (DEFAULT_CYCLE_LENGTH - DEFAULT_PERIOD_LENGTH - 14)); // Approx. ovulation
  const mockFertileWindowBasedOnToday = getPredictedFertileWindow(mockOvulationDateBasedOnToday);


  const [currentCycleDetails, setCurrentCycleDetails] = useState<FullCycleInfo | null>({
    phase: 'Menstruation', 
    cycleDay: 1,
    isFertile: false,
    isOvulationDay: false,
    nextPeriodStartDate: format(mockNextPeriodStart, 'yyyy-MM-dd'), 
    estimatedOvulationDate: mockOvulationDateBasedOnToday, 
    estimatedFertileWindow: mockFertileWindowBasedOnToday, 
    predictedNextPeriodStart: mockNextPeriodStart 
  });
  const [isLoadingDashboardData, setIsLoadingDashboardData] = useState(false); // Hardcoded to false for demo

  const userId = user?.id;

  useEffect(() => {
    // In Demo Mode, we use hardcoded data, so no real fetching/calculation here.
    // The initial state values serve as the demo data.
  }, [userId, userPreferences.appMode, appData.dailyEntries]);


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
              <p className="text-xs text-muted-foreground mb-1">19.06.2025</p>
              <p className="text-sm text-foreground italic bg-muted/30 p-3 rounded-md mb-4">
                "{t('mockJournalEntrySnippet')}"
              </p>
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
