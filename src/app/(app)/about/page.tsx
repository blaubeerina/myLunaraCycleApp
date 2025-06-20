
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AboutPage() {
  const { t } = useAppContext();

  const features = [
    { key: 'Feature1', text: t('aboutAppExplanationFeature1') },
    { key: 'Feature2', text: t('aboutAppExplanationFeature2') },
    { key: 'Feature3', text: t('aboutAppExplanationFeature3') },
    { key: 'Feature4', text: t('aboutAppExplanationFeature4') },
    { key: 'Feature5', text: t('aboutAppExplanationFeature5') },
    { key: 'Feature6', text: t('aboutAppExplanationFeature6') },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <Info className="mr-3 h-8 w-8" />
            {t('aboutAppTitle')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('aboutAppDescription')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-xl text-important-text">{t('aboutAppExplanationTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-base text-foreground/90">
          <p>
            {t('aboutAppExplanationP1')}
          </p>
          <h3 className="text-lg font-semibold text-primary pt-2">{t('aboutAppExplanationP2')}</h3>
          <ul className="list-disc space-y-2 pl-5">
            {features.map((feature) => (
              <li key={feature.key}>{feature.text}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
