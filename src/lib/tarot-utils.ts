
import { format } from 'date-fns';
import { tarotCards, fallbackTarotCard } from './tarot-data';
import type { TarotCard } from './types';

const MAX_RECENT_CARDS = 7;
const DAILY_TAROT_CARD_STORAGE_PREFIX = 'dailyTarotCard_';

/**
 * Draws a new daily Tarot card, avoiding cards from the recentIds list.
 * Used for the main page's "Today's Card" feature.
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
    // Pick randomly from all cards again.
    const randomIndexFallback = Math.floor(Math.random() * allCards.length);
    return allCards[randomIndexFallback] || fallbackTarotCard;
  }

  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex] || fallbackTarotCard;
}

/**
 * Updates the list of recent card IDs for the "Today's Card" feature.
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

/**
 * Gets a consistent Tarot card for any given date, primarily for the calendar's day detail view.
 * It checks localStorage first, then deterministically assigns a card if none is stored for that date.
 * @param date The date for which to get the Tarot card.
 * @returns A TarotCard object.
 */
export function getDailyTarotCard(date: Date): TarotCard {
  if (!tarotCards || tarotCards.length === 0) {
    return fallbackTarotCard;
  }
  const dateString = format(date, 'yyyy-MM-dd');
  const storageKey = `${DAILY_TAROT_CARD_STORAGE_PREFIX}${dateString}`;

  try {
    const storedCardId = localStorage.getItem(storageKey);
    if (storedCardId) {
      const card = getCardById(storedCardId);
      // Ensure it's a valid card and not the fallback ID, otherwise, re-select.
      if (card && card.id !== 'fallback') { 
        return card;
      }
    }

    // If no card in localStorage or fallback was stored, select one deterministically for this date.
    // Using a combination of date parts to get a stable index.
    const dayOfYear = parseInt(format(date, 'D')); // Day of year (1-366)
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    // Simple deterministic index calculation
    const deterministicIndex = (dayOfYear + year + month) % tarotCards.length;
    
    const selectedCard = tarotCards[deterministicIndex] || fallbackTarotCard;

    // Store only if it's not the fallback card itself and localStorage is available.
    if (selectedCard.id !== 'fallback') {
      localStorage.setItem(storageKey, selectedCard.id);
    }
    return selectedCard;

  } catch (error) {
    console.error("Error accessing localStorage for daily tarot card:", error);
    // Fallback in case localStorage fails or other errors during the process.
    // This deterministic selection should still work even if localStorage fails.
    const dayOfYear = parseInt(format(date, 'D'));
    const year = date.getFullYear();
    const month = date.getMonth();
    const deterministicIndex = (dayOfYear + year + month) % tarotCards.length;
    return tarotCards[deterministicIndex] || fallbackTarotCard;
  }
}
