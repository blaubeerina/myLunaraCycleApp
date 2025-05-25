
'use client';

import type { DailyEntryData, Language, BleedingStrength, AppMode } from '@/lib/types';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { MoodSelector } from './MoodSelector'; 

interface DayEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: Partial<DailyEntryData>;
  onSaveEntry: (entry: DailyEntryData) => void;
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  appMode: AppMode; 
}

const moods = [
  { emoji: '😊', label: 'Happy' }, { emoji: '😢', label: 'Sad' }, { emoji: '😠', label: 'Angry' },
  { emoji: '😌', label: 'Calm' }, { emoji: '😴', label: 'Tired' }, { emoji: '🤩', label: 'Excited' },
  { emoji: '😕', label: 'Confused' }, { emoji: '😟', label: 'Worried'}
];

export function DayEntryDialog({
  isOpen,
  onClose,
  selectedDate,
  initialData,
  onSaveEntry,
  language,
  t,
  appMode,
}: DayEntryDialogProps) {
  const [mood, setMood] = useState<string>('');
  const [isBleeding, setIsBleeding] = useState<boolean>(false);
  const [bleedingStrength, setBleedingStrength] = useState<BleedingStrength>('none');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState<string>('');

  // Effect for setting initial state when dialog opens or initialData/appMode changes
  useEffect(() => {
    if (isOpen) {
      setMood(initialData?.mood || '');
      setEnergyLevel(initialData?.energyLevel || 'medium');
      setNotes(initialData?.notes || '');

      const initialIsBleedingSetting = appMode === 'cycle' ? (initialData?.isBleeding || false) : false;
      setIsBleeding(initialIsBleedingSetting);

      if (appMode === 'cycle' && initialIsBleedingSetting) {
        // If bleeding is on in cycle mode, strength cannot be 'none'.
        // Default to 'light' if initialData.strength was 'none' or undefined, or is not a valid selectable option.
        const validStrengths: BleedingStrength[] = ['light', 'medium', 'heavy'];
        const initialStrength = initialData?.bleedingStrength;
        if (initialStrength && validStrengths.includes(initialStrength)) {
          setBleedingStrength(initialStrength);
        } else {
          setBleedingStrength('light');
        }
      } else {
        // Not cycle mode, or bleeding is off
        setBleedingStrength('none');
      }
    }
  }, [isOpen, initialData, appMode]);

  // Effect for handling changes to the isBleeding switch *after* initial load
  useEffect(() => {
    if (!isOpen) return; // Only run if dialog is open and was already initialized

    if (appMode === 'cycle') {
      if (isBleeding) {
        // If bleeding is turned ON, and strength is currently 'none' (e.g., it was just toggled from off)
        // set it to 'light' as a default.
        if (bleedingStrength === 'none') {
          setBleedingStrength('light');
        }
      } else {
        // If bleeding is turned OFF
        setBleedingStrength('none');
      }
    } else { // Pregnancy mode
      if (isBleeding) { // Should not happen, but as a safeguard
         setIsBleeding(false); 
      }
      setBleedingStrength('none');
    }
  // NOTE: `bleedingStrength` is intentionally omitted from deps here for this specific logic
  // to avoid re-triggering when `setBleedingStrength` is called within.
  // The logic path ensures that if isBleeding turns true and strength was 'none', it gets updated.
  }, [isBleeding, appMode, isOpen]);


  const handleSave = () => {
    const entryData: DailyEntryData = {
      date: selectedDate.toISOString().split('T')[0], 
      mood,
      isBleeding: appMode === 'cycle' ? isBleeding : false,
      bleedingStrength: appMode === 'cycle' && isBleeding ? bleedingStrength : 'none',
      energyLevel,
      notes,
    };
    onSaveEntry(entryData);
  };

  const formattedDate = selectedDate.toLocaleDateString(language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-background">
        <DialogHeader>
          <DialogTitle>{t('dayEntryTitle', { date: formattedDate })}</DialogTitle>
          <DialogDescription>
            {t('howAreYouFeeling')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="mood-selector">{t('dayEntryMood')}</Label>
            <MoodSelector 
              moods={moods} 
              selectedMood={mood} 
              onMoodSelect={setMood} 
              t={t}
            />
          </div>

          {appMode === 'cycle' && (
            <>
              <div className="flex items-center space-x-2">
                <Switch
                  id="bleeding"
                  checked={isBleeding}
                  onCheckedChange={setIsBleeding}
                  aria-label={t('dayEntryBleeding')}
                />
                <Label htmlFor="bleeding">{t('dayEntryBleeding')}</Label>
              </div>

              {isBleeding && (
                <div className="grid gap-2">
                  <Label>{t('dayEntryBleedingStrength')}</Label>
                  <RadioGroup
                    value={bleedingStrength}
                    onValueChange={(value: BleedingStrength) => setBleedingStrength(value)}
                    className="flex space-x-2 sm:space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="strength-light" />
                      <Label htmlFor="strength-light" className="font-normal">{t('dayEntryBleedingStrengthLight')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="strength-medium" />
                      <Label htmlFor="strength-medium" className="font-normal">{t('dayEntryBleedingStrengthMedium')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="heavy" id="strength-heavy" />
                      <Label htmlFor="strength-heavy" className="font-normal">{t('dayEntryBleedingStrengthHeavy')}</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </>
          )}

          <div className="grid gap-2">
            <Label>{t('dayEntryEnergyLevel')}</Label>
            <RadioGroup
              value={energyLevel}
              onValueChange={(value: 'low' | 'medium' | 'high') => setEnergyLevel(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="energy-low" />
                <Label htmlFor="energy-low" className="font-normal">{t('dayEntryEnergyLow')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="energy-medium" />
                <Label htmlFor="energy-medium" className="font-normal">{t('dayEntryEnergyMedium')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="energy-high" />
                <Label htmlFor="energy-high" className="font-normal">{t('dayEntryEnergyHigh')}</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">{t('dayEntryNotes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('writeYourThoughts')}
              rows={3}
              className="bg-input"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('dayEntryClose')}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            {t('dayEntrySave')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
