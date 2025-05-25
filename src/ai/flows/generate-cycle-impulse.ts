
'use server';
/**
 * @fileOverview AI-powered impulse generator based on user's cycle phase, moon phase, and daily entry.
 *
 * generateCycleImpulse - A function that generates a personalized impulse.
 * GenerateCycleImpulseInput - The input type for the generateCycleImpulse function.
 * GenerateCycleImpulseOutput - The return type for the generateCycleImpulse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { CyclePhase } from '@/lib/types';

const GenerateCycleImpulseInputSchema = z.object({
  cyclePhase: z.string().describe('The user\'s current menstrual cycle phase (e.g., Menstruation, Follicular, Ovulation, Luteal).'),
  cycleDay: z.number().describe('The current day number in the user\'s menstrual cycle (e.g., 1, 15, 28).'),
  moonPhaseName: z.string().describe('The name of the current moon phase (e.g., New Moon, Full Moon, Waxing Crescent).'),
  userMood: z.string().optional().describe('The user\'s logged mood (e.g., 😊, 😢, calm, tired).'),
  userEnergyLevel: z.string().optional().describe('The user\'s logged energy level (e.g., low, medium, high).'),
  userNotes: z.string().optional().describe('Any notes or journal entry from the user for the day.'),
});
export type GenerateCycleImpulseInput = z.infer<typeof GenerateCycleImpulseInputSchema>;

const GenerateCycleImpulseOutputSchema = z.object({
  impulseText: z.string().describe('A short, supportive, or inspiring "impulse" text (1-2 sentences) for the user based on the provided inputs. It should be empathetic and encouraging, offering a small piece of wisdom or reflection relevant to their current state.'),
});
export type GenerateCycleImpulseOutput = z.infer<typeof GenerateCycleImpulseOutputSchema>;

export async function generateCycleImpulse(input: GenerateCycleImpulseInput): Promise<GenerateCycleImpulseOutput> {
  // Ensure defaults for optional fields if they are empty, null, or undefined to prevent issues with the prompt.
  const filledInput: GenerateCycleImpulseInput = {
    ...input,
    userMood: input.userMood || "not specified",
    userEnergyLevel: input.userEnergyLevel || "not specified",
    userNotes: input.userNotes || "no specific notes",
  };
  return generateCycleImpulseFlow(filledInput);
}

const prompt = ai.definePrompt({
  name: 'generateCycleImpulsePrompt',
  input: {schema: GenerateCycleImpulseInputSchema},
  output: {schema: GenerateCycleImpulseOutputSchema},
  prompt: `You are an empathetic AI companion for a menstrual cycle tracking app. Your goal is to provide a short (1-2 sentences), insightful, and supportive "Daily Impulse" to the user.
Consider the user's current state based on the following information:
- Menstrual Cycle Phase: {{{cyclePhase}}} (Day {{{cycleDay}}})
- Current Moon Phase: {{{moonPhaseName}}}
- User's Logged Mood: {{{userMood}}}
- User's Logged Energy Level: {{{userEnergyLevel}}}
- User's Notes/Journal: "{{{userNotes}}}"

Combine these aspects to create an impulse that is emotionally resonant, strengthening, or inspiring.
If the user input for mood, energy, or notes is "not specified" or "no specific notes", focus more on the cycle and moon phase.

Example:
If inputs are: cyclePhase="Luteal", cycleDay=22, moonPhaseName="Waning Gibbous", userMood="tired", userEnergyLevel="low", userNotes="feeling introverted".
A good impulse could be: "As the moon wanes and your luteal phase calls for rest, honor your body's need for quiet introspection. It's okay to simply be, rather than always do."

Generate an impulse for the given inputs. Be gentle and encouraging.
`,
});

const generateCycleImpulseFlow = ai.defineFlow(
  {
    name: 'generateCycleImpulseFlow',
    inputSchema: GenerateCycleImpulseInputSchema,
    outputSchema: GenerateCycleImpulseOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate an impulse.");
    }
    return output;
  }
);
