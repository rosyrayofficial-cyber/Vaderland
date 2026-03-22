import type { GameState, MediaOutlet } from '../types/game';

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const OUTLET_BIAS: Record<MediaOutlet, number> = {
  NOS: 1,
  RTL: 0,
  Telegraaf: -4,
  'De Volkskrant': 3
};

const SCANDAL_POOL = [
  'Leaked coalition memo sparks outrage',
  'Budget overrun linked to ministry procurement',
  'Asylum policy contradiction dominates headlines',
  'Transport tender favoritism under investigation'
];

export const applyMediaCycle = (state: GameState, canTriggerScandal: boolean): GameState => {
  const nextOutlets = { ...state.mediaByOutlet };
  const baseline = state.metrics.politics.mediaSentiment;

  (Object.keys(OUTLET_BIAS) as MediaOutlet[]).forEach((outlet) => {
    const drift = Math.round((Math.random() - 0.5) * 6);
    nextOutlets[outlet] = clamp(baseline + OUTLET_BIAS[outlet] + drift);
  });

  const outletAverage = Math.round(
    ((nextOutlets.NOS + nextOutlets.RTL + nextOutlets.Telegraaf + nextOutlets['De Volkskrant']) / 4)
  );

  const pressure =
    state.scandalRisk * 0.45 +
    (100 - outletAverage) * 0.2 +
    (100 - state.metrics.politics.coalitionStability) * 0.15;
  const scandalChance = clamp(Math.round(pressure), 3, 48);

  if (canTriggerScandal && Math.random() * 100 < scandalChance) {
    const scandal = SCANDAL_POOL[Math.floor(Math.random() * SCANDAL_POOL.length)];
    return {
      ...state,
      mediaByOutlet: nextOutlets,
      scandalRisk: clamp(state.scandalRisk + 6),
      scandalsActive: [scandal, ...state.scandalsActive].slice(0, 3),
      eventLog: [...state.eventLog, `Scandal: ${scandal}.`],
      metrics: {
        ...state.metrics,
        society: {
          ...state.metrics.society,
          overallApproval: clamp(state.metrics.society.overallApproval - 4)
        },
        politics: {
          ...state.metrics.politics,
          mediaSentiment: clamp(outletAverage - 8),
          coalitionStability: clamp(state.metrics.politics.coalitionStability - 6),
          partyPolling: clamp(state.metrics.politics.partyPolling - 2)
        }
      }
    };
  }

  return {
    ...state,
    mediaByOutlet: nextOutlets,
    scandalRisk: clamp(state.scandalRisk - 1),
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        mediaSentiment: clamp(Math.round((state.metrics.politics.mediaSentiment + outletAverage) / 2))
      }
    }
  };
};

export const holdPressConference = (state: GameState): GameState => {
  const resolvesScandal = state.scandalsActive.length > 0;
  const nextScandals = resolvesScandal ? state.scandalsActive.slice(1) : state.scandalsActive;

  return {
    ...state,
    scandalsActive: nextScandals,
    scandalRisk: clamp(state.scandalRisk - (resolvesScandal ? 5 : 2)),
    eventLog: [
      ...state.eventLog,
      resolvesScandal
        ? `Press conference contained fallout: "${state.scandalsActive[0]}".`
        : 'Press conference improves message discipline.'
    ],
    metrics: {
      ...state.metrics,
      society: {
        ...state.metrics.society,
        overallApproval: clamp(state.metrics.society.overallApproval + (resolvesScandal ? 2 : 1))
      },
      politics: {
        ...state.metrics.politics,
        mediaSentiment: clamp(state.metrics.politics.mediaSentiment + (resolvesScandal ? 8 : 4)),
        coalitionStability: clamp(state.metrics.politics.coalitionStability + 1)
      }
    }
  };
};