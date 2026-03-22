import type { Politician } from '../types/game';

// Add or adjust politicians here. Keep ids stable to preserve save compatibility.
export const politicians: Politician[] = [
  {
    id: 'wilders',
    name: 'Geert Wilders',
    party: 'PVV',
    portrait: '🦁',
    bio: 'Leader of the PVV, known for hardline positions on immigration and sovereignty.',
    stats: {
      charisma: 78,
      ideologyScore: 82,
      partyLoyalty: 91,
      publicTrust: 54,
      mediaRelations: 40
    }
  },
  {
    id: 'timmermans',
    name: 'Frans Timmermans',
    party: 'GroenLinks-PvdA',
    portrait: '🌍',
    bio: 'Former EU Commissioner focusing on climate policy and social-democratic cooperation.',
    stats: {
      charisma: 70,
      ideologyScore: -60,
      partyLoyalty: 80,
      publicTrust: 58,
      mediaRelations: 69
    }
  },
  {
    id: 'yesilgoz',
    name: 'Dilan Yeşilgöz',
    party: 'VVD',
    portrait: '⚖️',
    bio: 'Liberal-conservative VVD leader balancing law-and-order and market-focused policy.',
    stats: {
      charisma: 66,
      ideologyScore: 35,
      partyLoyalty: 76,
      publicTrust: 56,
      mediaRelations: 64
    }
  },
  {
    id: 'omtzigt',
    name: 'Pieter Omtzigt',
    party: 'NSC',
    portrait: '📜',
    bio: 'Institutional reform advocate emphasizing governance integrity and social security.',
    stats: {
      charisma: 62,
      ideologyScore: 18,
      partyLoyalty: 73,
      publicTrust: 71,
      mediaRelations: 58
    }
  }
];