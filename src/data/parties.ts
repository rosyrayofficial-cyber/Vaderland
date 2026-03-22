import type { Party } from '../types/game';

// Real Dutch party landscape starter data (2023-2025 era). Values are tunable.
export const dutchParties: Party[] = [
  {
    id: 'PVV',
    name: 'Partij voor de Vrijheid',
    ideology: { leftRight: 70, progressiveConservative: 85 },
    coalitionWillingness: 48,
    demographics: ['Rural conservatives', 'Lower-middle income voters']
  },
  {
    id: 'VVD',
    name: 'Volkspartij voor Vrijheid en Democratie',
    ideology: { leftRight: 45, progressiveConservative: 28 },
    coalitionWillingness: 72,
    demographics: ['Entrepreneurs', 'Higher-income professionals']
  },
  {
    id: 'D66',
    name: 'Democraten 66',
    ideology: { leftRight: -8, progressiveConservative: -62 },
    coalitionWillingness: 67,
    demographics: ['Urban professionals', 'Young voters']
  },
  {
    id: 'GL-PvdA',
    name: 'GroenLinks-PvdA',
    ideology: { leftRight: -65, progressiveConservative: -74 },
    coalitionWillingness: 64,
    demographics: ['Randstad progressives', 'Public-sector workers']
  },
  {
    id: 'NSC',
    name: 'Nieuw Sociaal Contract',
    ideology: { leftRight: 12, progressiveConservative: 11 },
    coalitionWillingness: 58,
    demographics: ['Institutional reform voters', 'Centrist Christians']
  },
  {
    id: 'BBB',
    name: 'BoerBurgerBeweging',
    ideology: { leftRight: 38, progressiveConservative: 64 },
    coalitionWillingness: 55,
    demographics: ['Farmers', 'Rural conservatives']
  },
  {
    id: 'CDA',
    name: 'Christen-Democratisch Appèl',
    ideology: { leftRight: 25, progressiveConservative: 32 },
    coalitionWillingness: 76,
    demographics: ['Elderly', 'Regional communities']
  },
  {
    id: 'SP',
    name: 'Socialistische Partij',
    ideology: { leftRight: -78, progressiveConservative: -12 },
    coalitionWillingness: 42,
    demographics: ['Working class', 'Social welfare voters']
  },
  {
    id: 'CU',
    name: 'ChristenUnie',
    ideology: { leftRight: -3, progressiveConservative: 42 },
    coalitionWillingness: 69,
    demographics: ['Christian households', 'Family-policy voters']
  },
  {
    id: 'DENK',
    name: 'DENK',
    ideology: { leftRight: -36, progressiveConservative: -9 },
    coalitionWillingness: 45,
    demographics: ['Immigrants & 2nd generation', 'Urban minority communities']
  },
  {
    id: 'Volt',
    name: 'Volt Nederland',
    ideology: { leftRight: -18, progressiveConservative: -66 },
    coalitionWillingness: 61,
    demographics: ['Young voters', 'EU-oriented urbanites']
  }
];

// Starter seat snapshot (can be replaced with a dynamic election model later)
export const sampleSeatProjection: Record<string, number> = {
  PVV: 37,
  'GL-PvdA': 25,
  VVD: 24,
  NSC: 20,
  D66: 9,
  BBB: 7,
  CDA: 5,
  SP: 5,
  CU: 3,
  DENK: 3,
  Volt: 2,
  Others: 10
};