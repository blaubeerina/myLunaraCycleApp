
'use client';

import type { PinterestJournalMoodType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Smile, Frown, Zap, Coffee, Meh } from 'lucide-react'; // Example icons

interface MoodOption {
  value: PinterestJournalMoodType;
  label: string;
  icon: React.ElementType;
  colorClasses: string; // Tailwind classes for bg/text
}

const moodOptions: MoodOption[] = [
  { value: 'happy', label: 'Happy', icon: Smile, colorClasses: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { value: 'sad', label: 'Sad', icon: Frown, colorClasses: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { value: 'calm', label: 'Calm', icon: Meh, colorClasses: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { value: 'energetic', label: 'Energetic', icon: Zap, colorClasses: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
  { value: 'neutral', label: 'Neutral', icon: Coffee, colorClasses: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
];

interface PinterestMoodSelectorProps {
  selectedMood: PinterestJournalMoodType;
  onMoodSelect: (mood: PinterestJournalMoodType) => void;
}

export function PinterestMoodSelector({ selectedMood, onMoodSelect }: PinterestMoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-2">
      {moodOptions.map((mood) => {
        const Icon = mood.icon;
        return (
          <Button
            key={mood.value}
            variant="outline"
            onClick={() => onMoodSelect(mood.value)}
            className={cn(
              "flex flex-col items-center justify-center h-20 w-20 p-2 rounded-lg transition-all duration-150 ease-in-out transform hover:scale-105",
              selectedMood === mood.value 
                ? `${mood.colorClasses} ring-2 ring-offset-1 ring-current` 
                : 'bg-white text-gray-600 hover:bg-gray-50',
              mood.colorClasses // Apply base colors, hover taken care of by specific condition or default button variant
            )}
            aria-pressed={selectedMood === mood.value}
            title={mood.label}
          >
            <Icon className="h-8 w-8 mb-1" />
            <span className="text-xs">{mood.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
