
'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { JournalEntry, JournalEntryMood, FirebaseTimestamp } from '@/lib/types';
import { journalEntryMoods } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

interface EditJournalEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntry | null; // Null if creating new, object if editing
  onSave: (data: JournalEntry, isNew: boolean) => Promise<void>;
}

const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

export function EditJournalEntryDialog({ isOpen, onClose, entry, onSave }: EditJournalEntryDialogProps) {
  const { t, userPreferences } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);

  const FormSchema = z.object({
    date: z.string().refine((val) => isValid(parseISO(val)), { message: "Invalid date format. Use YYYY-MM-DD." }),
    mood: z.enum(journalEntryMoods, { required_error: "Mood is required." }),
    notes: z.string().max(1000, t('notesTooLong')).optional(),
    symptoms: z.string().optional(), // Symptoms as comma-separated string for form input
  });

  type FormValues = z.infer<typeof FormSchema>;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: entry?.date || getTodayDateString(),
      mood: entry?.mood || 'happy',
      notes: entry?.notes || '',
      symptoms: entry?.symptoms?.join(', ') || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        date: entry?.date || getTodayDateString(),
        mood: entry?.mood || 'happy',
        notes: entry?.notes || '',
        symptoms: entry?.symptoms?.join(', ') || '',
      });
    }
  }, [isOpen, entry, reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    const symptomsArray = data.symptoms ? data.symptoms.split(',').map(s => s.trim()).filter(s => s) : [];
    
    const entryData: JournalEntry = {
      id: entry?.id || new Date().getTime().toString(), // Generate new ID if creating
      date: data.date,
      mood: data.mood,
      notes: data.notes || '',
      symptoms: symptomsArray,
      lastUpdated: new Date() as FirebaseTimestamp, // Mock serverTimestamp
      userId: entry?.userId || 'mockUserId', // Maintain or add mock user ID
    };

    try {
      await onSave(entryData, !entry);
      toast({ title: t('entrySavedSuccess') });
      onClose();
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast({ title: t('entrySavedError'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const moodTranslations: Record<JournalEntryMood, string> = {
    happy: t('moodHappy'),
    sad: t('moodSad'),
    energetic: t('moodEnergetic'),
    tired: t('moodTired'),
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{entry ? t('editEntry') : t('addNewEntry')}</DialogTitle>
          <DialogDescription>
            {entry ? t('journalEntriesDescription') : t('howAreYouFeeling')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="date">{t('date')}</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => <Input type="date" id="date" {...field} className="mt-1 bg-input" />}
            />
            {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <Label htmlFor="mood">{t('mood')}</Label>
            <Controller
              name="mood"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="mood" className="mt-1 bg-input">
                    <SelectValue placeholder={t('mood')} />
                  </SelectTrigger>
                  <SelectContent>
                    {journalEntryMoods.map(moodOpt => (
                      <SelectItem key={moodOpt} value={moodOpt}>
                        {moodTranslations[moodOpt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mood && <p className="text-sm text-destructive mt-1">{errors.mood.message}</p>}
          </div>

          <div>
            <Label htmlFor="symptoms">{t('symptoms')}</Label>
            <Controller
              name="symptoms"
              control={control}
              render={({ field }) => (
                <Input
                  id="symptoms"
                  placeholder={t('symptomsPlaceholder')}
                  {...field}
                  className="mt-1 bg-input"
                />
              )}
            />
            {errors.symptoms && <p className="text-sm text-destructive mt-1">{errors.symptoms.message}</p>}
          </div>

          <div>
            <Label htmlFor="notes">{t('notes')}</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="notes"
                  placeholder={t('notesPlaceholder')}
                  rows={5}
                  {...field}
                  className="mt-1 bg-input"
                />
              )}
            />
            {errors.notes && <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? t('saving') : t('saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
