
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function PaymentNotice() {
  const { t } = useAppContext();

  const features = [
    t('paymentNoticeFeature1'),
    t('paymentNoticeFeature2'),
    t('paymentNoticeFeature3'),
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      <Card className="bg-card text-card-foreground shadow-xl border border-primary/40 max-w-xs w-[calc(100vw-2rem)] sm:w-auto">
        <CardHeader className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div>
              <CardTitle className="text-lg font-bold text-primary">
                {t('paymentNoticeTitle')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('paymentNoticePriceInfo', { price: '€3,33' })}
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
            className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-not-allowed"
            disabled
            onClick={() => alert(t('paymentDemoAlert'))}
          >
            {t('paymentNoticeButtonDemo')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
