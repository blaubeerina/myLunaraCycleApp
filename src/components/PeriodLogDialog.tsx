
'use client';

import { useEffect, useState } from 'react';
import type { PeriodLogEntry, PeriodIntensity, Symptom } from '@/lib/types';
import { SYMPTOMS_LIST } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PeriodLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialLogData?: PeriodLogEntry;
  onSaveLog: (logEntry: PeriodLogEntry) => void;
}

const intensityOptionsForDialog: { value: PeriodIntensity; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

export function PeriodLogDialog({
  isOpen,
  onClose,
  selectedDate,
  initialLogData,
  onSaveLog,
}: PeriodLogDialogProps) {
  // The master switch for logging bleeding.
  const [isBleedingLoggedOverall, setIsBleedingLoggedOverall] = useState<boolean>(false);
  // Specific intensity if bleeding is logged. Default to 'light' if overall switch is on.
  const [intensity, setIntensity] = useState<PeriodIntensity>('light'); 
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const hasInitialBleeding = initialLogData?.intensity !== 'none' && initialLogData?.intensity !== undefined;
      setIsBleedingLoggedOverall(hasInitialBleeding);
      setIntensity(initialLogData?.intensity || 'light'); // Keep initial or default to light
      setSelectedSymptoms(initialLogData?.symptoms || []);
      setNotes(initialLogData?.notes || '');
    }
  }, [isOpen, initialLogData]);

  const handleSymptomChange = (symptom: Symptom, checked: boolean) => {
    setSelectedSymptoms(prev =>
      checked ? [...prev, symptom] : prev.filter(s => s !== symptom)
    );
  };

  const handleSave = () => {
    // If the "Log Bleeding" switch is off, intensity is 'none', regardless of radio button selection.
    // Otherwise, use the selected intensity from the radio group.
    const finalIntensity = isBleedingLoggedOverall ? intensity : 'none';
    const logEntry: PeriodLogEntry = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      intensity: finalIntensity,
      symptoms: selectedSymptoms,
      notes,
    };
    onSaveLog(logEntry);
  };
  
  const handleMasterSwitchChange = (checked: boolean) => {
    setIsBleedingLoggedOverall(checked);
    if (!checked) {
      // If turning off bleeding, set intensity to 'none'.
      setIntensity('none');
    } else if (intensity === 'none') {
      // If turning on bleeding and current intensity is 'none', default to 'light'.
      setIntensity('light');
    }
  };


  const formattedDate = format(selectedDate, 'EEEE, MMMM do, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-md text-foreground">
        <DialogHeader>
          <DialogTitle>Log for {formattedDate}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Record details for this day.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="log-bleeding-switch"
              checked={isBleedingLoggedOverall}
              onCheckedChange={handleMasterSwitchChange}
            />
            <Label htmlFor="log-bleeding-switch" className="font-medium text-foreground/90">Log Bleeding</Label>
          </div>

          {isBleedingLoggedOverall && ( // Show intensity options only if master switch is on
            <div className="grid gap-2">
              <Label className="font-medium text-foreground/90">Bleeding Intensity</Label>
              <RadioGroup
                value={intensity}
                onValueChange={(value: string) => setIntensity(value as PeriodIntensity)}
                className="flex flex-wrap gap-x-3 gap-y-2"
              >
                {intensityOptionsForDialog.filter(opt => opt.value !== 'none').map(opt => ( // Exclude 'none' from radio
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`intensity-${opt.value}`} className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"/>
                    <Label htmlFor={`intensity-${opt.value}`} className="font-normal capitalize text-foreground/80">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="grid gap-2">
            <Label className="font-medium text-foreground/90">Symptoms (Optional)</Label>
            <ScrollArea className="h-36 w-full rounded-md border border-border/50 p-3 bg-input/50">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {SYMPTOMS_LIST.map(symptom => (
                    <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                        id={`symptom-${symptom}`}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => handleSymptomChange(symptom, !!checked)}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor={`symptom-${symptom}`} className="font-normal capitalize text-sm text-foreground/80">
                        {symptom.replace(/([A-Z])/g, ' $1').trim()} 
                    </Label>
                    </div>
                ))}
                </div>
            </ScrollArea>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="font-medium text-foreground/90">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts or observations..."
              rows={3}
              className="bg-input text-sm text-foreground rounded-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} className="rounded-sm text-foreground hover:bg-muted border-border hover:text-foreground">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm">Save Log</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
