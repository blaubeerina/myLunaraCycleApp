
import type { TarotCard } from './types';

// Important: Ensure image paths match files you place in public/cards/
// e.g., public/cards/the-fool.png

export const tarotCards: TarotCard[] = [
  {
    id: '0-the-fool',
    title: 'The Fool',
    image: '/cards/the-fool.png',
  },
  {
    id: '1-the-magician',
    title: 'The Magician',
    image: '/cards/the-magician.png',
  },
  {
    id: '2-the-high-priestess',
    title: 'The High Priestess',
    image: '/cards/the-high-priestess.png',
  },
  {
    id: '3-the-empress',
    title: 'The Empress',
    image: '/cards/the-empress.png',
  },
  {
    id: '4-the-emperor',
    title: 'The Emperor',
    image: '/cards/the-emperor.png',
  },
  {
    id: '5-the-hierophant',
    title: 'The Hierophant',
    image: '/cards/the-hierophant.png',
  },
  {
    id: '6-the-lovers',
    title: 'The Lovers',
    image: '/cards/the-lovers.png',
  },
  {
    id: '7-the-chariot',
    title: 'The Chariot',
    image: '/cards/the-chariot.png',
  },
  {
    id: '8-strength',
    title: 'Strength',
    image: '/cards/strength.png',
  },
  {
    id: '9-the-hermit',
    title: 'The Hermit',
    image: '/cards/the-hermit.png',
  },
  {
    id: '10-wheel-of-fortune',
    title: 'Wheel of Fortune',
    image: '/cards/wheel-of-fortune.png',
  },
  // Add all 22 Major Arcana, or your desired subset
  // { id: 'justice', title: 'Justice', image: '/cards/justice.png' },
  // { id: 'the-hanged-man', title: 'The Hanged Man', image: '/cards/the-hanged-man.png' },
  // { id: 'death', title: 'Death', image: '/cards/death.png' },
  // { id: 'temperance', title: 'Temperance', image: '/cards/temperance.png' },
  // { id: 'the-devil', title: 'The Devil', image: '/cards/the-devil.png' },
  // { id: 'the-tower', title: 'The Tower', image: '/cards/the-tower.png' },
  // { id: 'the-star', title: 'The Star', image: '/cards/the-star.png' },
  // { id: 'the-moon', title: 'The Moon', image: '/cards/the-moon.png' },
  // { id: 'the-sun', title: 'The Sun', image: '/cards/the-sun.png' },
  // { id: 'judgement', title: 'Judgement', image: '/cards/judgement.png' },
  // { id: 'the-world', title: 'The World', image: '/cards/the-world.png' },
];

// Fallback card if something goes wrong or no cards are defined
export const fallbackTarotCard: TarotCard = {
  id: 'fallback',
  title: 'Mystery',
  image: 'https://placehold.co/64x100.png', // Placeholder if no local fallback image
};
