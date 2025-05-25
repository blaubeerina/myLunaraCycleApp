// The 'use server' directive is critical for Next.js server-side execution.
'use server';

/**
 * @fileOverview AI-powered affirmation generator based on user's mood and journal entries.
 *
 * generateAffirmation - A function that generates a personalized affirmation.
 * GenerateAffirmationInput - The input type for the generateAffirmation function.
 * GenerateAffirmationOutput - The return type for the generateAffirmation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAffirmationInputSchema = z.object({
  mood: z.string().describe('The user\'s current mood.'),
  journalEntry: z.string().describe('The user\'s journal entry for the day.'),
});
export type GenerateAffirmationInput = z.infer<typeof GenerateAffirmationInputSchema>;

const GenerateAffirmationOutputSchema = z.object({
  affirmation: z.string().describe('A personalized, daily affirmation.'),
});
export type GenerateAffirmationOutput = z.infer<typeof GenerateAffirmationOutputSchema>;

export async function generateAffirmation(input: GenerateAffirmationInput): Promise<GenerateAffirmationOutput> {
  return generateAffirmationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAffirmationPrompt',
  input: {schema: GenerateAffirmationInputSchema},
  output: {schema: GenerateAffirmationOutputSchema},
  prompt: `You are an AI that generates daily affirmations based on the user's mood and journal entries.

  Mood: {{{mood}}}
  Journal Entry: {{{journalEntry}}}

  Generate a personalized affirmation that is empowering and supportive.
  `,
});

const generateAffirmationFlow = ai.defineFlow(
  {
    name: 'generateAffirmationFlow',
    inputSchema: GenerateAffirmationInputSchema,
    outputSchema: GenerateAffirmationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
