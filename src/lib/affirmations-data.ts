
import type { WisdomAffirmation } from './types';

// This file is now primarily for structure or if other static affirmation-related data is needed.
// The affirmations themselves are fetched from ZenQuotes.io.

export const wisdomAffirmations: WisdomAffirmation[] = [
  // Default or fallback affirmations can be placed here if ZenQuotes API fails,
  // though the current implementation in affirmation-utils.ts has its own fallback.
  // For now, keeping it empty as ZenQuotes is the primary source.
];
