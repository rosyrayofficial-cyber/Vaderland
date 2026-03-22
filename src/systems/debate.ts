import type { DebateStrategy, GameState } from '../types/game';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const strategyPower: Record<DebateStrategy, number> = {
  emotion: 6,
  data: 7,
  attack: 5,
  consensus: 6,
  deflect: 4
};

/** Debate system: rhetorical choices, AI response, and outcome effects. */
export const beginDebate = (state: GameState, billName: string, opponentPartyId: string): GameState => ({
  ...state,
  debate: {
    active: true,
    billName,
    roundsRemaining: 3,
    opponentPartyId,
    log: [`Debate opened on ${billName}.`]
  }
});

export const playDebateRound = (state: GameState, strategy: DebateStrategy): GameState => {
  if (!state.debate.active) {
    return state;
  }

  const relation = Object.values(state.relationships.byPoliticianId).reduce((sum, value) => sum + value, 0) /
    Math.max(1, Object.keys(state.relationships.byPoliticianId).length);
  const aiResistance = Math.max(0, 58 - relation * 0.18);
  const skillBonus = state.metrics.politics.debateSkill * 0.2;
  const score = strategyPower[strategy] + skillBonus + (Math.random() * 10 - 5) - aiResistance * 0.05;

  const success = score >= 6;
  const nextRounds = state.debate.roundsRemaining - 1;

  let nextState: GameState = {
    ...state,
    debate: {
      ...state.debate,
      roundsRemaining: nextRounds,
      lastPlayerMove: strategy,
      log: [
        ...state.debate.log,
        success
          ? `${strategy} landed effectively in the chamber.`
          : `${strategy} failed to shift the room decisively.`
      ]
    },
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        mediaSentiment: clamp(state.metrics.politics.mediaSentiment + (success ? 3 : -2)),
        debateSkill: clamp(state.metrics.politics.debateSkill + 1)
      },
      society: {
        ...state.metrics.society,
        overallApproval: clamp(state.metrics.society.overallApproval + (success ? 2 : -1))
      }
    }
  };

  if (nextRounds <= 0) {
    nextState = {
      ...nextState,
      debate: {
        ...nextState.debate,
        active: false,
        log: [...nextState.debate.log, 'Debate closed.']
      }
    };
  }

  return nextState;
};
