
import { format } from 'date-fns';
import { tarotCards, fallbackTarotCard } from './tarot-data';
import type { TarotCard } from './types';

export function getDailyTarotCard(date: Date): TarotCard {
  if (!tarotCards || tarotCards.length === 0) {
    return fallbackTarotCard;
  }

  const dateString = format(date, 'yyyy-MM-dd');
  const storageKey = `dailyTarotCard_${dateString}`;

  try {
    const storedCardJson = localStorage.getItem(storageKey);
    if (storedCardJson) {
      const storedCard = JSON.parse(storedCardJson) as TarotCard;
      // Basic validation to ensure the stored card is still in our list (e.g., if tarot-data.ts changed)
      // And has a valid image path (not a placeholder from a previous error)
      if (tarotCards.find(card => card.id === storedCard.id) && storedCard.image && !storedCard.image.startsWith('https://placehold.co')) {
        return storedCard;
      } else {
        localStorage.removeItem(storageKey); // Clear invalid stored card
      }
    }
  } catch (error) {
    console.error("Error reading daily tarot card from localStorage:", error);
    // Proceed to pick a new card
  }

  // Simple pseudo-random number generator based on the date to ensure the same card for the same day
  // This provides a deterministic "random" pick without complex seeding.
  // Combining year, month, and day for the seed.
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  
  // A simple way to get a somewhat distributed index.
  // The exact distribution isn't critical, just that it's deterministic for the date.
  const pseudoRandomIndex = Math.abs(Math.floor(Math.sin(seed) * tarotCards.length)) % tarotCards.length;
  
  const selectedCard = tarotCards[pseudoRandomIndex] || fallbackTarotCard;

  try {
    localStorage.setItem(storageKey, JSON.stringify(selectedCard));
  } catch (error) {
    console.error("Error saving daily tarot card to localStorage:", error);
    // App can continue, card just won't be persisted for this session if storage fails
  }

  return selectedCard;
}
