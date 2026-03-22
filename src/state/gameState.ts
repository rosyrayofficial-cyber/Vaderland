import parties from '../data/parties.json';
import politicians from '../data/politicians.json';
import scenarios from '../data/scenarios.json';
import { runMonthlyEconomyTick } from '../systems/economy';
import { advanceActiveEvent, getEventById, scheduleFollowUp } from '../systems/eventEngine';
import { canAffordPoliticalCapital, spendPoliticalCapital, applyMonthlyPoliticalCapitalFlow } from '../systems/politicalCapital';
import { updateRelationshipsFromDecision } from '../systems/relationships';
import type {
  Difficulty,
  DynamicEvent,
  EventChoice,
  FactionName,
  GameState,
  Party,
  Politician,
  ScenarioConfig,
  SegmentName,
  SaveSlot,
  MediaOutlet,
  ProvinceApproval
} from '../types/game';

const STORAGE_PREFIX = 'vaderland-save-v2';

const partyData = parties as Party[];
export const politicianData = politicians as Politician[];
export const scenarioData = scenarios as ScenarioConfig[];

const provinces: string[] = [
  'Groningen',
  'Friesland',
  'Drenthe',
  'Overijssel',
  'Flevoland',
  'Gelderland',
  'Utrecht',
  'Noord-Holland',
  'Zuid-Holland',
  'Zeeland',
  'Noord-Brabant',
  'Limburg'
];

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export const saveSlots: SaveSlot[] = [
  { id: 'slot-1', name: 'Cabinet Archive I', updatedAt: null },
  { id: 'slot-2', name: 'Cabinet Archive II', updatedAt: null },
  { id: 'slot-3', name: 'Cabinet Archive III', updatedAt: null }
];

const baseParliamentSeats = (): Record<string, number> => {
  const seats: Record<string, number> = {};
  let total = 0;

  partyData.forEach((party) => {
    seats[party.id] = party.baseSeats;
    total += party.baseSeats;
  });

  if (total < 150) {
    seats.Others = 150 - total;
  }

  return seats;
};

const buildProvinceApproval = (base: number): ProvinceApproval[] =>
  provinces.map((name, idx) => ({
    name,
    approval: clamp(Math.round(base + (idx % 3) * 2 - 2))
  }));

const initialState = (difficulty: Difficulty = 'Tweede Kamerlid', scenarioId = 'formatie'): GameState => {
  const scenario = scenarioData.find((item) => item.id === scenarioId) ?? scenarioData[0];
  const seats = baseParliamentSeats();

  const defaultSegments: Record<SegmentName, { approval: number; volatility: number; topIssues: [string, string, string] }> = {
    'Randstad progressives': { approval: 50, volatility: 0.55, topIssues: ['Climate', 'Housing', 'Education'] },
    'Rural conservatives': { approval: 50, volatility: 0.45, topIssues: ['Agriculture', 'Migration', 'Fuel prices'] },
    'Elderly (65+)': { approval: 52, volatility: 0.32, topIssues: ['Pensions', 'Healthcare', 'Safety'] },
    'Young voters': { approval: 49, volatility: 0.62, topIssues: ['Housing', 'Education', 'Climate'] },
    'ZZP/entrepreneurs': { approval: 51, volatility: 0.38, topIssues: ['Tax burden', 'Regulation', 'Labor market'] },
    'Migrant communities': { approval: 48, volatility: 0.47, topIssues: ['Inclusion', 'Jobs', 'Housing'] },
    'Public sector workers': { approval: 50, volatility: 0.36, topIssues: ['Wages', 'Workload', 'Healthcare'] },
    'Vinex suburbanites': { approval: 51, volatility: 0.34, topIssues: ['Commuting', 'Schools', 'Cost of living'] }
  };

  const defaultMedia: Record<MediaOutlet, number> = {
    NOS: 50,
    'RTL Nieuws': 50,
    'De Telegraaf': 49,
    'De Volkskrant': 51,
    'Follow the Money': 50,
    GeenStijl: 48
  };

  return {
    version: 2,
    language: 'en',
    difficulty,
    phase: 'selection',
    scenarioId: scenario.id,
    currentDate: {
      year: 2025,
      month: 1,
      monthIndex: 0
    },
    selectedPoliticianId: null,
    playerParty: null,
    parliamentSeats: seats,
    coalition: {
      round: 1,
      partners: [],
      seatTotal: 0,
      minorityGovernment: false,
      deals: [],
      agreementTracker: {}
    },
    metrics: {
      economy: {
        gdpGrowth: 1.1,
        unemployment: 4.2,
        inflation: 2.8,
        nationalDebt: 49.5,
        housingAffordability: 35,
        budgetBalance: -1.8,
        creditRating: 87,
        spending: {
          zorg: 17,
          onderwijs: 11,
          defensie: 8,
          infrastructuur: 12,
          socialeZekerheid: 18
        },
        taxes: {
          incomeLow: 20,
          incomeMid: 37,
          incomeHigh: 49,
          corporate: 26,
          wealth: 5
        }
      },
      society: {
        overallApproval: scenario.overallApproval,
        segments: defaultSegments
      },
      politics: {
        coalitionStability: scenario.coalitionStability,
        partyPolling: 18,
        seatsInParliament: 24,
        daysUntilElection: scenario.daysUntilElection,
        mediaSentiment: scenario.mediaSentiment,
        politicalCapital: scenario.politicalCapital,
        debateSkill: 52,
        mediageniekheid: 54,
        confidenceDebt: 0
      },
      environment: {
        nitrogenEmissions: 63,
        climatePolicyScore: 47,
        renewableEnergy: 33
      }
    },
    relationships: {
      byPoliticianId: Object.fromEntries(politicianData.map((p) => [p.id, 0])) as Record<string, number>,
      factionLoyalty: {
        hardliners: 8,
        moderates: 12,
        pragmatists: 10
      }
    },
    media: {
      outlets: defaultMedia,
      scandalRisk: 12,
      activeScandals: []
    },
    provinces: buildProvinceApproval(scenario.overallApproval),
    trend: [
      {
        monthIndex: 0,
        polling: 18,
        approval: scenario.overallApproval,
        health: 52
      }
    ],
    timeline: [],
    debate: {
      active: false,
      billName: '',
      roundsRemaining: 0,
      opponentPartyId: '',
      log: []
    },
    activeEventId: null,
    seenEvents: [],
    scheduledEvents: [],
    campaignMomentum: scenario.phase === 'campaign' ? 5 : 0,
    achievements: [],
    legacyReport: null,
    settings: {
      fontScale: 1,
      colorBlindMode: false,
      reduceMotion: false
    }
  };
};

export const createInitialGameState = initialState;

const advanceDate = (state: GameState): GameState['currentDate'] => {
  const nextMonth = state.currentDate.month === 12 ? 1 : state.currentDate.month + 1;
  const nextYear = state.currentDate.month === 12 ? state.currentDate.year + 1 : state.currentDate.year;
  return {
    year: nextYear,
    month: nextMonth,
    monthIndex: state.currentDate.monthIndex + 1
  };
};

const calculateHealthScore = (state: GameState): number => {
  const m = state.metrics;
  const economy = clamp(50 + m.economy.gdpGrowth * 4 - m.economy.inflation * 2 - m.economy.unemployment * 1.4);
  const politics = clamp((m.politics.coalitionStability + m.politics.mediaSentiment + m.politics.politicalCapital) / 3);
  const society = clamp(m.society.overallApproval);
  const environment = clamp((100 - m.environment.nitrogenEmissions + m.environment.climatePolicyScore + m.environment.renewableEnergy) / 3);
  return Math.round((economy + politics + society + environment) / 4);
};

export const selectPolitician = (state: GameState, politicianId: string): GameState => {
  const politician = politicianData.find((p) => p.id === politicianId);
  if (!politician) return state;

  const scenario = scenarioData.find((item) => item.id === state.scenarioId) ?? scenarioData[0];
  const seatBase = state.parliamentSeats[politician.party] ?? 12;

  return {
    ...state,
    phase: scenario.phase,
    selectedPoliticianId: politician.id,
    playerParty: politician.party,
    coalition: {
      ...state.coalition,
      partners: [politician.party],
      seatTotal: seatBase,
      round: 1
    },
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        seatsInParliament: seatBase,
        partyPolling: Math.round((seatBase / 150) * 100),
        debateSkill: clamp(state.metrics.politics.debateSkill + Math.round((politician.stats.debateSkill - 50) / 5)),
        mediageniekheid: clamp(state.metrics.politics.mediageniekheid + Math.round((politician.stats.mediaSavvy - 50) / 5))
      },
      society: {
        ...state.metrics.society,
        overallApproval: clamp(state.metrics.society.overallApproval + Math.round((politician.stats.publicTrust - 50) / 4))
      }
    },
    timeline: [
      {
        id: `timeline-start-${politician.id}`,
        monthIndex: state.currentDate.monthIndex,
        title: `${politician.name} enters national leadership race`,
        detail: `${politician.party} becomes your governing base for this run.`,
        impact: 'Leadership profile now drives political capital and debate performance.'
      },
      ...state.timeline
    ]
  };
};

export const getActiveEvent = (state: GameState): DynamicEvent | null => getEventById(state.activeEventId);

const appendTrend = (state: GameState): GameState => {
  const health = calculateHealthScore(state);
  return {
    ...state,
    trend: [
      ...state.trend,
      {
        monthIndex: state.currentDate.monthIndex,
        polling: state.metrics.politics.partyPolling,
        approval: state.metrics.society.overallApproval,
        health
      }
    ].slice(-24)
  };
};

const applyEventChoiceEffects = (state: GameState, choice: EventChoice): GameState => {
  const effects = choice.effects;
  const beforeSpend = spendPoliticalCapital(state, choice.pkCost);

  const updated = {
    ...beforeSpend,
    metrics: {
      ...beforeSpend.metrics,
      economy: {
        ...beforeSpend.metrics.economy,
        nationalDebt: clamp(Number((beforeSpend.metrics.economy.nationalDebt + (effects.debt ?? 0)).toFixed(1)), 0, 180)
      },
      society: {
        ...beforeSpend.metrics.society,
        overallApproval: clamp(beforeSpend.metrics.society.overallApproval + (effects.approval ?? 0))
      },
      politics: {
        ...beforeSpend.metrics.politics,
        coalitionStability: clamp(beforeSpend.metrics.politics.coalitionStability + (effects.stability ?? 0)),
        mediaSentiment: clamp(beforeSpend.metrics.politics.mediaSentiment + (effects.media ?? 0)),
        partyPolling: clamp(beforeSpend.metrics.politics.partyPolling + (effects.polling ?? 0))
      },
      environment: {
        ...beforeSpend.metrics.environment,
        climatePolicyScore: clamp(beforeSpend.metrics.environment.climatePolicyScore + (effects.climate ?? 0))
      }
    }
  };

  return updateRelationshipsFromDecision(
    updated,
    (effects.faction ?? {}) as Partial<Record<FactionName, number>>,
    (effects.segments ?? {}) as Partial<Record<SegmentName, number>>
  );
};

export const applyChoice = (state: GameState, choiceId: string): GameState => {
  const event = getActiveEvent(state);
  if (!event) return state;

  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) return state;

  if (!canAffordPoliticalCapital(state, choice.pkCost)) {
    return {
      ...state,
      timeline: [
        {
          id: `timeline-pk-block-${event.id}`,
          monthIndex: state.currentDate.monthIndex,
          title: 'Decision blocked by low Politiek Kapitaal',
          detail: `You need ${choice.pkCost} PK to execute ${choice.label}.`,
          impact: 'Build capital through debates and coalition discipline.'
        },
        ...state.timeline
      ]
    };
  }

  let next = applyEventChoiceEffects(state, choice);
  next = scheduleFollowUp(next, event);

  next = {
    ...next,
    seenEvents: [...next.seenEvents, event.id],
    activeEventId: null,
    metrics: {
      ...next.metrics,
      politics: {
        ...next.metrics.politics,
        daysUntilElection: Math.max(0, next.metrics.politics.daysUntilElection - 30)
      }
    },
    currentDate: advanceDate(next),
    timeline: [
      {
        id: `timeline-choice-${event.id}-${choice.id}`,
        monthIndex: next.currentDate.monthIndex,
        title: event.title,
        detail: choice.label,
        impact: `PK -${choice.pkCost}, approval ${choice.effects.approval ?? 0 >= 0 ? '+' : ''}${choice.effects.approval ?? 0}, stability ${choice.effects.stability ?? 0 >= 0 ? '+' : ''}${choice.effects.stability ?? 0}`
      },
      ...next.timeline
    ]
  };

  next = runMonthlyEconomyTick(next);
  next = applyMonthlyPoliticalCapitalFlow(next);
  next = advanceActiveEvent(next);

  return appendTrend(next);
};

export const callElection = (state: GameState): GameState => ({
  ...state,
  phase: 'election-night'
});

export const tickElectionNight = (state: GameState): GameState => {
  const totalSeats = 150;
  const seatEntries = Object.entries(state.parliamentSeats).filter(([key]) => key !== 'Others');
  const scoreBoost = state.metrics.politics.partyPolling / 100;

  const weighted = seatEntries.map(([partyId, seats]) => {
    const isPlayer = partyId === state.playerParty;
    const modifier = isPlayer ? 1 + scoreBoost * 0.5 + state.campaignMomentum * 0.01 : 1 - scoreBoost * 0.12;
    return { partyId, score: Math.max(0.8, seats * modifier) };
  });

  const totalScore = weighted.reduce((sum, row) => sum + row.score, 0);
  const nextSeats: Record<string, number> = {};

  let allocated = 0;
  weighted.forEach((row) => {
    const share = row.score / totalScore;
    const seatCount = Math.floor(share * totalSeats);
    nextSeats[row.partyId] = seatCount;
    allocated += seatCount;
  });

  const sortedByRemainder = weighted
    .map((row) => {
      const exact = (row.score / totalScore) * totalSeats;
      return { partyId: row.partyId, remainder: exact - Math.floor(exact) };
    })
    .sort((a, b) => b.remainder - a.remainder);

  let idx = 0;
  while (allocated < totalSeats) {
    nextSeats[sortedByRemainder[idx % sortedByRemainder.length].partyId] += 1;
    allocated += 1;
    idx += 1;
  }

  const playerSeats = state.playerParty ? nextSeats[state.playerParty] ?? 0 : 0;

  let next: GameState = {
    ...state,
    phase: 'coalition',
    parliamentSeats: nextSeats,
    coalition: {
      ...state.coalition,
      round: 1,
      partners: state.playerParty ? [state.playerParty] : [],
      seatTotal: playerSeats,
      deals: []
    },
    campaignMomentum: 0,
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        seatsInParliament: playerSeats,
        partyPolling: Math.round((playerSeats / 150) * 100),
        daysUntilElection: 1460,
        coalitionStability: clamp(state.metrics.politics.coalitionStability - 4)
      }
    },
    timeline: [
      {
        id: `timeline-election-${state.currentDate.monthIndex}`,
        monthIndex: state.currentDate.monthIndex,
        title: 'Election Night Results',
        detail: `Your party secured ${playerSeats} seats in the Tweede Kamer.`,
        impact: 'New coalition arithmetic now determines your governing path.'
      },
      ...state.timeline
    ]
  };

  next = advanceActiveEvent(next);
  return appendTrend(next);
};

export const beginCampaign = (state: GameState): GameState => ({
  ...state,
  phase: 'campaign',
  timeline: [
    {
      id: `timeline-campaign-${state.currentDate.monthIndex}`,
      monthIndex: state.currentDate.monthIndex,
      title: 'Campaign Phase Begins',
      detail: 'National campaign enters final sprint.',
      impact: 'Debate and media actions now heavily impact polling.'
    },
    ...state.timeline
  ]
});

export const applyCampaignAction = (state: GameState, action: 'debate' | 'ground' | 'tv'): GameState => {
  const momentumDelta = action === 'tv' ? 5 : action === 'debate' ? 4 : 3;
  const mediaDelta = action === 'tv' ? 7 : action === 'debate' ? 4 : 2;
  const approvalDelta = action === 'ground' ? 2 : 1;

  let next: GameState = {
    ...state,
    campaignMomentum: clamp(state.campaignMomentum + momentumDelta, 0, 20),
    currentDate: advanceDate(state),
    metrics: {
      ...state.metrics,
      politics: {
        ...state.metrics.politics,
        mediaSentiment: clamp(state.metrics.politics.mediaSentiment + mediaDelta),
        partyPolling: clamp(state.metrics.politics.partyPolling + Math.round(momentumDelta / 2)),
        daysUntilElection: Math.max(0, state.metrics.politics.daysUntilElection - 14)
      },
      society: {
        ...state.metrics.society,
        overallApproval: clamp(state.metrics.society.overallApproval + approvalDelta)
      }
    },
    timeline: [
      {
        id: `timeline-campaign-action-${state.currentDate.monthIndex}-${action}`,
        monthIndex: state.currentDate.monthIndex,
        title: `Campaign action: ${action}`,
        detail: 'Public engagement and media operations executed.',
        impact: `Momentum +${momentumDelta}, media ${mediaDelta >= 0 ? '+' : ''}${mediaDelta}`
      },
      ...state.timeline
    ]
  };

  next = runMonthlyEconomyTick(next);
  next = applyMonthlyPoliticalCapitalFlow(next);

  if (next.metrics.politics.daysUntilElection <= 0) {
    next = callElection(next);
  }

  return appendTrend(next);
};

export const setScenario = (state: GameState, scenarioId: string): GameState => ({
  ...state,
  scenarioId
});

export const setDifficulty = (state: GameState, difficulty: Difficulty): GameState => ({
  ...state,
  difficulty
});

export const setLanguage = (state: GameState, language: GameState['language']): GameState => ({
  ...state,
  language
});

export const setAccessibility = (
  state: GameState,
  nextSettings: Partial<GameState['settings']>
): GameState => ({
  ...state,
  settings: {
    ...state.settings,
    ...nextSettings
  }
});

export const saveToSlot = (state: GameState, slotId: SaveSlot['id'], slotName?: string): void => {
  const payload = {
    ...state,
    savedAt: new Date().toISOString(),
    saveMeta: {
      slotId,
      slotName: slotName ?? saveSlots.find((slot) => slot.id === slotId)?.name ?? slotId
    }
  };

  localStorage.setItem(`${STORAGE_PREFIX}-${slotId}`, JSON.stringify(payload));
};

export const loadFromSlot = (slotId: SaveSlot['id']): GameState | null => {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}-${slotId}`);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.version || parsed.version < 2) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const listSlotMeta = (): Array<SaveSlot & { hasData: boolean }> =>
  saveSlots.map((slot) => {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${slot.id}`);
    if (!raw) {
      return { ...slot, hasData: false };
    }

    try {
      const parsed = JSON.parse(raw) as { savedAt?: string; saveMeta?: { slotName?: string } };
      return {
        ...slot,
        name: parsed.saveMeta?.slotName ?? slot.name,
        updatedAt: parsed.savedAt ?? null,
        hasData: true
      };
    } catch {
      return { ...slot, hasData: false };
    }
  });

export const deleteSlot = (slotId: SaveSlot['id']): void => {
  localStorage.removeItem(`${STORAGE_PREFIX}-${slotId}`);
};

export const resetGame = (): GameState => createInitialGameState();

export const initializeRun = (difficulty: Difficulty, scenarioId: string): GameState => {
  const seeded = createInitialGameState(difficulty, scenarioId);
  return advanceActiveEvent(seeded);
};
