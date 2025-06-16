
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
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PeriodLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialLogData?: PeriodLogEntry;
  onSaveLog: (logEntry: PeriodLogEntry) => void;
}

const intensityOptions: { value: PeriodIntensity; label: string }[] = [
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
  const [intensity, setIntensity] = useState<PeriodIntensity>('none');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setIntensity(initialLogData?.intensity || 'none');
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
    const logEntry: PeriodLogEntry = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      intensity,
      symptoms: selectedSymptoms,
      notes,
    };
    onSaveLog(logEntry);
  };

  const formattedDate = format(selectedDate, 'EEEE, MMMM do, yyyy');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>Period Log for {formattedDate}</DialogTitle>
          <DialogDescription>Log your flow, symptoms, and any notes for this day.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Intensity */}
          <div className="grid gap-2">
            <Label>Bleeding Intensity</Label>
            <RadioGroup
              value={intensity}
              onValueChange={(value: string) => setIntensity(value as PeriodIntensity)}
              className="flex flex-wrap gap-x-4 gap-y-2"
            >
              {intensityOptions.map(opt => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={`intensity-${opt.value}`} />
                  <Label htmlFor={`intensity-${opt.value}`} className="font-normal">{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Symptoms */}
          <div className="grid gap-2">
            <Label>Symptoms</Label>
            <ScrollArea className="h-40 w-full rounded-md border p-3 bg-input/30">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {SYMPTOMS_LIST.map(symptom => (
                    <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                        id={`symptom-${symptom}`}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={(checked) => handleSymptomChange(symptom, !!checked)}
                    />
                    <Label htmlFor={`symptom-${symptom}`} className="font-normal capitalize text-sm">
                        {symptom.replace(/([A-Z])/g, ' $1').trim()} 
                    </Label>
                    </div>
                ))}
                </div>
            </ScrollArea>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional thoughts or observations..."
              rows={3}
              className="bg-input"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save Log</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
