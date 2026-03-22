import { dutchParties } from '../data/parties';
import type { CoalitionDeal, CoalitionOffer, GameState, Party } from '../types/game';

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const getParty = (partyId: string): Party | undefined => dutchParties.find((party) => party.id === partyId);

const ideologyDistance = (a: Party, b: Party): number => {
  const leftRightDistance = Math.abs(a.ideology.leftRight - b.ideology.leftRight);
  const socialDistance = Math.abs(a.ideology.progressiveConservative - b.ideology.progressiveConservative);
  return Math.round((leftRightDistance + socialDistance) / 2);
};

const evaluateDeal = (leader: Party, target: Party, offer: CoalitionOffer, coalitionSeatTotal: number): CoalitionDeal => {
  const distancePenalty = ideologyDistance(leader, target) * 0.55;
  const willingness = target.coalitionWillingness;
  const seatUrgencyBoost = coalitionSeatTotal < 60 ? 5 : coalitionSeatTotal < 76 ? 10 : 2;
  const offerValue = offer.ministries * 7 + offer.policyConcessions * 9;

  const score = clamp(Math.round(willingness + offerValue + seatUrgencyBoost - distancePenalty));

  let reason = 'Limited policy overlap.';
  if (score >= 72) {
    reason = 'Cabinet path appears credible for both parties.';
  } else if (score >= 55) {
    reason = 'Conditional openness if coalition arithmetic holds.';
  }

  return {
    partyId: target.id,
    accepted: score >= 60,
    score,
    offer,
    reason
  };
};

export const proposeCoalitionDeal = (state: GameState, targetPartyId: string, offer: CoalitionOffer): GameState => {
  if (!state.playerParty || state.coalition.partners.includes(targetPartyId)) {
    return state;
  }

  const leader = getParty(state.playerParty);
  const target = getParty(targetPartyId);

  if (!leader || !target) {
    return state;
  }

  const deal = evaluateDeal(leader, target, offer, state.coalition.seatTotal);
  const seats = state.parliamentSeats[targetPartyId] ?? 0;

  const nextPartners = deal.accepted ? [...state.coalition.partners, targetPartyId] : state.coalition.partners;
  const nextSeatTotal = deal.accepted ? state.coalition.seatTotal + seats : state.coalition.seatTotal;
  const stabilityDelta = deal.accepted ? Math.max(1, 9 - offer.policyConcessions) : -2;

  return {
    ...state,
    coalition: {
      ...state.coalition,
      partners: nextPartners,
      seatTotal: nextSeatTotal,
      lastDeals: [deal, ...state.coalition.lastDeals].slice(0, 8)
    },
    eventLog: [
      ...state.eventLog,
      deal.accepted
        ? `${target.name} accepts coalition talks (${seats} seats added).`
        : `${target.name} rejects the current offer.`
    ],
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        coalitionStability: clamp(state.metrics.politics.coalitionStability + stabilityDelta),
        mediaSentiment: clamp(state.metrics.politics.mediaSentiment + (deal.accepted ? 3 : -2))
      }
    }
  };
};

export const canFormMajority = (state: GameState): boolean => state.coalition.seatTotal >= 76;
