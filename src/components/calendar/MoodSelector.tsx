
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MoodOption {
  emoji: string;
  label: string; 
}

interface MoodSelectorProps {
  moods: MoodOption[];
  selectedMood: string;
  onMoodSelect: (moodEmoji: string) => void;
  t: (key: string, params?: Record<string, string | number> | undefined) => string; // Added t for future potential needs
}

export function MoodSelector({ moods, selectedMood, onMoodSelect, t }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {moods.map((mood) => (
        <Button
          key={mood.label} 
          variant="outline"
          onClick={() => onMoodSelect(mood.emoji)}
          className={cn(
            "flex flex-col items-center justify-center h-16 w-full p-1 text-2xl transition-all duration-150 ease-in-out transform hover:scale-110",
            selectedMood === mood.emoji ? 'bg-primary/30 border-primary ring-2 ring-primary' : 'hover:bg-accent/10 bg-card'
          )}
          aria-pressed={selectedMood === mood.emoji}
          aria-label={mood.label} 
          title={mood.label} 
        >
          <span role="img" aria-hidden="true">{mood.emoji}</span>
          <span className="text-xs mt-1 text-muted-foreground sr-only">{mood.label}</span>
        </Button>
      ))}
    </div>
  );
}
