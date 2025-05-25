
'use client';

import type { JournalEntry } from '@/lib/types';
import { JournalEntryItem } from './JournalEntryItem';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

interface JournalEntryListProps {
  entries: JournalEntry[];
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  isLoading: boolean;
}

export function JournalEntryList({ entries, onEditEntry, onDeleteEntry, isLoading }: JournalEntryListProps) {
  const { t } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>{t('loadingEntries')}</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>{t('noEntriesFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map(entry => (
        <JournalEntryItem
          key={entry.id}
          entry={entry}
          onEdit={onEditEntry}
          onDelete={onDeleteEntry}
        />
      ))}
    </div>
  );
}
