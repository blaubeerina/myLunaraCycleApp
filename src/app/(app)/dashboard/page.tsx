
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import type { GeneratedImpulse, DailyEntryData, CycleInfo } from '@/lib/types';
import { calculateCycleInfo } from '@/lib/cycle-utils';
import { format, parseISO } from 'date-fns';
import { Loader2, Sparkles, Info } from 'lucide-react';

// Mock fetch for all entries - in a real app, this would be a paginated or optimized fetch
async function fetchAllEntries(userId: string): Promise<DailyEntryData[]> {
  const storedEntries = JSON.parse(localStorage.getItem(`myLunaraCycle_entries_${userId}`) || '{}');
  return Object.values(storedEntries);
}


export default function DashboardPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth();
  const [latestImpulse, setLatestImpulse] = useState<GeneratedImpulse | null>(null);
  const [isLoadingImpulse, setIsLoadingImpulse] = useState(true);
  const [currentCycleInfo, setCurrentCycleInfo] = useState<CycleInfo | null>(null);
  const [isLoadingCycleInfo, setIsLoadingCycleInfo] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    setIsLoadingCycleInfo(true);
    try {
      const allEntries = await fetchAllEntries(user.id); // You'd implement this
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const cycleInfo = calculateCycleInfo(todayStr, allEntries);
      setCurrentCycleInfo(cycleInfo);
    } catch (error) {
      console.error("Error loading cycle info for dashboard:", error);
      setCurrentCycleInfo(null); // Or set to an error state
    } finally {
      setIsLoadingCycleInfo(false);
    }
  }, [user]);
  

  useEffect(() => {
    // Load latest impulse from localStorage
    const storedImpulse = localStorage.getItem('myLunaraCycle-latestImpulse');
    if (storedImpulse) {
      try {
        setLatestImpulse(JSON.parse(storedImpulse));
      } catch (e) {
        console.error("Error parsing stored impulse:", e);
        localStorage.removeItem('myLunaraCycle-latestImpulse');
      }
    }
    setIsLoadingImpulse(false);

    loadDashboardData(); // Load cycle info

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'myLunaraCycle-latestImpulse') {
        if (event.newValue) {
          try {
            setLatestImpulse(JSON.parse(event.newValue));
          } catch (e) { console.error("Error parsing updated stored impulse:", e); }
        } else {
          setLatestImpulse(null);
        }
      }
      // Could also listen for entry changes to reload dashboard data if needed
      if (event.key === `myLunaraCycle_entries_${user?.id}`) {
        loadDashboardData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, loadDashboardData]);

  const getCyclePhaseTranslationKey = (phase: CycleInfo['phase']): string => {
    const keyMap: Record<CycleInfo['phase'], string> = {
      Menstruation: 'cyclePhaseMenstruation',
      Follicular: 'cyclePhaseFollicular',
      Ovulation: 'cyclePhaseOvulation',
      Luteal: 'cyclePhaseLuteal',
      Premenstrual: 'cyclePhasePremenstrual',
      Unknown: 'cyclePhaseUnknown',
    };
    return keyMap[phase] || 'cyclePhaseUnknown';
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {t('dashboard')} - {userPreferences.appMode === 'cycle' ? t('cycleMode') : t('pregnancyMode')}
          </CardTitle>
          <CardDescription>
            {user?.displayName || user?.email}! {t('landingSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>{t('calendar')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">View your cycle, ovulation, or pregnancy milestones.</p>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Calendar placeholder" 
                width={600} 
                height={400} 
                className="rounded-md aspect-video object-cover"
                data-ai-hint="calendar schedule" 
              />
              <Link href="/calendar" passHref className="mt-4 block">
                <Button variant="outline" className="w-full">{t('viewCalendar')}</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>{t('journal')} &amp; {t('mood')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Record your daily mood and journal entries.</p>
               <Image 
                src="https://placehold.co/600x400.png" 
                alt="Journal placeholder" 
                width={600} 
                height={400} 
                className="rounded-md aspect-video object-cover"
                data-ai-hint="journal diary"
              />
              <Link href="/journal" passHref className="mt-4 block">
                <Button variant="outline" className="w-full">{t('openJournal')}</Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {userPreferences.appMode === 'cycle' && (
        <>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="text-primary h-6 w-6" />
                {t('currentCyclePhaseLabel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCycleInfo ? (
                 <div className="flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Loading cycle information...</span>
                </div>
            ) : currentCycleInfo && currentCycleInfo.phase !== 'Unknown' ? (
                <div>
                    <p className="text-2xl font-semibold text-primary">
                        {t(getCyclePhaseTranslationKey(currentCycleInfo.phase))}
                        {currentCycleInfo.phase !== 'Ovulation' && ` - Day ${currentCycleInfo.cycleDay}`}
                    </p>
                    {currentCycleInfo.isOvulationDay && (
                        <p className="text-sm text-accent">{t('ovulationDayLabel')}</p>
                    )}
                    {currentCycleInfo.isFertile && !currentCycleInfo.isOvulationDay && (
                         <p className="text-sm text-accent">{t('fertileWindowLabel')}</p>
                    )}
                    {currentCycleInfo.nextPeriodStartDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {t('nextPeriodPredictionLabel')}: {format(parseISO(currentCycleInfo.nextPeriodStartDate), 'PPP', {locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : require('date-fns/locale/en-US').default })}
                        </p>
                    )}
                </div>
            ) : (
                 <p className="text-muted-foreground">Log your period start in the calendar to see your cycle phase.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="text-primary h-6 w-6" /> 
                {t('dailyImpulseTitle')}
              </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingImpulse ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>{t('dailyImpulseLoading')}</span>
              </div>
            ) : latestImpulse && latestImpulse.text ? (
              <>
                <p className="text-lg italic text-primary p-4 bg-primary/10 rounded-md">
                  "{latestImpulse.text}"
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <span>Phase: {t(getCyclePhaseTranslationKey(latestImpulse.cyclePhase))} &bull; Moon: {latestImpulse.moonPhase}</span>
                  <br />
                  <span>For entry on: {new Date(latestImpulse.date + 'T00:00:00').toLocaleDateString(userPreferences.language, { month: 'long', day: 'numeric' })}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground p-4 bg-muted/50 rounded-md">
                {t('dailyImpulseUnavailable')}
              </p>
            )}
            <Link href="/calendar" passHref className="mt-4 block">
                <Button variant="link" className="text-primary">{t('viewCalendar')}</Button>
            </Link>
          </CardContent>
        </Card>
        </>
      )}

      {userPreferences.appMode !== 'cycle' && (
         <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>{t('affirmationForToday')}</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-lg italic text-primary p-4 bg-primary/10 rounded-md">
                "{t('sampleAffirmation')}"
              </p>
              <Link href="/journal#affirmation" passHref className="mt-4 block">
                  <Button variant="link" className="text-primary">{t('generateNewAffirmation')}</Button>
              </Link>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
