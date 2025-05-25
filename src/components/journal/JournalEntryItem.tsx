
'use client';

import type { JournalEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAppContext } from '@/contexts/AppContext';

interface JournalEntryItemProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
}

export function JournalEntryItem({ entry, onEdit, onDelete }: JournalEntryItemProps) {
  const { t, userPreferences } = useAppContext();

  const formattedDate = format(parseISO(entry.date), 'PPP', {
    locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : require('date-fns/locale/en-US').default
  });

  const moodTranslations: Record<JournalEntry['mood'], string> = {
    happy: t('moodHappy'),
    sad: t('moodSad'),
    energetic: t('moodEnergetic'),
    tired: t('moodTired'),
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 bg-card">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-xl">{moodTranslations[entry.mood]}</CardTitle>
          <CardDescription>{formattedDate}</CardDescription>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(entry)} aria-label={t('editEntry')}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(entry.id)} aria-label={t('deleteEntry')} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entry.notes && (
          <p className="text-sm text-foreground/90 mb-3 whitespace-pre-wrap break-words">
            {entry.notes.length > 150 ? `${entry.notes.substring(0, 150)}...` : entry.notes}
          </p>
        )}
        {entry.symptoms && entry.symptoms.length > 0 && (
          <div className="space-x-1 space-y-1">
            <span className="text-xs font-medium text-muted-foreground">{t('symptoms')}:</span>
            {entry.symptoms.map(symptom => (
              <Badge key={symptom} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                {symptom}
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Last updated: {format(entry.lastUpdated, 'Pp', { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : require('date-fns/locale/en-US').default })}
        </p>
      </CardContent>
    </Card>
  );
}
