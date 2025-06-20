
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DailyEntryData, MoodEmoji } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, Loader2, Sparkles } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from '@/hooks/use-toast';
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog'; // Reusing for journal entry
import { AffirmationGenerator } from '@/components/journal/AffirmationGenerator'; // For AI affirmation
import { format, parseISO } from 'date-fns';
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

const JOURNAL_STORAGE_KEY_PREFIX = 'myLunaraCycle_dailyEntries_';

export default function JournalPage() {
  const { t, userPreferences } = useAppContext();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [currentEditingDate, setCurrentEditingDate] = useState<Date | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<DailyEntryData | null>(null);
  const [currentAffirmation, setCurrentAffirmation] = useState<string | null>(null);

  const userId = user?.id || 'mockUserId'; // Fallback for mock

  const getStorageKey = useCallback(() => `${JOURNAL_STORAGE_KEY_PREFIX}${userId}`, [userId]);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(getStorageKey());
      const allEntriesObject: Record<string, DailyEntryData> = storedData ? JSON.parse(storedData) : {};
      const entriesArray = Object.values(allEntriesObject).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      setEntries(entriesArray);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast({ title: t('entrySavedError'), variant: "destructive" }); // Using a generic error message
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey, t]);

  useEffect(() => {
    if (userId) {
      loadEntries();
    }
  }, [userId, loadEntries]);

  const handleOpenEntryModal = (date?: Date | string) => {
    setCurrentEditingDate(date ? (typeof date === 'string' ? parseISO(date) : date) : new Date());
    setIsEntryModalOpen(true);
  };

  const handleCloseEntryModal = () => {
    setIsEntryModalOpen(false);
    setCurrentEditingDate(null);
  };

  const handleSaveEntry = async (entryData: DailyEntryData) => {
    try {
      const storedData = localStorage.getItem(getStorageKey());
      const allEntriesObject: Record<string, DailyEntryData> = storedData ? JSON.parse(storedData) : {};
      allEntriesObject[entryData.date] = entryData;
      localStorage.setItem(getStorageKey(), JSON.stringify(allEntriesObject));
      
      toast({ title: t('entrySavedSuccess') });
      loadEntries(); 
      handleCloseEntryModal();
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast({ title: t('entrySavedError'), variant: 'destructive' });
    }
  };

  const handleDeleteConfirmation = (entry: DailyEntryData) => {
    setEntryToDelete(entry);
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    try {
      const storedData = localStorage.getItem(getStorageKey());
      const allEntriesObject: Record<string, DailyEntryData> = storedData ? JSON.parse(storedData) : {};
      delete allEntriesObject[entryToDelete.date];
      localStorage.setItem(getStorageKey(), JSON.stringify(allEntriesObject));

      toast({ title: t('entryDeletedSuccess') });
      loadEntries(); 
      setEntryToDelete(null); 
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({ title: t('entryDeletedError'), variant: 'destructive' });
      setEntryToDelete(null);
    }
  };

  const getInitialDataForModal = (): Partial<DailyEntryData> | undefined => {
    if (!currentEditingDate) return undefined;
    const dateStr = format(currentEditingDate, 'yyyy-MM-dd');
    return entries.find(e => e.date === dateStr);
  };
  
  const handleAffirmationGenerated = (affirmation: string) => {
    setCurrentAffirmation(affirmation);
    // Optionally save to today's journal entry if one exists or create one
    // For simplicity, just displaying it for now.
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-primary">{t('journalEntriesTitle')}</CardTitle>
            <CardDescription className="text-muted-foreground">{t('journalEntriesDescription')}</CardDescription>
          </div>
          <Button variant="default" onClick={() => handleOpenEntryModal()} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" />
            {t('addNewEntry')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">{t('loadingEntries')}</span>
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map(entry => (
                <Card key={entry.date} className="bg-card/80 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-important-text">
                        {format(parseISO(entry.date), 'PPP', { locale: userPreferences.language === 'de' ? require('date-fns/locale/de').default : require('date-fns/locale/en-US').default })}
                      </h3>
                      {entry.mood && <p className="text-2xl ">{entry.mood}</p>}
                    </div>
                    <div className="flex space-x-1">
                       <Button variant="ghost" size="icon" onClick={() => handleOpenEntryModal(entry.date)} className="text-primary hover:text-primary/80">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirmation(entry)} className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {entry.journalText && <p className="mt-2 text-sm text-card-foreground whitespace-pre-wrap">{entry.journalText}</p>}
                  {/* Display other info like symptoms, energy if available */}
                  {entry.symptoms && entry.symptoms.length > 0 && (
                     <p className="text-xs text-muted-foreground mt-1">Symptoms: {entry.symptoms.join(', ')}</p>
                  )}
                  {entry.bleedingStrength && entry.bleedingStrength !== "none" && (
                     <p className="text-xs text-muted-foreground mt-1">Bleeding: {t(`dayEntryBleedingStrength${entry.bleedingStrength.charAt(0).toUpperCase() + entry.bleedingStrength.slice(1)}` as any)}</p>
                  )}
                  {entry.affirmationGenerated && (
                    <p className="text-xs italic text-primary mt-1">Affirmation: "{entry.affirmationGenerated}"</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-muted-foreground">{t('noEntriesFound')}</p>
          )}
        </CardContent>
      </Card>

      {/* Affirmation Generator Section */}
      <Card id="affirmation" className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Sparkles className="h-6 w-6" /> {t('affirmationForToday')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Let AI craft a motivational quote based on your latest journal entry or mood.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AffirmationGenerator
            mood={entries[0]?.mood || ''} // Pass latest mood
            journalText={entries[0]?.journalText || ''} // Pass latest journal text
            onAffirmationGenerated={handleAffirmationGenerated}
          />
          {currentAffirmation && (
            <div className="mt-4 p-3 border border-primary/30 rounded-md bg-primary/5">
              <p className="text-primary italic">"{currentAffirmation}"</p>
            </div>
          )}
        </CardContent>
      </Card>


      {isEntryModalOpen && currentEditingDate && (
        <DayEntryDialog
          isOpen={isEntryModalOpen}
          onClose={handleCloseEntryModal}
          selectedDate={currentEditingDate}
          initialData={getInitialDataForModal()}
          onSaveEntry={handleSaveEntry}
          language={userPreferences.language}
          t={t}
          appMode={userPreferences.appMode}
        />
      )}

      {entryToDelete && (
         <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
          <AlertDialogContent className="bg-background text-foreground">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary">{t('confirmDeleteEntryTitle')}</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {t('confirmDeleteEntryDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEntryToDelete(null)} className="hover:bg-muted/50">{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {t('deleteEntry')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
