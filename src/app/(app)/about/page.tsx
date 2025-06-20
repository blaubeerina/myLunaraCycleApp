
'use client';

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AboutPage() {
  const { t } = useAppContext();

  const featuresList = [
    { key: 'Feature1', textKey: 'about_new_feature1' },
    { key: 'Feature2', textKey: 'about_new_feature2' },
    { key: 'Feature3', textKey: 'about_new_feature3' },
    { key: 'Feature4', textKey: 'about_new_feature4' },
    { key: 'Feature5', textKey: 'about_new_feature5' },
    { key: 'Feature6', textKey: 'about_new_feature6' },
  ];

  const tipsList = [
    { key: 'Tip1', textKey: 'about_new_tip1' },
    { key: 'Tip2', textKey: 'about_new_tip2' },
    { key: 'Tip3', textKey: 'about_new_tip3' },
    { key: 'Tip4', textKey: 'about_new_tip4' },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <Info className="mr-3 h-8 w-8" />
            {t('about_new_welcomeTitle')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('about_new_welcomeSubtitle1')}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-card text-card-foreground">
        <CardContent className="space-y-4 text-base text-foreground/90 pt-6">
          <p>
            {t('about_new_introP1')}
          </p>
          
          <h3 className="text-lg font-semibold text-primary pt-3">
            {t('about_new_featuresTitle')}
          </h3>
          <ul className="list-disc space-y-2 pl-5">
            {featuresList.map((feature) => (
              <li key={feature.key}>{t(feature.textKey)}</li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold text-primary pt-3">
            {t('about_new_tipsTitle')}
          </h3>
          <ul className="list-disc space-y-2 pl-5">
            {tipsList.map((tip) => (
              <li key={tip.key}>{t(tip.textKey)}</li>
            ))}
          </ul>

          <p className="pt-3">
            {t('about_new_growthMessage')}
          </p>
          <p className="pt-2">
            {t('about_new_closingMessage')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
