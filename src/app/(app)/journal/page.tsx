
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { JournalEntry } from '@/lib/types';
import { JournalEntryList } from '@/components/journal/JournalEntryList';
import { EditJournalEntryDialog } from '@/components/journal/EditJournalEntryDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, parseISO, compareDesc } from 'date-fns';

// Mock Firestore interactions
const MOCK_DB_LATENCY = 300;

async function fetchJournalEntriesFromFirestore(userId: string): Promise<JournalEntry[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Fetching entries for user ${userId}`);
  const storedEntries = JSON.parse(localStorage.getItem(`myLunaraCycle_journal_${userId}`) || '[]');
  // Ensure dates are JS Date objects for sorting and display
  return storedEntries.map((e: any) => ({
    ...e,
    date: e.date, // Keep as string for form binding
    lastUpdated: parseISO(e.lastUpdated), // Convert to Date object
  })).sort((a: JournalEntry, b: JournalEntry) => compareDesc(parseISO(a.date), parseISO(b.date)));
}

async function saveJournalEntryToFirestore(userId: string, entry: JournalEntry, isNew: boolean): Promise<JournalEntry> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] ${isNew ? 'Adding new' : 'Updating'} entry for user ${userId}:`, entry.id);
  let entries = await fetchJournalEntriesFromFirestore(userId);
  if (isNew) {
    entries = [{ ...entry, lastUpdated: entry.lastUpdated.toISOString() as any }, ...entries];
  } else {
    entries = entries.map(e => (e.id === entry.id ? { ...entry, lastUpdated: entry.lastUpdated.toISOString() as any } : e));
  }
  localStorage.setItem(`myLunaraCycle_journal_${userId}`, JSON.stringify(entries));
  return { ...entry, lastUpdated: entry.lastUpdated }; // Return with Date object
}

async function deleteJournalEntryFromFirestore(userId: string, entryId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  console.log(`[Mock Firestore] Deleting entry ${entryId} for user ${userId}`);
  let entries = await fetchJournalEntriesFromFirestore(userId);
  entries = entries.filter(e => e.id !== entryId);
  localStorage.setItem(`myLunaraCycle_journal_${userId}`, JSON.stringify(entries.map(e => ({...e, lastUpdated: e.lastUpdated.toISOString()}))));
}


export default function JournalPage() {
  const { t } = useAppContext();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingEntry, setCurrentEditingEntry] = useState<JournalEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDeleteId, setEntryToDeleteId] = useState<string | null>(null);


  const loadEntries = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const fetchedEntries = await fetchJournalEntriesFromFirestore(user.id);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast({ title: "Error", description: "Could not load journal entries.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleOpenEditModal = (entry: JournalEntry | null) => {
    setCurrentEditingEntry(entry); // null for new entry, object for editing
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditingEntry(null);
  };

  const handleSaveEntry = async (data: JournalEntry, isNew: boolean) => {
    if (!user) return;
    // The data.lastUpdated is already a Date object from the form
    const savedEntry = await saveJournalEntryToFirestore(user.id, data, isNew);
    
    // Update local state correctly
    if (isNew) {
      setEntries(prev => [savedEntry, ...prev].sort((a,b) => compareDesc(parseISO(a.date), parseISO(b.date))));
    } else {
      setEntries(prev => prev.map(e => e.id === savedEntry.id ? savedEntry : e).sort((a,b) => compareDesc(parseISO(a.date), parseISO(b.date))));
    }
  };

  const handleDeleteConfirmation = (entryId: string) => {
    setEntryToDeleteId(entryId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteEntry = async () => {
    if (!user || !entryToDeleteId) return;
    try {
      await deleteJournalEntryFromFirestore(user.id, entryToDeleteId);
      setEntries(prev => prev.filter(e => e.id !== entryToDeleteId));
      toast({ title: t('entryDeletedSuccess') });
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({ title: t('entryDeletedError'), variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setEntryToDeleteId(null);
    }
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-3xl font-bold">{t('journalEntriesTitle')}</CardTitle>
            <CardDescription>{t('journalEntriesDescription')}</CardDescription>
          </div>
          <Button onClick={() => handleOpenEditModal(null)} variant="outline">
            <PlusCircle className="mr-2 h-5 w-5" />
            {t('addNewEntry')}
          </Button>
        </CardHeader>
        <CardContent>
          <JournalEntryList
            entries={entries}
            onEditEntry={handleOpenEditModal}
            onDeleteEntry={handleDeleteConfirmation}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {isEditModalOpen && (
        <EditJournalEntryDialog
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          entry={currentEditingEntry}
          onSave={handleSaveEntry}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteEntryTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteEntryDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntry} className={Button({variant: "destructive"}).className}>
              {t('deleteEntry')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
