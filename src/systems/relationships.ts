import type { FactionName, GameState, SegmentName } from '../types/game';

const clamp = (value: number, min = -100, max = 100) => Math.max(min, Math.min(max, value));

/** Relationship system: politician trust graph and internal party factions. */
export const updateRelationshipsFromDecision = (
  state: GameState,
  factionDelta: Partial<Record<FactionName, number>>,
  segmentDelta: Partial<Record<SegmentName, number>>
): GameState => {
  const nextFaction = { ...state.relationships.factionLoyalty };

  (Object.keys(factionDelta) as FactionName[]).forEach((faction) => {
    const delta = factionDelta[faction] ?? 0;
    nextFaction[faction] = clamp(Number((nextFaction[faction] + delta).toFixed(1)));
  });

  const nextRelationships = { ...state.relationships.byPoliticianId };
  const aggregateSegmentDelta = Object.values(segmentDelta).reduce((sum, n) => sum + (n ?? 0), 0);
  const relationShift = Math.round(aggregateSegmentDelta / 4);

  Object.keys(nextRelationships).forEach((politicianId) => {
    nextRelationships[politicianId] = clamp(nextRelationships[politicianId] + relationShift);
  });

  return {
    ...state,
    relationships: {
      byPoliticianId: nextRelationships,
      factionLoyalty: nextFaction
    }
  };
};

export const checkFactionRebellion = (state: GameState): { rebelled: boolean; message: string } => {
  const values = Object.values(state.relationships.factionLoyalty);
  const lowCount = values.filter((v) => v < -35).length;

  if (lowCount >= 2) {
    return {
      rebelled: true,
      message: 'Internal rebellion: factions threaten party unity and discipline.'
    };
  }

  return { rebelled: false, message: '' };
};
