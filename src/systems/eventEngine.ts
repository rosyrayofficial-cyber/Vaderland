import events from '../data/events.json';
import type { DynamicEvent, GameState, ScheduledEvent } from '../types/game';

const eventPool = events as DynamicEvent[];

/** Event engine: weighted selection, follow-up scheduling, and anti-repeat behavior. */
export const getEventById = (eventId: string | null): DynamicEvent | null => {
  if (!eventId) return null;
  return eventPool.find((event) => event.id === eventId) ?? null;
};

const rollWeight = (state: GameState, event: DynamicEvent): number => {
  const base = state.seenEvents.includes(event.id) ? 0.1 : 1;

  if (event.category === 'domestic' && state.media.scandalRisk > 45) {
    return base * 1.45;
  }

  if (event.category === 'economic' && state.metrics.economy.budgetBalance < 0) {
    return base * 1.35;
  }

  if (event.category === 'opportunity' && state.metrics.politics.politicalCapital > 60) {
    return base * 1.25;
  }

  return base;
};

const weightedPick = (state: GameState, candidates: DynamicEvent[]): DynamicEvent => {
  const weighted = candidates.map((event) => ({ event, weight: rollWeight(state, event) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  const draw = Math.random() * total;

  let cursor = 0;
  for (const item of weighted) {
    cursor += item.weight;
    if (draw <= cursor) {
      return item.event;
    }
  }

  return candidates[0];
};

export const getDueScheduledEvents = (state: GameState): ScheduledEvent[] =>
  state.scheduledEvents.filter((item) => item.dueMonthIndex <= state.currentDate.monthIndex);

export const advanceActiveEvent = (state: GameState): GameState => {
  const due = getDueScheduledEvents(state);

  if (due.length > 0) {
    const picked = due[0];
    return {
      ...state,
      activeEventId: picked.eventId,
      scheduledEvents: state.scheduledEvents.filter((item) => item !== picked)
    };
  }

  const unseenCandidates = eventPool.filter((event) => !state.seenEvents.includes(event.id));
  const pool = unseenCandidates.length > 0 ? unseenCandidates : eventPool;
  const next = weightedPick(state, pool);

  return {
    ...state,
    activeEventId: next.id
  };
};

export const scheduleFollowUp = (state: GameState, event: DynamicEvent): GameState => {
  if (!event.followUpAfterMonths || !event.followUpEventId) {
    return state;
  }

  return {
    ...state,
    scheduledEvents: [
      ...state.scheduledEvents,
      {
        eventId: event.followUpEventId,
        dueMonthIndex: state.currentDate.monthIndex + event.followUpAfterMonths
      }
    ]
  };
};
