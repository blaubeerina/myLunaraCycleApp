
'use client';

import type { DailyEntryData, Language, BleedingIntensity, AppMode, MoodEmoji, MoonPhaseName, SymptomKey } from '@/lib/types';
import { SYMPTOMS_LIST } from '@/lib/types';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { MoodSelector } from './MoodSelector';
import { getMoonEmoji } from '@/lib/moon-utils'; // To display moon emoji

interface DayEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: Partial<DailyEntryData>;
  onSaveEntry: (entry: DailyEntryData) => void;
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  appMode: AppMode;
  currentMoonPhase?: MoonPhaseName;
}

const moodOptions: { emoji: MoodEmoji; labelKey: string }[] = [
  { emoji: '😊', labelKey: 'moodSelectorHappy' }, { emoji: '😢', labelKey: 'moodSelectorSad' },
  { emoji: '😠', labelKey: 'moodSelectorAngry' }, { emoji: '😌', labelKey: 'moodSelectorCalm' },
  { emoji: '😴', labelKey: 'moodSelectorTired' }, { emoji: '🤩', labelKey: 'moodSelectorExcited' },
  { emoji: '😕', labelKey: 'moodSelectorConfused' }, { emoji: '😟', labelKey: 'moodSelectorWorried'}
];

const bleedingIntensityOptions: (BleedingIntensity | 'spotting')[] = ['spotting', 'light', 'medium', 'heavy'];

export function DayEntryDialog({
  isOpen,
  onClose,
  selectedDate,
  initialData,
  onSaveEntry,
  language,
  t,
  appMode,
  currentMoonPhase,
}: DayEntryDialogProps) {
  const [mood, setMood] = useState<MoodEmoji>(initialData?.mood || '');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [logBleeding, setLogBleeding] = useState<boolean>(!!initialData?.bleeding && initialData.bleeding.intensity !== 'none');
  const [intensity, setIntensity] = useState<BleedingIntensity | 'spotting'>(
    initialData?.bleeding?.intensity && initialData.bleeding.intensity !== 'none' ? initialData.bleeding.intensity : 'light'
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialData?.bleeding?.symptoms || []);
  const [isPeriodStart, setIsPeriodStart] = useState<boolean>(initialData?.isPeriodStart || false);
  const [isPeriodEnd, setIsPeriodEnd] = useState<boolean>(initialData?.isPeriodEnd || false);

  useEffect(() => {
    if (isOpen) {
      setMood(initialData?.mood || '');
      setNotes(initialData?.notes || '');
      const initialBleedingData = initialData?.bleeding;
      const hasInitialBleeding = !!initialBleedingData && initialBleedingData.intensity !== 'none';
      setLogBleeding(hasInitialBleeding);
      setIntensity(initialBleedingData?.intensity && initialBleedingData.intensity !== 'none' ? initialBleedingData.intensity : 'light');
      setSelectedSymptoms(initialBleedingData?.symptoms || []);
      setIsPeriodStart(initialData?.isPeriodStart || false);
      setIsPeriodEnd(initialData?.isPeriodEnd || false);
    }
  }, [isOpen, initialData]);

  const handleSymptomChange = (symptomKey: SymptomKey, checked: boolean) => {
    const symptomLabel = t(`symptom${symptomKey.charAt(0).toUpperCase() + symptomKey.slice(1)}` as any) || symptomKey;
    setSelectedSymptoms(prev =>
      checked ? [...prev, symptomLabel] : prev.filter(s => s !== symptomLabel)
    );
  };

  const handleSave = () => {
    const entryData: DailyEntryData = {
      date: selectedDate.toISOString().split('T')[0],
      mood: mood || undefined, // Ensure empty string becomes undefined
      notes: notes || undefined,
      bleeding: logBleeding && appMode === 'cycle'
        ? {
            intensity: intensity,
            symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
          }
        : undefined, // Set bleeding to undefined if not logged or not in cycle mode
      moonPhaseName: currentMoonPhase, // Store the moon phase name passed in
      isPeriodStart: appMode === 'cycle' ? isPeriodStart : undefined,
      isPeriodEnd: appMode === 'cycle' ? isPeriodEnd : undefined,
      // affirmationGenerated will be handled elsewhere if needed for this entry
    };
    onSaveEntry(entryData);
  };

  const formattedDate = selectedDate.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const moonDisplay = currentMoonPhase ? `${getMoonEmoji(currentMoonPhase)} ${t(`moonPhase${currentMoonPhase.replace(/\s/g, '')}` as any, {defaultValue: currentMoonPhase})}` : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>{t('dayEntryTitle', { date: formattedDate })}</DialogTitle>
          {moonDisplay && <DialogDescription className="text-sm text-accent">{moonDisplay}</DialogDescription>}
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="mood-selector">{t('dayEntryMood')}</Label>
            <MoodSelector
              moods={moodOptions.map(m => ({...m, label: t(m.labelKey)}))}
              selectedMood={mood}
              onMoodSelect={setMood}
              t={t}
            />
          </div>

          {appMode === 'cycle' && (
            <>
              <div className="flex items-center space-x-2 pt-3 border-t border-border mt-3">
                <Switch
                  id="isPeriodStart"
                  checked={isPeriodStart}
                  onCheckedChange={(checked) => {
                    setIsPeriodStart(checked);
                    if (checked) {
                      setLogBleeding(true);
                      if (!intensity || intensity === 'none') {
                         setIntensity('light');
                      }
                    }
                  }}
                  aria-label={t('dayEntryMarkPeriodStart')}
                />
                <Label htmlFor="isPeriodStart" className="font-medium">{t('dayEntryMarkPeriodStart')}</Label>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isPeriodEnd"
                  checked={isPeriodEnd}
                  onCheckedChange={setIsPeriodEnd}
                  aria-label={t('dayEntryMarkPeriodEnd')}
                />
                <Label htmlFor="isPeriodEnd" className="font-medium">{t('dayEntryMarkPeriodEnd')}</Label>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-border mt-3">
                <Switch
                  id="log-bleeding"
                  checked={logBleeding}
                  onCheckedChange={setLogBleeding}
                  aria-label={t('dayEntryLogBleeding')}
                />
                <Label htmlFor="log-bleeding">{t('dayEntryLogBleeding')}</Label>
              </div>

              {logBleeding && (
                <>
                  <div className="grid gap-1.5">
                    <Label htmlFor="bleeding-intensity">{t('dayEntryBleedingIntensity')}</Label>
                    <Select value={intensity} onValueChange={(value) => setIntensity(value as BleedingIntensity | 'spotting')}>
                      <SelectTrigger id="bleeding-intensity" className="w-full bg-input">
                        <SelectValue placeholder={t('dayEntrySelectIntensity')} />
                      </SelectTrigger>
                      <SelectContent>
                        {bleedingIntensityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {t(`dayEntryBleedingStrength${option.charAt(0).toUpperCase() + option.slice(1)}` as any, {defaultValue: option})}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label>{t('dayEntrySymptoms')}</Label>
                    <ScrollArea className="h-32 rounded-md border border-input p-3 bg-input/50">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {SYMPTOMS_LIST.map((symptomKey) => {
                          const symptomLabel = t(`symptom${symptomKey.charAt(0).toUpperCase() + symptomKey.slice(1)}` as any, {defaultValue: symptomKey});
                          return (
                            <div key={symptomKey} className="flex items-center space-x-2">
                              <Checkbox
                                id={`symptom-${symptomKey}`}
                                checked={selectedSymptoms.includes(symptomLabel)}
                                onCheckedChange={(checked) => handleSymptomChange(symptomKey, !!checked)}
                              />
                              <Label htmlFor={`symptom-${symptomKey}`} className="font-normal text-sm">
                                {symptomLabel}
                              </Label>
                            </div>
                          );
                         })}
                      </div>
                    </ScrollArea>
                  </div>
                </>
              )}
            </>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="notes">{t('dayEntryNotes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('writeYourThoughts')}
              rows={4}
              className="bg-input"
            />
          </div>
        </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('dayEntrySave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

