
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

// Intensity options for the dialog, "none" is handled by the master switch.
const intensityOptionsForDialog: { value: PeriodIntensity; label: string }[] = [
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
  const [isBleedingLogged, setIsBleedingLogged] = useState<boolean>(false);
  // Default to 'light' if bleeding is logged and no specific intensity was previously set.
  const [intensity, setIntensity] = useState<PeriodIntensity>('light'); 
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const hasBleeding = initialLogData?.intensity !== 'none' && initialLogData?.intensity !== undefined;
      setIsBleedingLogged(hasBleeding);
      // Set intensity from log if available and not 'none', otherwise default to 'light' if we are in a bleeding state.
      setIntensity(hasBleeding && initialLogData?.intensity ? initialLogData.intensity : 'light');
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
    // If bleeding is not logged, intensity is 'none'. Otherwise, use the selected intensity.
    const finalIntensity = isBleedingLogged ? intensity : 'none';
    const logEntry: PeriodLogEntry = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      intensity: finalIntensity,
      symptoms: selectedSymptoms,
      notes,
    };
    onSaveLog(logEntry);
  };

  const formattedDate = format(selectedDate, 'EEEE, MMMM do, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border rounded-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Log for {formattedDate}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Record details for this day.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="log-bleeding-switch"
              checked={isBleedingLogged}
              onCheckedChange={setIsBleedingLogged}
            />
            <Label htmlFor="log-bleeding-switch" className="font-medium text-foreground/90">Log Bleeding</Label>
          </div>

          {isBleedingLogged && (
            <div className="grid gap-2">
              <Label className="font-medium text-foreground/90">Bleeding Intensity (Optional)</Label>
              <RadioGroup
                value={intensity}
                onValueChange={(value: string) => setIntensity(value as PeriodIntensity)}
                className="flex flex-wrap gap-x-3 gap-y-2"
              >
                {intensityOptionsForDialog.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`intensity-${opt.value}`} />
                    <Label htmlFor={`intensity-${opt.value}`} className="font-normal text-foreground/80">
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
                        className="border-primary"
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
            <Button type="button" variant="outline" onClick={onClose} className="rounded-sm text-foreground hover:bg-muted">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm">Save Log</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
