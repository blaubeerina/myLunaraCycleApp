
'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { PinterestJournalEntry, PinterestJournalMoodType } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PinterestMoodSelector } from './PinterestMoodSelector'; // Assuming you created this
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // For tags
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JournalEditorProps {
  entry: PinterestJournalEntry | null; // null for new entry
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PinterestJournalEntry, 'id' | 'rotation' | 'userId'>, entryId?: string) => Promise<void>;
}

const FormSchema = z.object({
  content: z.string().min(1, "Content cannot be empty.").max(2000, "Content is too long."),
  mood: z.enum(['happy', 'sad', 'calm', 'energetic', 'neutral'] as [PinterestJournalMoodType, ...PinterestJournalMoodType[]] , { required_error: "Mood is required." }),
  tags: z.string().optional(), // Comma-separated string for form input
});

type FormValues = z.infer<typeof FormSchema>;

export function PinterestJournalEditor({ entry, isOpen, onClose, onSave }: JournalEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: entry?.content || '',
      mood: entry?.mood || 'neutral',
      tags: entry?.tags?.join(', ') || '',
    },
  });

  const selectedMood = watch('mood');

  useEffect(() => {
    if (isOpen) {
      reset({
        content: entry?.content || '',
        mood: entry?.mood || 'neutral',
        tags: entry?.tags?.join(', ') || '',
      });
    }
  }, [isOpen, entry, reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
    
    const saveData: Omit<PinterestJournalEntry, 'id' | 'rotation' | 'userId'> = {
      content: data.content,
      mood: data.mood,
      tags: tagsArray,
      date: entry?.date || new Date().toISOString(), // Keep original date if editing, else new
      // pinned will be handled by grid logic if implemented
    };

    try {
      await onSave(saveData, entry?.id);
      toast({ title: entry ? "Entry Updated!" : "Entry Created!", description: "Your journal has been saved." });
      onClose();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({ title: "Error", description: "Could not save journal entry.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white rounded-xl shadow-xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-serif text-gray-700">
            {entry ? 'Edit Journal Entry' : 'New Journal Note'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-6">
          <div>
            <Label htmlFor="content" className="text-sm font-medium text-gray-600 mb-1 block">Your Thoughts</Label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="content"
                  {...field}
                  placeholder="Let your thoughts flow..."
                  className="min-h-[150px] font-serif text-base border-gray-300 focus:border-[#FFD1DC] focus:ring-[#FFD1DC] rounded-md shadow-sm"
                  style={{ backgroundColor: '#FDFBF7' }} // Sepia-like notes background
                />
              )}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-600 mb-2 block">Mood</Label>
            <Controller
              name="mood"
              control={control}
              render={({ field }) => (
                 <PinterestMoodSelector 
                    selectedMood={field.value} 
                    onMoodSelect={(moodValue) => setValue('mood', moodValue, { shouldValidate: true })}
                 />
              )}
            />
          </div>

          <div>
            <Label htmlFor="tags" className="text-sm font-medium text-gray-600 mb-1 block">Tags (Optional)</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Input
                  id="tags"
                  {...field}
                  placeholder="e.g., gratitude, ideas, self-care"
                  className="border-gray-300 focus:border-[#FFD1DC] focus:ring-[#FFD1DC] rounded-md shadow-sm"
                />
              )}
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated tags.</p>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="rounded-full">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-[#FFD1DC] hover:bg-[#ffb7c8] text-gray-800 font-semibold rounded-full shadow-md transition-colors"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entry ? 'Save Changes' : 'Create Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
