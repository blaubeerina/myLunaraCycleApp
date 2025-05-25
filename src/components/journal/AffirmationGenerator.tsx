
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Textarea and Label are not directly used here anymore since mood/journalText are props
import { Loader2, Sparkles } from 'lucide-react';
import { generateAffirmation, type GenerateAffirmationInput } from '@/ai/flows/generate-affirmation';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface AffirmationGeneratorProps {
  mood: string; // This could be an emoji or a string like 'happy'
  journalText: string;
  onAffirmationGenerated: (affirmation: string) => void;
}

// This component is kept for potential re-integration.
// The new editable journal system doesn't directly use this.
// It was part of the old journal page.

export function AffirmationGenerator({ mood, journalText, onAffirmationGenerated }: AffirmationGeneratorProps) {
  const { t } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);

  const handleGenerateAffirmation = async () => {
    if (!mood && !journalText) {
      toast({
        title: "Input Missing",
        description: "Please provide a mood or journal entry to generate an affirmation.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setAffirmation(null);
    try {
      const input: GenerateAffirmationInput = {
        mood: mood || "neutral", 
        journalEntry: journalText || "No journal entry today.",
      };
      const result = await generateAffirmation(input);
      if (result.affirmation) {
        setAffirmation(result.affirmation);
        onAffirmationGenerated(result.affirmation);
        toast({
          title: "Affirmation Generated!",
          description: "A new affirmation is ready for you.",
        });
      } else {
        throw new Error("Empty affirmation received.");
      }
    } catch (error) {
      console.error("Failed to generate affirmation:", error);
      toast({
        title: "Error",
        description: "Could not generate an affirmation at this time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary h-6 w-6" />
          {t('generateAffirmation')}
        </CardTitle>
        <CardDescription>Let AI craft a motivational quote based on your current state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateAffirmation} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? (t('generating') || 'Generating...') : t('generateAffirmation')}
        </Button>
        {affirmation && (
          <div className="mt-4 p-4 border border-primary/50 rounded-md bg-background shadow">
            <Label className="font-semibold text-primary">{t('affirmationForToday')}:</Label>
            <p className="text-foreground italic mt-1">"{affirmation}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Need to import Label if we re-enable the display part
import { Label } from '@/components/ui/label';
