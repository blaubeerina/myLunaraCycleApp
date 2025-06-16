
import type { TarotCard } from './types';

// Important: Ensure image paths match files you place in public/cards/
// e.g., public/cards/the-fool.png

export const tarotCards: TarotCard[] = [
  {
    id: '0-the-fool',
    title: 'The Fool',
    image: '/cards/the-fool.png',
    meaning: 'New beginnings, innocence, spontaneity, a free spirit.',
  },
  {
    id: '1-the-magician',
    title: 'The Magician',
    image: '/cards/the-magician.png',
    meaning: 'Manifestation, resourcefulness, power, inspired action.',
  },
  {
    id: '2-the-high-priestess',
    title: 'The High Priestess',
    image: '/cards/the-high-priestess.png',
    meaning: 'Intuition, sacred knowledge, divine feminine, the subconscious mind.',
  },
  {
    id: '3-the-empress',
    title: 'The Empress',
    image: '/cards/the-empress.png',
    meaning: 'Femininity, beauty, nature, nurturing, abundance.',
  },
  {
    id: '4-the-emperor',
    title: 'The Emperor',
    image: '/cards/the-emperor.png',
    meaning: 'Authority, establishment, structure, a father figure.',
  },
  {
    id: '5-the-hierophant',
    title: 'The Hierophant',
    image: '/cards/the-hierophant.png',
    meaning: 'Spiritual wisdom, religious beliefs, conformity, tradition, institutions.',
  },
  {
    id: '6-the-lovers',
    title: 'The Lovers',
    image: '/cards/the-lovers.png',
    meaning: 'Love, harmony, relationships, values alignment, choices.',
  },
  {
    id: '7-the-chariot',
    title: 'The Chariot',
    image: '/cards/the-chariot.png',
    meaning: 'Control, willpower, assertion, victory, determination.',
  },
  {
    id: '8-strength',
    title: 'Strength',
    image: '/cards/strength.png',
    meaning: 'Strength, courage, patience, influence, compassion.',
  },
  {
    id: '9-the-hermit',
    title: 'The Hermit',
    image: '/cards/the-hermit.png',
    meaning: 'Soul-searching, introspection, guidance, solitude.',
  },
  {
    id: '10-wheel-of-fortune',
    title: 'Wheel of Fortune',
    image: '/cards/wheel-of-fortune.png',
    meaning: 'Good luck, karma, life cycles, destiny, a turning point.',
  },
  {
    id: '13-death',
    title: 'Death',
    image: '/cards/death.png',
    meaning: 'Endings, beginnings, change, transformation, transition.',
  },
  {
    id: '10-of-coins', // Or a more descriptive ID like 'pentacles-10'
    title: 'Ten of Coins', // English title
    image: '/cards/zehn-der-muenzen.png',
    meaning: 'Legacy, inheritance, family wealth, lasting success, abundance.',
  },
  // Add all 22 Major Arcana, or your desired subset
  // { id: 'justice', title: 'Justice', image: '/cards/justice.png', meaning: '...' },
  // { id: 'the-hanged-man', title: 'The Hanged Man', image: '/cards/the-hanged-man.png', meaning: '...' },
  // { id: 'temperance', title: 'Temperance', image: '/cards/temperance.png', meaning: '...' },
  // { id: 'the-devil', title: 'The Devil', image: '/cards/the-devil.png', meaning: '...' },
  // { id: 'the-tower', title: 'The Tower', image: '/cards/the-tower.png', meaning: '...' },
  // { id: 'the-star', title: 'The Star', image: '/cards/the-star.png', meaning: '...' },
  // { id: 'the-moon', title: 'The Moon', image: '/cards/the-moon.png', meaning: '...' },
  // { id: 'the-sun', title: 'The Sun', image: '/cards/the-sun.png', meaning: '...' },
  // { id: 'judgement', title: 'Judgement', image: '/cards/judgement.png', meaning: '...' },
  // { id: 'the-world', title: 'The World', image: '/cards/the-world.png', meaning: '...' },
];

// Fallback card if something goes wrong or no cards are defined
export const fallbackTarotCard: TarotCard = {
  id: 'fallback',
  title: 'Mystery Card',
  image: 'https://placehold.co/128x200.png', // Placeholder if no local fallback image
  meaning: 'The path ahead is yet to be revealed.',
};
