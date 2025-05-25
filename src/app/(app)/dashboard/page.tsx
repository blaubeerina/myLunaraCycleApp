
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { GeneratedImpulse } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react'; // Added Sparkles

export default function DashboardPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth();
  const [latestImpulse, setLatestImpulse] = useState<GeneratedImpulse | null>(null);
  const [isLoadingImpulse, setIsLoadingImpulse] = useState(true);

  useEffect(() => {
    // Load latest impulse from localStorage
    const storedImpulse = localStorage.getItem('myLunaraCycle-latestImpulse');
    if (storedImpulse) {
      try {
        setLatestImpulse(JSON.parse(storedImpulse));
      } catch (e) {
        console.error("Error parsing stored impulse:", e);
        localStorage.removeItem('myLunaraCycle-latestImpulse'); // Clear corrupted data
      }
    }
    setIsLoadingImpulse(false);

    // Optional: Listen for storage changes to update impulse live if changed in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'myLunaraCycle-latestImpulse' && event.newValue) {
        try {
          setLatestImpulse(JSON.parse(event.newValue));
        } catch (e) {
          console.error("Error parsing updated stored impulse:", e);
        }
      } else if (event.key === 'myLunaraCycle-latestImpulse' && !event.newValue) {
        setLatestImpulse(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {t('dashboard')} - {userPreferences.appMode === 'cycle' ? t('cycleMode') : t('pregnancyMode')}
          </CardTitle>
          <CardDescription>
            Welcome back, {user?.displayName || user?.email}! Here's your personalized overview.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <Card className="bg-secondary/30">
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
                <Button variant="outline" className="w-full">{t('viewCalendar') || 'View Calendar'}</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-secondary/30">
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
                <Button variant="outline" className="w-full">{t('openJournal') || 'Open Journal'}</Button>
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {userPreferences.appMode === 'cycle' && (
        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                  <span>Phase: {t(`cyclePhase${latestImpulse.cyclePhase}` as any) || latestImpulse.cyclePhase} &bull; Moon: {latestImpulse.moonPhase}</span>
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
      )}

      {/* Keep the original affirmation card if it's meant for general affirmations from the journal page, or remove if daily impulse replaces it entirely */}
      {userPreferences.appMode !== 'cycle' && ( // Show original affirmation card if not in cycle mode or if you want both
         <Card className="shadow-lg">
          <CardHeader>
              <CardTitle>{t('affirmationForToday')}</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-lg italic text-primary p-4 bg-primary/10 rounded-md">
                "{t('sampleAffirmation') || 'This is a placeholder for your daily affirmation. Go to Journal to generate one!'}"
              </p>
              <Link href="/journal#affirmation" passHref className="mt-4 block">
                  <Button variant="link" className="text-primary">{t('generateNewAffirmation') || 'Generate New Affirmation'}</Button>
              </Link>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
