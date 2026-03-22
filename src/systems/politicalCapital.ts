import type { Difficulty, GameState } from '../types/game';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const decayByDifficulty: Record<Difficulty, number> = {
  Stageplek: 0.6,
  'Tweede Kamerlid': 1,
  Formateur: 1.4,
  Lijsttrekker: 1.8
};

/** Political capital system: income, decay, and action gating. */
export const applyMonthlyPoliticalCapitalFlow = (state: GameState): GameState => {
  const loyalty = state.relationships.factionLoyalty;
  const factionIncome = (loyalty.hardliners + loyalty.moderates + loyalty.pragmatists) / 120;
  const stabilityIncome = state.metrics.politics.coalitionStability / 40;
  const decay = decayByDifficulty[state.difficulty];

  const nextPk = clamp(
    Number((state.metrics.politics.politicalCapital + factionIncome + stabilityIncome - decay).toFixed(1))
  );

  return {
    ...state,
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        politicalCapital: nextPk
      }
    }
  };
};

export const canAffordPoliticalCapital = (state: GameState, pkCost: number): boolean =>
  state.metrics.politics.politicalCapital >= pkCost;

export const spendPoliticalCapital = (state: GameState, pkCost: number): GameState => ({
  ...state,
  metrics: {
    ...state.metrics,
    politics: {
      ...state.metrics.politics,
      politicalCapital: clamp(Number((state.metrics.politics.politicalCapital - pkCost).toFixed(1)))
    }
  }
});

export const rewardPoliticalCapital = (state: GameState, reward: number): GameState => ({
  ...state,
  metrics: {
    ...state.metrics,
    politics: {
      ...state.metrics.politics,
      politicalCapital: clamp(Number((state.metrics.politics.politicalCapital + reward).toFixed(1)))
    }
  }
});
