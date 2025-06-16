
import type { WisdomAffirmation } from './types';
// wisdomAffirmations import is removed as we fetch from API

/**
 * Selects a new daily affirmation by fetching from ZenQuotes.io.
 * It attempts to get today's quote for consistency.
 * @returns A Promise resolving to a WisdomAffirmation object.
 */
export async function selectNewDailyAffirmation(
  // previousAffirmationText is no longer directly used for selection logic with API,
  // but could be used by the caller if they want to avoid immediate repeats on manual refresh.
  previousAffirmationText?: string | null
): Promise<WisdomAffirmation> {
  try {
    // Using /api/today for a consistent quote for the day
    // ZenQuotes API has CORS enabled.
    const response = await fetch('https://zenquotes.io/api/today');
    if (!response.ok) {
      console.error('ZenQuotes API request failed with status:', response.status);
      throw new Error('Failed to fetch affirmation');
    }
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const quoteData = data[0];
      return {
        text: quoteData.q || "Embrace the journey of this day.", // ZenQuotes uses 'q' for quote
        author: quoteData.a || "ZenQuotes.io", // ZenQuotes uses 'a' for author
      };
    } else {
      console.warn('ZenQuotes API returned no data or unexpected format.');
      throw new Error('No affirmation data received');
    }
  } catch (error) {
    console.error("Error fetching affirmation from ZenQuotes.io:", error);
    // Fallback affirmation
    return { text: "Every day holds the possibility of a miracle.", author: "System Fallback" };
  }
}
