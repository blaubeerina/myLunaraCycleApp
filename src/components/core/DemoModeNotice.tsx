
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { AlertTriangle } from 'lucide-react';

export function DemoModeNotice() {
  const { t } = useAppContext();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-destructive text-destructive-foreground text-center text-xs md:text-sm demo-mode-banner">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
        <span>{t('demoModeNotice')}</span>
      </div>
    </div>
  );
}
