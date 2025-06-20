
'use server';
/**
 * @fileOverview Generates daily affirmations using AI.
 *
 * - generateAffirmation - A function that generates an affirmation.
 * - GenerateAffirmationInput - The input type for the generateAffirmation function.
 * - GenerateAffirmationOutput - The return type for the generateAffirmation function.
 */

import { ai, textModel } from '@/ai/genkit'; // Use the global ai object and new textModel
import { z } from 'zod';

// Define the input schema for the affirmation generation
export const GenerateAffirmationInputSchema = z.object({
  mood: z.string().optional().describe('The user\'s current mood (e.g., emoji or text like "happy", "stressed").'),
  journalEntry: z.string().optional().describe('A snippet of the user\'s recent journal entry for context.'),
  currentCyclePhase: z.string().optional().describe('The user\'s current menstrual cycle phase (e.g., "Follicular", "Luteal").'),
  currentMoonPhase: z.string().optional().describe('The current moon phase (e.g., "Full Moon", "New Moon").'),
  language: z.enum(['en', 'de']).default('en').describe('The desired language for the affirmation.'),
});
export type GenerateAffirmationInput = z.infer<typeof GenerateAffirmationInputSchema>;

// Define the output schema for the affirmation
export const GenerateAffirmationOutputSchema = z.object({
  affirmation: z.string().describe('The generated daily affirmation text.'),
});
export type GenerateAffirmationOutput = z.infer<typeof GenerateAffirmationOutputSchema>;


// Wrapper function to be called by the frontend
export async function generateAffirmation(input: GenerateAffirmationInput): Promise<GenerateAffirmationOutput> {
  return affirmationFlow(input);
}

const affirmationPrompt = ai.definePrompt({
  name: 'affirmationPrompt',
  input: { schema: GenerateAffirmationInputSchema },
  output: { schema: GenerateAffirmationOutputSchema },
  prompt: `
    You are a compassionate and wise AI assistant for the myLunaraCycle app. 
    Your task is to generate a short, uplifting, and relevant daily affirmation for the user.
    The affirmation should be in {{language}}.

    Consider the following user context if provided:
    {{#if mood}}Current mood: {{mood}}{{/if}}
    {{#if journalEntry}}Recent thoughts: "{{journalEntry}}"{{/if}}
    {{#if currentCyclePhase}}Cycle phase: {{currentCyclePhase}}{{/if}}
    {{#if currentMoonPhase}}Moon phase: {{currentMoonPhase}}{{/if}}

    Generate an affirmation that is:
    - Positive and empowering.
    - Relevant to femininity, inner strength, self-care, or mindfulness.
    - Tailored to the provided context if possible, but general and inspiring if context is minimal.
    - One sentence, concise and impactful.
    - Avoid clichés if possible, aim for originality.

    Example for 'de' if mood is 'tired' and moon is 'New Moon': "Ich erlaube mir Ruhe und vertraue auf die Kraft neuer Anfänge."
    Example for 'en' if journal mentions 'feeling grateful': "My heart is open to the abundance and joy surrounding me today."

    Generate the affirmation now.
  `,
  config: {
    model: textModel, // Use the globally defined textModel
    temperature: 0.8, // Slightly more creative
    maxOutputTokens: 60,
     safetySettings: [ // Example safety settings
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});


const affirmationFlow = ai.defineFlow(
  {
    name: 'affirmationFlow',
    inputSchema: GenerateAffirmationInputSchema,
    outputSchema: GenerateAffirmationOutputSchema,
  },
  async (input) => {
    const { output } = await affirmationPrompt(input);
    if (!output?.affirmation) {
      // Fallback affirmation if generation fails or returns empty
      const fallbackAffirmation = input.language === 'de' ? "Jeder Tag birgt neue Chancen." : "Every day holds new opportunities.";
      return { affirmation: fallbackAffirmation };
    }
    return output;
  }
);
