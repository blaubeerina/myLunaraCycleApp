'use client';

import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth();

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

    </div>
  );
}
