
import type { WisdomAffirmation } from './types';
import { wisdomAffirmations } from './affirmations-data';

/**
 * Selects a new daily affirmation, trying not to repeat the previous one if possible.
 * @param allAffirmations - The full list of available WisdomAffirmation objects.
 * @param previousAffirmationText - The text of the previously displayed affirmation.
 * @returns A WisdomAffirmation object.
 */
export function selectNewDailyAffirmation(
  allAffirmations: WisdomAffirmation[],
  previousAffirmationText?: string | null
): WisdomAffirmation {
  if (!allAffirmations || allAffirmations.length === 0) {
    return { text: "Embrace the quiet moments.", author: "System" }; // Fallback
  }

  if (allAffirmations.length === 1) {
    return allAffirmations[0];
  }

  let availableAffirmations = allAffirmations;
  if (previousAffirmationText) {
    availableAffirmations = allAffirmations.filter(aff => aff.text !== previousAffirmationText);
    // If filtering results in an empty list (e.g., only one affirmation and it was the previous one),
    // then fall back to using all affirmations to ensure one is always picked.
    if (availableAffirmations.length === 0) {
      availableAffirmations = allAffirmations;
    }
  }

  const randomIndex = Math.floor(Math.random() * availableAffirmations.length);
  return availableAffirmations[randomIndex];
}
