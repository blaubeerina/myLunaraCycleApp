
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MoodOption {
  emoji: string;
  label: string; // English label for key, translation will be handled by `t`
}

interface MoodSelectorProps {
  moods: MoodOption[];
  selectedMood: string;
  onMoodSelect: (moodEmoji: string) => void;
  t: (key: string) => string; // For translating labels if needed, though GCal is icon-only
}

export function MoodSelector({ moods, selectedMood, onMoodSelect, t }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {moods.map((mood) => (
        <Button
          key={mood.label} // Use English label as a stable key
          variant="outline"
          onClick={() => onMoodSelect(mood.emoji)}
          className={cn(
            "flex flex-col items-center justify-center h-16 w-full p-1 text-2xl transition-all duration-150 ease-in-out transform hover:scale-110",
            selectedMood === mood.emoji ? 'bg-primary/30 border-primary ring-2 ring-primary' : 'hover:bg-accent/10'
          )}
          aria-pressed={selectedMood === mood.emoji}
          aria-label={mood.label} // Accessibility label
          title={mood.label} // Tooltip for desktop
        >
          <span role="img" aria-hidden="true">{mood.emoji}</span>
          <span className="text-xs mt-1 text-muted-foreground sr-only">{mood.label}</span>
        </Button>
      ))}
    </div>
  );
}
