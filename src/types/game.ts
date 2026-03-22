export type DemographicGroup =
  | 'Randstad progressives'
  | 'Rural conservatives'
  | 'Young voters'
  | 'Elderly'
  | 'Immigrants & 2nd generation'
  | 'Entrepreneurs';

export interface Politician {
  id: string;
  name: string;
  party: string;
  portrait: string;
  bio: string;
  stats: {
    charisma: number;
    ideologyScore: number;
    partyLoyalty: number;
    publicTrust: number;
    mediaRelations: number;
  };
}

export interface Party {
  id: string;
  name: string;
  ideology: {
    leftRight: number; // -100 (left) to +100 (right)
    progressiveConservative: number; // -100 (progressive) to +100 (conservative)
  };
  coalitionWillingness: number;
  demographics: string[];
}

export type MediaOutlet = 'NOS' | 'RTL' | 'Telegraaf' | 'De Volkskrant';

export type GamePhase = 'coalition' | 'governance' | 'campaign';

export interface CoalitionOffer {
  ministries: number;
  policyConcessions: number;
}

export interface CoalitionDeal {
  partyId: string;
  accepted: boolean;
  score: number;
  offer: CoalitionOffer;
  reason: string;
}

export interface CoalitionState {
  partners: string[];
  seatTotal: number;
  lastDeals: CoalitionDeal[];
}

export interface TrendHistory {
  polling: number[];
  approval: number[];
}

export interface EconomyMetrics {
  gdpGrowth: number;
  unemployment: number;
  nationalDebt: number;
  inflation: number;
  housingAffordability: number;
}

export interface SocietyMetrics {
  overallApproval: number;
  approvalByDemographic: Record<DemographicGroup, number>;
  immigrationSentiment: number;
  healthcareSatisfaction: number;
  educationScore: number;
}

export interface PoliticsMetrics {
  coalitionStability: number;
  partyPolling: number;
  seatsInParliament: number;
  daysUntilElection: number;
  mediaSentiment: number;
}

export interface EnvironmentMetrics {
  nitrogenEmissions: number;
  climatePolicyScore: number;
  renewableEnergy: number;
}

export interface GameMetrics {
  economy: EconomyMetrics;
  society: SocietyMetrics;
  politics: PoliticsMetrics;
  environment: EnvironmentMetrics;
}

export interface ChoiceEffect {
  label: string;
  apply: (metrics: GameMetrics) => GameMetrics;
  preview: string[];
}

export interface GameEvent {
  id: string;
  title: string;
  summary: string;
  body: string;
  choices: ChoiceEffect[];
}

export interface GameState {
  currentDate: {
    year: number;
    month: number;
  };
  phase: GamePhase;
  playerParty: string | null;
  selectedPoliticianId: string | null;
  activeEventIndex: number;
  eventLog: string[];
  parliamentSeats: Record<string, number>;
  coalition: CoalitionState;
  campaignMomentum: number;
  mediaByOutlet: Record<MediaOutlet, number>;
  scandalRisk: number;
  scandalsActive: string[];
  history: TrendHistory;
  metrics: GameMetrics;
}
