
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

const validBleedingStrengths: BleedingStrength[] = ['light', 'medium', 'heavy'];

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

  useEffect(() => {
    if (isOpen) {
      setMood(initialData?.mood || '');
      setEnergyLevel(initialData?.energyLevel || 'medium');
      setNotes(initialData?.notes || '');

      const initialIsBleeding = appMode === 'cycle' ? (initialData?.isBleeding || false) : false;
      setIsBleeding(initialIsBleeding);

      if (appMode === 'cycle' && initialIsBleeding) {
        const initialStrength = initialData?.bleedingStrength;
        if (initialStrength && validBleedingStrengths.includes(initialStrength)) {
          setBleedingStrength(initialStrength);
        } else {
          setBleedingStrength('light'); // Default to 'light' if bleeding but strength is none or invalid
        }
      } else {
        setBleedingStrength('none');
      }
    }
  }, [isOpen, initialData, appMode]);


  useEffect(() => {
    if (!isOpen) return; 

    if (appMode === 'cycle') {
      if (isBleeding) {
        if (bleedingStrength === 'none') {
          setBleedingStrength('light');
        }
      } else {
        setBleedingStrength('none');
      }
    } else { 
      // Ensure bleeding is off and strength is none if not in cycle mode
      if (isBleeding) setIsBleeding(false); // Force off if it was somehow set
      setBleedingStrength('none');
    }
  }, [isBleeding, appMode, isOpen]); // bleedingStrength removed from deps intentionally here as per prior logic


  const handleSave = () => {
    const finalIsBleeding = appMode === 'cycle' ? isBleeding : false;
    const finalBleedingStrength = appMode === 'cycle' && finalIsBleeding ? bleedingStrength : 'none';

    const entryData: DailyEntryData = {
      date: selectedDate.toISOString().split('T')[0], 
      mood,
      isBleeding: finalIsBleeding,
      bleedingStrength: finalBleedingStrength,
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

              {isBleeding && ( // Only show strength options if bleeding is active and in cycle mode
                <div className="grid gap-2">
                  <Label>{t('dayEntryBleedingStrength')}</Label>
                  <RadioGroup
                    value={bleedingStrength}
                    onValueChange={(value: string) => setBleedingStrength(value as BleedingStrength)}
                    className="flex space-x-2 sm:space-x-4"
                  >
                    {validBleedingStrengths.map((strength) => (
                       <div key={strength} className="flex items-center space-x-2">
                        <RadioGroupItem value={strength} id={`strength-${strength}`} />
                        <Label htmlFor={`strength-${strength}`} className="font-normal">
                          {t(`dayEntryBleedingStrength${strength.charAt(0).toUpperCase() + strength.slice(1)}` as any)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </>
          )}

          <div className="grid gap-2">
            <Label>{t('dayEntryEnergyLevel')}</Label>
            <RadioGroup
              value={energyLevel}
              onValueChange={(value: string) => setEnergyLevel(value as 'low' | 'medium' | 'high')}
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

