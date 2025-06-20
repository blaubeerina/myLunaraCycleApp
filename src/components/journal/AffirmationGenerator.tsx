
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { generateAffirmation, type GenerateAffirmationInput } from '@/ai/flows/generate-affirmation';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label'; // Added import

interface AffirmationGeneratorProps {
  mood: string; 
  journalText: string;
  onAffirmationGenerated: (affirmation: string) => void;
  // Add cyclePhase and moonPhase if available from context/props
  // currentCyclePhase?: string; 
  // currentMoonPhase?: string;
}

export function AffirmationGenerator({ 
  mood, 
  journalText, 
  onAffirmationGenerated,
  // currentCyclePhase,
  // currentMoonPhase 
}: AffirmationGeneratorProps) {
  const { t, userPreferences } = useAppContext();
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
        mood: mood || undefined, 
        journalEntry: journalText || undefined,
        // currentCyclePhase: currentCyclePhase || undefined,
        // currentMoonPhase: currentMoonPhase || undefined,
        language: userPreferences.language,
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
       // Set a fallback affirmation on error
      const fallbackAffirmation = userPreferences.language === 'de' ? "Jeder Tag ist ein Geschenk." : "Every day is a gift.";
      setAffirmation(fallbackAffirmation);
      onAffirmationGenerated(fallbackAffirmation);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md bg-card/70 text-card-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="text-primary h-6 w-6" />
          {t('generateAffirmation')}
        </CardTitle>
        <CardDescription className="text-muted-foreground">Let AI craft a motivational quote based on your current state.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateAffirmation} disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? t('generating') : t('generateNewAffirmation')}
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
