'use client';

import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/icons/LogoIcon';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { t } = useAppContext();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LogoIcon className="h-8 w-8" />
          <h1 className="text-2xl font-bold text-primary">{t('appName')}</h1>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-background to-secondary/30">
        <div className="max-w-2xl">
          <div className="mb-8 flex justify-center">
            <LogoIcon className="h-24 w-24" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
            {t('landingTitle')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            {t('landingSubtitle')}
          </p>
          <Link href="/dashboard" passHref>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
              {t('getStarted')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} myLunaraCycle. All rights reserved.
      </footer>
    </div>
  );
}

// LanguageSwitcher needs to be defined or imported if it's specific to this page,
// otherwise ensure it's available globally or via AppContext/Header.
// For now, creating a minimal one here, assuming it would be a shared component.
function LanguageSwitcher() {
  const { userPreferences, setUserPreferences } = useAppContext();
  const toggleLanguage = () => {
    setUserPreferences(prev => ({ ...prev, language: prev.language === 'en' ? 'de' : 'en' }));
  };
  return (
    <Button variant="outline" onClick={toggleLanguage} className="rounded-full">
      {userPreferences.language === 'en' ? 'DE' : 'EN'}
    </Button>
  );
}
