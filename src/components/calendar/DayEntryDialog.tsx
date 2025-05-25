
'use client';

import type { DailyEntryData, Language, BleedingStrength } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from 'react';
import { MoodSelector } from './MoodSelector';

interface DayEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: Partial<DailyEntryData>; // To prefill form if editing
  onSaveEntry: (entry: DailyEntryData) => void;
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
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
}: DayEntryDialogProps) {
  const [mood, setMood] = useState<string>(initialData?.mood || '');
  const [isBleeding, setIsBleeding] = useState<boolean>(initialData?.isBleeding || false);
  const [bleedingStrength, setBleedingStrength] = useState<BleedingStrength>(initialData?.bleedingStrength || 'none');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>(initialData?.energyLevel || 'medium');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');

  useEffect(() => {
    if (isOpen) {
      setMood(initialData?.mood || '');
      setIsBleeding(initialData?.isBleeding || false);
      setBleedingStrength(initialData?.bleedingStrength || 'none');
      setEnergyLevel(initialData?.energyLevel || 'medium');
      setNotes(initialData?.notes || '');
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    // If bleeding is toggled off, reset strength to 'none'
    if (!isBleeding) {
      setBleedingStrength('none');
    }
  }, [isBleeding]);

  const handleSave = () => {
    const entryData: DailyEntryData = {
      date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
      mood,
      isBleeding,
      bleedingStrength: isBleeding ? bleedingStrength : 'none',
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
            <Label htmlFor="mood">{t('dayEntryMood')}</Label>
            <MoodSelector 
              moods={moods} 
              selectedMood={mood} 
              onMoodSelect={setMood} 
              t={t}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="bleeding"
              checked={isBleeding}
              onCheckedChange={setIsBleeding}
            />
            <Label htmlFor="bleeding">{t('dayEntryBleeding')}</Label>
          </div>

          {isBleeding && (
            <div className="grid gap-2">
              <Label htmlFor="bleeding-strength">{t('dayEntryBleedingStrength')}</Label>
              <Select 
                value={bleedingStrength} 
                onValueChange={(value) => setBleedingStrength(value as BleedingStrength)}
              >
                <SelectTrigger id="bleeding-strength" className="w-full">
                  <SelectValue placeholder={t('dayEntryBleedingStrengthNone')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('dayEntryBleedingStrengthNone')}</SelectItem>
                  <SelectItem value="light">{t('dayEntryBleedingStrengthLight')}</SelectItem>
                  <SelectItem value="medium">{t('dayEntryBleedingStrengthMedium')}</SelectItem>
                  <SelectItem value="heavy">{t('dayEntryBleedingStrengthHeavy')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                <Label htmlFor="energy-low">{t('dayEntryEnergyLow')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="energy-medium" />
                <Label htmlFor="energy-medium">{t('dayEntryEnergyMedium')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="energy-high" />
                <Label htmlFor="energy-high">{t('dayEntryEnergyHigh')}</Label>
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
