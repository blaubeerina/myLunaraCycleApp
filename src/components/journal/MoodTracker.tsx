'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😠', label: 'Angry' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😕', label: 'Confused' },
];

interface MoodTrackerProps {
  selectedMood: string;
  onMoodSelect: (moodEmoji: string) => void;
}

export function MoodTracker({ selectedMood, onMoodSelect }: MoodTrackerProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>How are you feeling today?</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2">
        {moods.map((mood) => (
          <Button
            key={mood.label}
            variant="outline"
            onClick={() => onMoodSelect(mood.emoji)}
            className={cn(
              "flex flex-col items-center justify-center h-20 w-full p-2 text-3xl transition-all duration-200 ease-in-out transform hover:scale-110",
              selectedMood === mood.emoji ? 'bg-primary/20 border-primary ring-2 ring-primary' : 'hover:bg-accent/50'
            )}
            aria-pressed={selectedMood === mood.emoji}
            aria-label={mood.label}
          >
            <span role="img" aria-label={mood.label}>{mood.emoji}</span>
            <span className="text-xs mt-1 text-muted-foreground">{mood.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
