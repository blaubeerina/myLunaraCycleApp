
'use client';

import { Lock } from 'lucide-react'; // Using Lucide
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext'; // For translations
import { Button } from '@/components/ui/button'; // Shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Shadcn Card

export default function PaymentNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useAppContext(); // Get translator

  // Show after delay to avoid layout conflicts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000); // 1-second delay
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs once on mount

  if (!isVisible) return null;

  const features = [
    t('paymentNoticeFeature1'), // "Unbegrenzte Einträge"
    t('paymentNoticeFeature2Updated'), // New key for "Persönliche Mondanalysen"
    t('paymentNoticeFeature3'), // "Premium-Support"
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden animate-fade-in">
      <Card className="bg-card text-card-foreground shadow-xl border border-primary/40 max-w-xs w-[calc(100vw-2rem)] sm:w-auto">
        <CardHeader className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <CardTitle className="text-lg font-bold text-primary">
                {t('paymentNoticeTitleUpdated')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {/* Price is hardcoded in translation string as it's static */}
                {t('paymentNoticePriceInfoUpdated', { price: '3,33€' })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="list-disc pl-5 text-sm text-card-foreground space-y-1">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <Button
            className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={() => {
              console.log("Payment flow would initiate here");
              alert(t('paymentNoticeAlertUpdated'));
            }}
          >
            {t('paymentNoticeButtonUpdated')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
