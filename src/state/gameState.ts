import { starterEvents } from '../data/events';
import { sampleSeatProjection } from '../data/parties';
import type { GameMetrics, GameState, Politician } from '../types/game';

const STORAGE_KEY = 'vaderland-save-v1';

const initialMetrics: GameMetrics = {
  economy: {
    gdpGrowth: 1.1,
    unemployment: 4.1,
    nationalDebt: 49.8,
    inflation: 2.9,
    housingAffordability: 34
  },
  society: {
    overallApproval: 50,
    approvalByDemographic: {
      'Randstad progressives': 51,
      'Rural conservatives': 50,
      'Young voters': 49,
      Elderly: 52,
      'Immigrants & 2nd generation': 48,
      Entrepreneurs: 53
    },
    immigrationSentiment: 44,
    healthcareSatisfaction: 58,
    educationScore: 62
  },
  politics: {
    coalitionStability: 58,
    partyPolling: 18,
    seatsInParliament: 24,
    daysUntilElection: 1460,
    mediaSentiment: 50
  },
  environment: {
    nitrogenEmissions: 63,
    climatePolicyScore: 47,
    renewableEnergy: 33
  }
};

export const initialGameState: GameState = {
  currentDate: { year: 2025, month: 1 },
  phase: 'coalition',
  playerParty: null,
  selectedPoliticianId: null,
  activeEventIndex: 0,
  eventLog: [],
  parliamentSeats: sampleSeatProjection,
  coalition: {
    partners: [],
    seatTotal: 0,
    lastDeals: []
  },
  campaignMomentum: 0,
  mediaByOutlet: {
    NOS: 52,
    RTL: 50,
    Telegraaf: 49,
    'De Volkskrant': 51
  },
  scandalRisk: 12,
  scandalsActive: [],
  history: {
    polling: [18],
    approval: [50]
  },
  metrics: initialMetrics
};

export const getActiveEvent = (state: GameState) => starterEvents[state.activeEventIndex % starterEvents.length];

const advanceOneMonth = (state: GameState): GameState['currentDate'] => {
  const nextMonth = state.currentDate.month === 12 ? 1 : state.currentDate.month + 1;
  const nextYear = state.currentDate.month === 12 ? state.currentDate.year + 1 : state.currentDate.year;
  return { year: nextYear, month: nextMonth };
};

const clamp = (value: number, min = 0, max = 100): number => Math.max(min, Math.min(max, value));

const maybeCoalitionCollapse = (state: GameState): GameState => {
  if (state.phase !== 'governance') {
    return state;
  }

  const collapsePressure =
    (100 - state.metrics.politics.coalitionStability) / 100 + state.scandalsActive.length * 0.08;

  if (state.metrics.politics.coalitionStability <= 24 && Math.random() < collapsePressure * 0.35) {
    return {
      ...state,
      phase: 'campaign',
      eventLog: [...state.eventLog, 'Coalition collapses after internal tensions. Early election campaign begins.'],
      metrics: {
        ...state.metrics,
        politics: {
          ...state.metrics.politics,
          daysUntilElection: Math.min(90, state.metrics.politics.daysUntilElection),
          mediaSentiment: clamp(state.metrics.politics.mediaSentiment - 4)
        }
      }
    };
  }

  return state;
};

export const pushHistoryPoint = (state: GameState): GameState => ({
  ...state,
  history: {
    polling: [...state.history.polling, state.metrics.politics.partyPolling].slice(-24),
    approval: [...state.history.approval, state.metrics.society.overallApproval].slice(-24)
  }
});

export const selectPolitician = (state: GameState, politician: Politician): GameState => {
  const playerSeats = sampleSeatProjection[politician.party] ?? 10;

  // Selection modifies starting sentiment to reflect candidate baseline appeal.
  return {
    ...state,
    phase: 'coalition',
    playerParty: politician.party,
    selectedPoliticianId: politician.id,
    parliamentSeats: sampleSeatProjection,
    coalition: {
      partners: [politician.party],
      seatTotal: playerSeats,
      lastDeals: []
    },
    eventLog: [...state.eventLog, `You take office as ${politician.name} (${politician.party}).`],
    metrics: {
      ...state.metrics,
      society: {
        ...state.metrics.society,
        overallApproval: Math.min(100, Math.max(0, state.metrics.society.overallApproval + Math.round((politician.stats.publicTrust - 50) / 2)))
      },
      politics: {
        ...state.metrics.politics,
        seatsInParliament: playerSeats,
        partyPolling: Math.round((playerSeats / 150) * 100),
        coalitionStability: clamp(state.metrics.politics.coalitionStability + 3),
        mediaSentiment: Math.min(100, Math.max(0, state.metrics.politics.mediaSentiment + Math.round((politician.stats.mediaRelations - 50) / 2)))
      }
    },
    history: {
      polling: [Math.round((playerSeats / 150) * 100)],
      approval: [Math.min(100, Math.max(0, state.metrics.society.overallApproval + Math.round((politician.stats.publicTrust - 50) / 2)))]
    }
  };
};

export const applyChoice = (state: GameState, choiceIndex: number): GameState => {
  const event = getActiveEvent(state);
  const choice = event.choices[choiceIndex];

  const nextMetrics = choice.apply(state.metrics);

  const nextState = {
    ...state,
    metrics: {
      ...nextMetrics,
      politics: {
        ...nextMetrics.politics,
        daysUntilElection: Math.max(0, nextMetrics.politics.daysUntilElection - 30)
      }
    },
    phase:
      Math.max(0, nextMetrics.politics.daysUntilElection - 30) <= 180 && state.phase === 'governance'
        ? 'campaign'
        : state.phase,
    currentDate: advanceOneMonth(state),
    activeEventIndex: state.activeEventIndex + 1,
    eventLog: [...state.eventLog, `${event.title} -> ${choice.label}`]
  };

  return maybeCoalitionCollapse(nextState);
};

export const formCabinet = (state: GameState): GameState => {
  if (state.coalition.seatTotal < 76) {
    return {
      ...state,
      eventLog: [...state.eventLog, 'Coalition talks fail to reach a majority.']
    };
  }

  return {
    ...state,
    phase: 'governance',
    eventLog: [...state.eventLog, `Cabinet formed with ${state.coalition.seatTotal} seats.`],
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        coalitionStability: clamp(state.metrics.politics.coalitionStability + 8),
        mediaSentiment: clamp(state.metrics.politics.mediaSentiment + 5)
      }
    }
  };
};

export const enterCampaign = (state: GameState): GameState => ({
  ...state,
  phase: 'campaign',
  eventLog: [...state.eventLog, 'Campaign season begins.']
});

export const saveGameState = (state: GameState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadGameState = (): GameState | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GameState>;

    return {
      ...initialGameState,
      ...parsed,
      currentDate: {
        ...initialGameState.currentDate,
        ...parsed.currentDate
      },
      metrics: {
        ...initialGameState.metrics,
        ...parsed.metrics,
        economy: {
          ...initialGameState.metrics.economy,
          ...parsed.metrics?.economy
        },
        society: {
          ...initialGameState.metrics.society,
          ...parsed.metrics?.society,
          approvalByDemographic: {
            ...initialGameState.metrics.society.approvalByDemographic,
            ...parsed.metrics?.society?.approvalByDemographic
          }
        },
        politics: {
          ...initialGameState.metrics.politics,
          ...parsed.metrics?.politics
        },
        environment: {
          ...initialGameState.metrics.environment,
          ...parsed.metrics?.environment
        }
      },
      coalition: {
        ...initialGameState.coalition,
        ...parsed.coalition,
        partners: parsed.coalition?.partners ?? initialGameState.coalition.partners,
        lastDeals: parsed.coalition?.lastDeals ?? initialGameState.coalition.lastDeals
      },
      mediaByOutlet: {
        ...initialGameState.mediaByOutlet,
        ...parsed.mediaByOutlet
      },
      scandalRisk: parsed.scandalRisk ?? initialGameState.scandalRisk,
      scandalsActive: parsed.scandalsActive ?? initialGameState.scandalsActive,
      history: {
        polling: parsed.history?.polling ?? initialGameState.history.polling,
        approval: parsed.history?.approval ?? initialGameState.history.approval
      },
      parliamentSeats: parsed.parliamentSeats ?? initialGameState.parliamentSeats,
      eventLog: parsed.eventLog ?? initialGameState.eventLog
    };
  } catch {
    return null;
  }
};

export const resetGame = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};