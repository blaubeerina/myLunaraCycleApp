
'use client';

import { useState, useEffect } from 'react';
import type { JournalEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'; // Added CardContent
import { JournalEntryList } from '@/components/journal/JournalEntryList';
import { EditJournalEntryDialog } from '@/components/journal/EditJournalEntryDialog';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from '@/hooks/use-toast';
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


// Mock Firestore interaction (replace with actual Firebase setup)
const MOCK_DB_LATENCY = 300;

async function fetchJournalEntries(userId: string): Promise<JournalEntry[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  const stored = localStorage.getItem(`journalEntries_${userId}`);
  const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
  // Ensure date objects are correctly parsed if stored as strings
  return entries.map(e => ({
    ...e,
    date: typeof e.date === 'string' ? e.date : new Date(e.date).toISOString().split('T')[0],
    lastUpdated: e.lastUpdated ? new Date(e.lastUpdated) : new Date(),
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function saveJournalEntry(userId: string, entry: JournalEntry, isNew: boolean): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  let entries = await fetchJournalEntries(userId);
  if (isNew) {
    const newEntryWithId = { ...entry, id: Date.now().toString(), userId };
    entries = [newEntryWithId, ...entries];
  } else {
    entries = entries.map(e => e.id === entry.id ? { ...entry, userId } : e);
  }
  localStorage.setItem(`journalEntries_${userId}`, JSON.stringify(entries));
}

async function deleteJournalEntryFromDb(userId: string, entryId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DB_LATENCY));
  let entries = await fetchJournalEntries(userId);
  entries = entries.filter(e => e.id !== entryId);
  localStorage.setItem(`journalEntries_${userId}`, JSON.stringify(entries));
}


export default function JournalPage() {
  const { t } = useAppContext();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingEntry, setCurrentEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);


  const userId = user?.id || 'mockUserId'; // Fallback for mock

  const loadEntries = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const fetchedEntries = await fetchJournalEntries(userId);
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast({ title: "Error loading entries", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [userId]);

  const handleOpenEditModal = (entry: JournalEntry | null) => {
    setCurrentEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentEditingEntry(null);
  };

  const handleSaveEntry = async (data: JournalEntry, isNew: boolean) => {
    const entryDataToSave = {
      ...data,
      userId: userId, // Ensure userId is set
      lastUpdated: new Date(), // Firestore serverTimestamp() would be used in real app
    };

    try {
      await saveJournalEntry(userId, entryDataToSave, isNew);
      toast({ title: t('entrySavedSuccess') });
      loadEntries(); // Re-fetch entries to update the list
      handleCloseEditModal();
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast({ title: t('entrySavedError'), variant: 'destructive' });
    }
  };

  const handleDeleteConfirmation = (entry: JournalEntry) => {
    setEntryToDelete(entry);
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    try {
      await deleteJournalEntryFromDb(userId, entryToDelete.id);
      toast({ title: t('entryDeletedSuccess') });
      loadEntries(); // Re-fetch entries
      setEntryToDelete(null); // Close dialog
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({ title: t('entryDeletedError'), variant: 'destructive' });
      setEntryToDelete(null);
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">{t('journalEntriesTitle')}</CardTitle>
            <CardDescription>{t('journalEntriesDescription')}</CardDescription>
          </div>
          <Button variant="default" onClick={() => handleOpenEditModal(null)}>
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

      {entryToDelete && (
         <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmDeleteEntryTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmDeleteEntryDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEntryToDelete(null)}>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive hover:bg-destructive/90">
                {t('deleteEntry')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
