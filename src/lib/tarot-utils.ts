
import { tarotCards, fallbackTarotCard } from './tarot-data';
import type { TarotCard } from './types';

const MAX_RECENT_CARDS = 7;

/**
 * Draws a new daily Tarot card, avoiding cards from the recentIds list.
 * @param allCards - The full list of available TarotCard objects.
 * @param recentIds - An array of card IDs that should not be drawn.
 * @returns A TarotCard object or null if no suitable card can be drawn.
 */
export function drawNewDailyCard(allCards: TarotCard[], recentIds: string[]): TarotCard | null {
  if (!allCards || allCards.length === 0) {
    return fallbackTarotCard;
  }

  const availableCards = allCards.filter(card => !recentIds.includes(card.id));

  if (availableCards.length === 0) {
    // This case means all cards have been seen recently, or recentIds somehow contains all card IDs.
    // To prevent errors, we can either return a fallback or pick randomly from all cards again,
    // effectively resetting the "no repeat" if the pool is exhausted.
    // For simplicity, let's pick from all cards if available pool is empty.
    const randomIndexFallback = Math.floor(Math.random() * allCards.length);
    return allCards[randomIndexFallback] || fallbackTarotCard;
  }

  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex] || fallbackTarotCard;
}

/**
 * Updates the list of recent card IDs.
 * @param newCardId - The ID of the newly drawn card.
 * @param currentRecentIds - The current array of recent card IDs.
 * @returns An updated array of recent card IDs.
 */
export function updateRecentCardIds(newCardId: string, currentRecentIds: string[]): string[] {
  const updatedRecent = [newCardId, ...currentRecentIds.filter(id => id !== newCardId)];
  return updatedRecent.slice(0, MAX_RECENT_CARDS);
}

/**
 * Finds a Tarot card by its ID.
 * @param cardId The ID of the card to find.
 * @returns The TarotCard object or fallbackTarotCard if not found.
 */
export function getCardById(cardId: string | null): TarotCard {
    if (!cardId) return fallbackTarotCard;
    return tarotCards.find(card => card.id === cardId) || fallbackTarotCard;
}

// The old getDailyTarotCard(date: Date) is removed as the logic is now centralized in page.tsx
