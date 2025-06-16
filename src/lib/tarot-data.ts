
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
    image: '/cards/the-high-priestess.jpg', // Changed from .png to .jpg
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
    id: 'king-of-cups',
    title: 'King of Cups',
    image: '/cards/king-of-cups.png',
    meaning: 'Emotional balance, compassion, diplomacy. (König der Kelche)',
  },
  {
    id: '10-of-coins',
    title: 'Ten of Coins',
    image: '/cards/zehn-der-muenzen.png',
    meaning: 'Legacy, inheritance, family wealth, lasting success, abundance. (Zehn der Münzen)',
  },
  // Add more cards as needed, ensuring 'image' path is correct and image exists in public/cards/
  // Example of more Major Arcana - ensure you have images for these
  { id: '11-justice', title: 'Justice', image: 'https://placehold.co/128x200.png', meaning: 'Fairness, truth, law, cause and effect.' },
  { id: '12-the-hanged-man', title: 'The Hanged Man', image: 'https://placehold.co/128x200.png', meaning: 'Pause, surrender, letting go, new perspectives.' },
  { id: '14-temperance', title: 'Temperance', image: 'https://placehold.co/128x200.png', meaning: 'Balance, moderation, patience, purpose.' },
  { id: '15-the-devil', title: 'The Devil', image: 'https://placehold.co/128x200.png', meaning: 'Shadow self, attachment, addiction, restriction.' },
  { id: '16-the-tower', title: 'The Tower', image: 'https://placehold.co/128x200.png', meaning: 'Sudden change, upheaval, chaos, revelation.' },
  { id: '17-the-star', title: 'The Star', image: 'https://placehold.co/128x200.png', meaning: 'Hope, faith, purpose, renewal, spirituality.' },
  { id: '18-the-moon', title: 'The Moon', image: 'https://placehold.co/128x200.png', meaning: 'Illusion, fear, anxiety, subconscious, intuition.' },
  { id: '19-the-sun', title: 'The Sun', image: 'https://placehold.co/128x200.png', meaning: 'Positivity, fun, warmth, success, vitality.' },
  { id: '20-judgement', title: 'Judgement', image: 'https://placehold.co/128x200.png', meaning: 'Judgement, rebirth, inner calling, absolution.' },
  { id: '21-the-world', title: 'The World', image: 'https://placehold.co/128x200.png', meaning: 'Completion, integration, accomplishment, travel.' },
];

// Fallback card if something goes wrong or no cards are defined
export const fallbackTarotCard: TarotCard = {
  id: 'fallback',
  title: 'Mystery Card',
  image: 'https://placehold.co/128x200.png', 
  meaning: 'The path ahead is yet to be revealed. Ensure your tarot images are in public/cards/.',
};
