
'use server';
/**
 * @fileOverview Generates daily affirmations using AI.
 *
 * - generateAffirmation - A function that generates an affirmation.
 * - GenerateAffirmationInput - The input type for the generateAffirmation function.
 * - GenerateAffirmationOutput - The return type for the generateAffirmation function.
 */

import { generateText } from '@/ai/server-ai'; 
import { z } from 'zod';

// Define the input schema for the affirmation generation
export const GenerateAffirmationInputSchema = z.object({
  mood: z.string().optional().describe('The user\'s current mood (e.g., emoji or text like "happy", "stressed").'),
  journalEntry: z.string().optional().describe('A snippet of the user\'s recent journal entry for context.'),
  currentCyclePhase: z.string().optional().describe('The user\'s current menstrual cycle phase (e.g., "Follicular", "Luteal").'),
  currentMoonPhase: z.string().optional().describe('The current moon phase (e.g., "New Moon", "Full Moon").'),
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
  // DEMO MODE: Return a hardcoded affirmation
  console.log("DEMO MODE: Affirmation generation skipped, returning static affirmation.");
  const demoAffirmation = input.language === 'de' 
    ? "Dies ist eine Demo-Affirmation: Du bist wunderbar so wie du bist." 
    : "This is a demo affirmation: You are wonderful just as you are.";
  
  // Simulate a slight delay as if an API call was made
  await new Promise(resolve => setTimeout(resolve, 300));

  return { affirmation: demoAffirmation };

  // Original AI call logic (commented out for demo mode):
  /*
  let promptContent = `
    You are a compassionate and wise AI assistant for the myLunaraCycle app. 
    Your task is to generate a short, uplifting, and relevant daily affirmation for the user.
    The affirmation should be in ${input.language}.

    Consider the following user context if provided:
  `;
  if (input.mood) {
    promptContent += `Current mood: ${input.mood}\n`;
  }
  if (input.journalEntry) {
    promptContent += `Recent thoughts: "${input.journalEntry}"\n`;
  }
  if (input.currentCyclePhase) {
    promptContent += `Cycle phase: ${input.currentCyclePhase}\n`;
  }
  if (input.currentMoonPhase) {
    promptContent += `Moon phase: ${input.currentMoonPhase}\n`;
  }

  promptContent += `
    Generate an affirmation that is:
    - Positive and empowering.
    - Relevant to femininity, inner strength, self-care, or mindfulness.
    - Tailored to the provided context if possible, but general and inspiring if context is minimal.
    - One sentence, concise and impactful.
    - Avoid clichés if possible, aim for originality.

    Example for 'de' if mood is 'tired' and moon is 'New Moon': "Ich erlaube mir Ruhe und vertraue auf die Kraft neuer Anfänge."
    Example for 'en' if journal mentions 'feeling grateful': "My heart is open to the abundance and joy surrounding me today."

    Generate the affirmation now.
  `;

  try {
    const affirmationText = await generateText(promptContent);

    if (!affirmationText || affirmationText.trim() === "" || affirmationText === "AI text generation is currently unavailable." || affirmationText === "An error occurred while generating the affirmation.") {
      const fallbackAffirmation = input.language === 'de' ? "Jeder Tag birgt neue Chancen und Möglichkeiten." : "Every day holds new opportunities and chances.";
      return { affirmation: fallbackAffirmation };
    }
    return { affirmation: affirmationText };
  } catch (error) {
    console.error('Error generating affirmation in flow:', error);
    const fallbackAffirmation = input.language === 'de' ? "Ich bin stark und jeder Tag bringt neue Kraft." : "I am strong, and every day brings new strength.";
    return { affirmation: fallbackAffirmation };
  }
  */
}
