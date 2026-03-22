export type LanguageCode = 'en' | 'nl';
export type Difficulty = 'Stageplek' | 'Tweede Kamerlid' | 'Formateur' | 'Lijsttrekker';
export type GamePhase = 'selection' | 'coalition' | 'governance' | 'campaign' | 'election-night' | 'legacy';

export type SegmentName =
  | 'Randstad progressives'
  | 'Rural conservatives'
  | 'Elderly (65+)'
  | 'Young voters'
  | 'ZZP/entrepreneurs'
  | 'Migrant communities'
  | 'Public sector workers'
  | 'Vinex suburbanites';

export type FactionName = 'hardliners' | 'moderates' | 'pragmatists';

export type MediaOutlet =
  | 'NOS'
  | 'RTL Nieuws'
  | 'De Telegraaf'
  | 'De Volkskrant'
  | 'Follow the Money'
  | 'GeenStijl';

export type DebateStrategy = 'emotion' | 'data' | 'attack' | 'consensus' | 'deflect';

export interface Politician {
  id: string;
  name: string;
  party: string;
  portrait: {
    neutral: string;
    concerned: string;
    angry: string;
    pleased: string;
  };
  bio: string;
  stats: {
    charisma: number;
    ideologyScore: number;
    partyLoyalty: number;
    publicTrust: number;
    mediaRelations: number;
    debateSkill: number;
    mediaSavvy: number;
  };
}

export interface Party {
  id: string;
  name: string;
  color: string;
  baseSeats: number;
  ideology: {
    leftRight: number;
    progressiveConservative: number;
  };
  coalitionWillingness: number;
  hiddenPriority: string;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  phase: Extract<GamePhase, 'coalition' | 'governance' | 'campaign'>;
  daysUntilElection: number;
  coalitionStability: number;
  overallApproval: number;
  mediaSentiment: number;
  politicalCapital: number;
}

export interface SegmentState {
  approval: number;
  volatility: number;
  topIssues: [string, string, string];
}

export interface EconomyState {
  gdpGrowth: number;
  unemployment: number;
  inflation: number;
  nationalDebt: number;
  housingAffordability: number;
  budgetBalance: number;
  creditRating: number;
  spending: {
    zorg: number;
    onderwijs: number;
    defensie: number;
    infrastructuur: number;
    socialeZekerheid: number;
  };
  taxes: {
    incomeLow: number;
    incomeMid: number;
    incomeHigh: number;
    corporate: number;
    wealth: number;
  };
}

export interface SocietyState {
  overallApproval: number;
  segments: Record<SegmentName, SegmentState>;
}

export interface PoliticsState {
  coalitionStability: number;
  partyPolling: number;
  seatsInParliament: number;
  daysUntilElection: number;
  mediaSentiment: number;
  politicalCapital: number;
  debateSkill: number;
  mediageniekheid: number;
  confidenceDebt: number;
}

export interface EnvironmentState {
  nitrogenEmissions: number;
  climatePolicyScore: number;
  renewableEnergy: number;
}

export interface MetricsState {
  economy: EconomyState;
  society: SocietyState;
  politics: PoliticsState;
  environment: EnvironmentState;
}

export interface CoalitionOffer {
  ministries: number;
  concessions: number;
  budgetPromise: number;
}

export interface CoalitionDeal {
  partyId: string;
  accepted: boolean;
  score: number;
  revealedPriority?: string;
  offer: CoalitionOffer;
  note: string;
}

export interface CoalitionState {
  round: 1 | 2 | 3;
  partners: string[];
  seatTotal: number;
  minorityGovernment: boolean;
  deals: CoalitionDeal[];
  agreementTracker: Record<string, { promised: number; delivered: number }>;
}

export interface EventChoice {
  id: string;
  label: string;
  pkCost: number;
  preview: string[];
  effects: {
    approval?: number;
    stability?: number;
    media?: number;
    debt?: number;
    climate?: number;
    polling?: number;
    faction?: Partial<Record<FactionName, number>>;
    segments?: Partial<Record<SegmentName, number>>;
  };
}

export interface DynamicEvent {
  id: string;
  category: 'economic' | 'international' | 'environment' | 'domestic' | 'opportunity';
  title: string;
  summary: string;
  body: string;
  followUpAfterMonths?: number | null;
  followUpEventId?: string | null;
  choices: EventChoice[];
}

export interface ScheduledEvent {
  eventId: string;
  dueMonthIndex: number;
}

export interface RelationshipState {
  byPoliticianId: Record<string, number>;
  factionLoyalty: Record<FactionName, number>;
}

export interface ProvinceApproval {
  name: string;
  approval: number;
}

export interface TrendPoint {
  monthIndex: number;
  polling: number;
  approval: number;
  health: number;
}

export interface DebateState {
  active: boolean;
  billName: string;
  roundsRemaining: number;
  opponentPartyId: string;
  lastPlayerMove?: DebateStrategy;
  log: string[];
}

export interface MediaFrameState {
  outlets: Record<MediaOutlet, number>;
  scandalRisk: number;
  activeScandals: string[];
}

export interface TimelineEntry {
  id: string;
  monthIndex: number;
  title: string;
  detail: string;
  impact: string;
}

export interface LegacyReport {
  headline: string;
  verdict: string;
  finalHealth: number;
  yearsInOffice: number;
}

export interface AccessibilitySettings {
  fontScale: number;
  colorBlindMode: boolean;
  reduceMotion: boolean;
}

export interface SaveSlot {
  id: 'slot-1' | 'slot-2' | 'slot-3';
  name: string;
  updatedAt: string | null;
}

export interface GameState {
  version: number;
  language: LanguageCode;
  difficulty: Difficulty;
  phase: GamePhase;
  scenarioId: string;
  currentDate: {
    year: number;
    month: number;
    monthIndex: number;
  };
  selectedPoliticianId: string | null;
  playerParty: string | null;
  parliamentSeats: Record<string, number>;
  coalition: CoalitionState;
  metrics: MetricsState;
  relationships: RelationshipState;
  media: MediaFrameState;
  provinces: ProvinceApproval[];
  trend: TrendPoint[];
  timeline: TimelineEntry[];
  debate: DebateState;
  activeEventId: string | null;
  seenEvents: string[];
  scheduledEvents: ScheduledEvent[];
  campaignMomentum: number;
  achievements: string[];
  legacyReport: LegacyReport | null;
  settings: AccessibilitySettings;
}
