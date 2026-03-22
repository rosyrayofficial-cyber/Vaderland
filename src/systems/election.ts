import { applyCampaignAction as applyCampaignActionV2, callElection } from '../state/gameState';
import type { GameState } from '../types/game';

export const runElection = (state: GameState): GameState => callElection(state);

export const applyCampaignAction = (state: GameState, action: 'debate' | 'ground' | 'tv'): GameState =>
  applyCampaignActionV2(state, action);
