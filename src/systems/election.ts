import { dutchParties, sampleSeatProjection } from '../data/parties';
import type { GameState } from '../types/game';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const largestRemainder = (rawScores: Record<string, number>, totalSeats: number): Record<string, number> => {
  const entries = Object.entries(rawScores);
  const scoreTotal = entries.reduce((sum, [, score]) => sum + score, 0) || 1;

  const quotaEntries = entries.map(([partyId, score]) => {
    const exact = (score / scoreTotal) * totalSeats;
    const floorSeats = Math.floor(exact);
    return { partyId, exact, floorSeats, remainder: exact - floorSeats };
  });

  let allocated = quotaEntries.reduce((sum, item) => sum + item.floorSeats, 0);
  quotaEntries.sort((a, b) => b.remainder - a.remainder);

  const result: Record<string, number> = {};
  for (const item of quotaEntries) {
    result[item.partyId] = item.floorSeats;
  }

  let index = 0;
  while (allocated < totalSeats && quotaEntries.length > 0) {
    const party = quotaEntries[index % quotaEntries.length];
    result[party.partyId] += 1;
    allocated += 1;
    index += 1;
  }

  return result;
};

export const runElection = (state: GameState): GameState => {
  const economyMood = state.metrics.economy.gdpGrowth * 2 - state.metrics.economy.inflation - state.metrics.economy.unemployment;
  const approvalMood = (state.metrics.society.overallApproval - 50) / 4;
  const mediaMood = (state.metrics.politics.mediaSentiment - 50) / 6;

  const playerBonus = approvalMood + mediaMood + state.campaignMomentum * 0.9 + economyMood * 0.4;

  const weightedScores: Record<string, number> = {};
  for (const party of dutchParties) {
    const baseSeats = sampleSeatProjection[party.id] ?? 2;
    const baseline = Math.max(1, baseSeats + party.coalitionWillingness / 10);
    const isPlayerParty = state.playerParty === party.id;
    const distanceFromCenter = Math.abs(party.ideology.leftRight) / 100;

    const moodAdjustment = isPlayerParty
      ? playerBonus
      : -playerBonus * 0.18 + (0.8 - distanceFromCenter) * 1.1;

    const noise = (Math.random() - 0.5) * 2.4;
    weightedScores[party.id] = clamp(baseline + moodAdjustment + noise, 0.6, 80);
  }

  const seatMap = largestRemainder(weightedScores, 150);
  const playerSeats = state.playerParty ? seatMap[state.playerParty] ?? 0 : 0;
  const pollingEstimate = clamp(Math.round((playerSeats / 150) * 100), 1, 100);

  return {
    ...state,
    phase: 'coalition',
    parliamentSeats: seatMap,
    coalition: {
      partners: state.playerParty ? [state.playerParty] : [],
      seatTotal: playerSeats,
      lastDeals: []
    },
    scandalsActive: [],
    scandalRisk: Math.max(8, Math.round(state.scandalRisk * 0.7)),
    campaignMomentum: 0,
    eventLog: [...state.eventLog, `Election held: your party secures ${playerSeats} seats.`],
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        seatsInParliament: playerSeats,
        partyPolling: pollingEstimate,
        coalitionStability: clamp(state.metrics.politics.coalitionStability - 3, 0, 100),
        daysUntilElection: 1460
      }
    }
  };
};

export const applyCampaignAction = (state: GameState, action: 'debate' | 'ground' | 'tv'): GameState => {
  const boost = action === 'debate' ? 4 : action === 'ground' ? 3 : 5;
  const media = action === 'tv' ? 7 : action === 'debate' ? 4 : 2;
  const approval = action === 'ground' ? 3 : 2;

  return {
    ...state,
    campaignMomentum: clamp(state.campaignMomentum + boost, 0, 20),
    eventLog: [...state.eventLog, `Campaign action: ${action}.`],
    metrics: {
      ...state.metrics,
      society: {
        ...state.metrics.society,
        overallApproval: clamp(state.metrics.society.overallApproval + approval, 0, 100)
      },
      politics: {
        ...state.metrics.politics,
        mediaSentiment: clamp(state.metrics.politics.mediaSentiment + media, 0, 100),
        partyPolling: clamp(state.metrics.politics.partyPolling + Math.round(boost / 2), 0, 100)
      }
    }
  };
};
