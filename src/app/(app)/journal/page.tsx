'use client';

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodTracker } from '@/components/journal/MoodTracker';
import { AffirmationGenerator } from '@/components/journal/AffirmationGenerator';
import { Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function JournalPage() {
  const { t } = useAppContext();
  const [mood, setMood] = useState<string>(''); // Stores the emoji
  const [journalText, setJournalText] = useState<string>('');
  const [generatedAffirmation, setGeneratedAffirmation] = useState<string>('');

  const handleSaveEntry = () => {
    // TODO: Implement actual save logic (e.g., to Firebase Firestore)
    // This would involve password protection if needed for the journal.
    console.log('Saving journal entry:', { mood, journalText, affirmation: generatedAffirmation, date: new Date().toISOString() });
    toast({
      title: "Entry Saved (Mock)",
      description: "Your journal entry has been saved (simulated).",
    });
    // Optionally clear fields after save
    // setMood('');
    // setJournalText('');
    // setGeneratedAffirmation('');
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{t('journal')}</CardTitle>
          <CardDescription>
            {t('howAreYouFeeling')} {t('writeYourThoughts')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MoodTracker selectedMood={mood} onMoodSelect={setMood} />

          <div>
            <Textarea
              placeholder={t('writeYourThoughts')}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              rows={8}
              className="bg-input shadow-inner"
            />
          </div>
          
          <AffirmationGenerator 
            mood={mood} 
            journalText={journalText} 
            onAffirmationGenerated={setGeneratedAffirmation}
          />

          <Button onClick={handleSaveEntry} className="w-full md:w-auto" size="lg">
            <Save className="mr-2 h-5 w-5" />
            {t('saveEntry')}
          </Button>
        </CardContent>
      </Card>

      {/* Display saved entries list (placeholder) */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Past Entries</CardTitle>
          <CardDescription>A list of your previous journal entries would appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-dashed border-border p-8 rounded-md text-center text-muted-foreground">
            <p>Journal history not implemented yet.</p>
            <p>Imagine your beautifully recorded thoughts and feelings listed here, securely stored.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
