
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DailyEntryData, MoodEmoji } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit3, Trash2, Loader2, Sparkles, Droplet } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from '@/hooks/use-toast';
import { DayEntryDialog } from '@/components/calendar/DayEntryDialog'; // Reusing for journal entry
import { AffirmationGenerator } from '@/components/journal/AffirmationGenerator'; // For AI affirmation
import { format, parseISO } from 'date-fns';
import { getMoonEmoji } from '@/lib/moon-utils';
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
  const { t, userPreferences, appData, saveDailyEntry, loadAppData } = useAppContext(); // Added appData, saveDailyEntry, loadAppData
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [currentEditingDate, setCurrentEditingDate] = useState<Date | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<DailyEntryData | null>(null);
  const [currentAffirmation, setCurrentAffirmation] = useState<string | null>(null);

  const userId = user?.id;

  const loadEntriesFromAppContext = useCallback(() => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const allEntriesObject = appData.dailyEntries;
      const entriesArray = Object.values(allEntriesObject)
        .filter(entry => entry.mood || entry.notes || entry.journalText) // Ensure it's a journal-like entry
        .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
      setEntries(entriesArray);
    } catch (error) {
      console.error("Error processing entries from AppContext:", error);
      toast({ title: t('entrySavedError'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [userId, appData.dailyEntries, t]);


  useEffect(() => {
    if (userId) {
      loadAppData(userId).then(() => {
        // Data is loaded, now filter and set entries
        // This effect will run again when appData.dailyEntries changes if it's in dependency array
      });
    }
  }, [userId, loadAppData]);

  useEffect(() => {
    // This effect reacts to changes in appData.dailyEntries (e.g., after loadAppData completes or an entry is saved)
    if (userId && Object.keys(appData.dailyEntries).length > 0) {
      loadEntriesFromAppContext();
    } else if (userId) {
      // If appData is loaded but empty, or initial load.
      setIsLoading(false);
      setEntries([]);
    }
  }, [userId, appData.dailyEntries, loadEntriesFromAppContext]);


  const handleOpenEntryModal = (date?: Date | string) => {
    setCurrentEditingDate(date ? (typeof date === 'string' ? parseISO(date) : date) : new Date());
    setIsEntryModalOpen(true);
  };

  const handleCloseEntryModal = () => {
    setIsEntryModalOpen(false);
    setCurrentEditingDate(null);
  };

  const handleSaveEntry = async (entryData: DailyEntryData) => {
    if (!userId) {
      toast({ title: t('entrySavedError'), description: "User not found.", variant: 'destructive' });
      return;
    }
    try {
      await saveDailyEntry(userId, entryData); // Use AppContext to save
      toast({ title: t('entrySavedSuccess') });
      // loadEntriesFromAppContext will be triggered by AppContext's appData update
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
    if (!entryToDelete || !userId) return;
    try {
      // To delete, we save an entry with its journal-specific fields cleared,
      // or if no other data exists for that day, we could remove it entirely.
      // For simplicity, let's just clear journal fields.
      // A more robust delete would involve checking if other data (like bleeding) exists.
      const updatedEntry = { ...entryToDelete, mood: undefined, notes: undefined, journalText: undefined, affirmationGenerated: undefined };
      
      // If the entry has no other relevant data (e.g. bleeding, period markers) it could be fully removed
      // This part depends on how "deletion" is defined: just journal part or whole day entry
      // For now, we'll just update it via saveDailyEntry which will clear its journal aspects
      // but keep other data like bleeding if it was logged via calendar.
      // A true "delete" from the dailyEntries map would require a new AppContext function.
      // Let's assume for now deleting a journal entry just clears its text/mood.

      const newAppDataEntries = { ...appData.dailyEntries };
      // If we want to fully remove the entry IF it only contains journal data:
      const currentEntryForDate = appData.dailyEntries[entryToDelete.date];
      if (currentEntryForDate && !currentEntryForDate.bleeding && !currentEntryForDate.isPeriodStart && !currentEntryForDate.isPeriodEnd /* add other checks if necessary */) {
        delete newAppDataEntries[entryToDelete.date];
         // Need a direct way to set appData or a new delete function in AppContext
         // For now, this local manipulation won't persist correctly without calling a dedicated delete in context
         // Let's revert to "clearing" the journal part via saveDailyEntry
      }

      await saveDailyEntry(userId, updatedEntry); // This will update or overwrite the entry

      toast({ title: t('entryDeletedSuccess') });
      setEntryToDelete(null);
      // loadEntriesFromAppContext will re-filter
    } catch (error) {
      console.error("Failed to delete entry:", error);
      toast({ title: t('entryDeletedError'), variant: 'destructive' });
      setEntryToDelete(null);
    }
  };


  const getInitialDataForModal = (): Partial<DailyEntryData> | undefined => {
    if (!currentEditingDate || !userId) return undefined;
    const dateStr = format(currentEditingDate, 'yyyy-MM-dd');
    return appData.dailyEntries[dateStr]; // Get initial data from AppContext
  };
  
  const handleAffirmationGenerated = (affirmation: string) => {
    setCurrentAffirmation(affirmation);
    // Optionally save to today's journal entry if one exists or create one
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
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                        {entry.moonPhaseName && (
                          <span className="flex items-center" title={t(`moonPhase${entry.moonPhaseName.replace(/\s/g, '')}` as any, {defaultValue: entry.moonPhaseName})}>
                            {getMoonEmoji(entry.moonPhaseName)} 
                            <span className="ml-1">{t(`moonPhase${entry.moonPhaseName.replace(/\s/g, '')}` as any, {defaultValue: entry.moonPhaseName})}</span>
                          </span>
                        )}
                        {entry.bleeding && entry.bleeding.intensity !== "none" && (
                          <span className="flex items-center" title={t('bleedingLogged')}>
                            <Droplet className="h-4 w-4 text-destructive/80 mr-1" /> 
                            {t(`dayEntryBleedingStrength${entry.bleeding.intensity.charAt(0).toUpperCase() + entry.bleeding.intensity.slice(1)}` as any, {defaultValue: entry.bleeding.intensity})}
                          </span>
                        )}
                      </div>
                      {entry.mood && <p className="text-2xl mt-1">{entry.mood}</p>}
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
                  {(entry.notes || entry.journalText) && <p className="mt-2 text-sm text-card-foreground whitespace-pre-wrap">{entry.notes || entry.journalText}</p>}
                  
                  {entry.bleeding?.symptoms && entry.bleeding.symptoms.length > 0 && (
                     <p className="text-xs text-muted-foreground mt-1">Symptoms: {entry.bleeding.symptoms.join(', ')}</p>
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
            mood={entries[0]?.mood || ''} 
            journalText={entries[0]?.notes || entries[0]?.journalText || ''} 
            onAffirmationGenerated={handleAffirmationGenerated}
          />
          {currentAffirmation && (
            <div className="mt-4 p-3 border border-primary/30 rounded-md bg-primary/5">
              <p className="text-primary italic">"{currentAffirmation}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEntryModalOpen && currentEditingDate && userId && (
        <DayEntryDialog
          isOpen={isEntryModalOpen}
          onClose={handleCloseEntryModal}
          selectedDate={currentEditingDate}
          initialData={getInitialDataForModal()}
          onSaveEntry={handleSaveEntry}
          language={userPreferences.language}
          t={t}
          appMode={userPreferences.appMode}
          currentMoonPhase={appData.dailyEntries[format(currentEditingDate, 'yyyy-MM-dd')]?.moonPhaseName} // Pass moon phase for the selected date
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

    