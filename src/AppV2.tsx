import { useEffect, useState } from 'react';
import { CampaignPanelV2 } from './components/CampaignPanelV2';
import { CoalitionBuilderV2 } from './components/CoalitionBuilderV2';
import { Dashboard } from './components/Dashboard';
import { DebatePanel } from './components/DebatePanel';
import { ElectionNight } from './components/ElectionNight';
import { EncyclopediaPanel } from './components/EncyclopediaPanel';
import { EventPanelV2 } from './components/EventPanelV2';
import { MediaPanelV2 } from './components/MediaPanelV2';
import { PoliticianSelectionV2 } from './components/PoliticianSelectionV2';
import { RelationshipWeb } from './components/RelationshipWeb';
import { SaveSlotsPanel } from './components/SaveSlotsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { TimelinePanel } from './components/TimelinePanel';
import {
  applyCampaignAction,
  applyChoice,
  beginCampaign,
  callElection,
  createInitialGameState,
  getActiveEvent,
  initializeRun,
  selectPolitician,
  setAccessibility,
  setDifficulty,
  setLanguage,
  setScenario,
  tickElectionNight
} from './state/gameState';
import { beginDebate } from './systems/debate';
import { audio } from './systems/audio';
import type { CoalitionOffer, Difficulty, GameState, MediaOutlet } from './types/game';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

export function AppV2() {
  const [state, setState] = useState<GameState>(() => createInitialGameState());

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * state.settings.fontScale}px`;
    document.body.dataset.reduceMotion = String(state.settings.reduceMotion);
    document.body.dataset.colorBlind = String(state.settings.colorBlindMode);
  }, [state.settings]);

  const activeEvent = getActiveEvent(state);

  const handleGrantExclusive = (outlet: MediaOutlet) => {
    setState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        outlets: {
          ...prev.media.outlets,
          [outlet]: clamp(prev.media.outlets[outlet] + 4)
        }
      },
      metrics: {
        ...prev.metrics,
        politics: {
          ...prev.metrics.politics,
          mediaSentiment: clamp(prev.metrics.politics.mediaSentiment + 2)
        }
      },
      timeline: [
        {
          id: `timeline-exclusive-${outlet}-${prev.currentDate.monthIndex}`,
          monthIndex: prev.currentDate.monthIndex,
          title: `Media exclusive granted: ${outlet}`,
          detail: 'Framing advantage sought through outlet relationship.',
          impact: 'Short-term media sentiment boost with narrative risk.'
        },
        ...prev.timeline
      ]
    }));
  };

  const canAfford = (choice: { pkCost: number }) => state.metrics.politics.politicalCapital >= choice.pkCost;

  const handleSelect = (politicianId: string) => {
    const seeded = initializeRun(state.difficulty, state.scenarioId);
    setState(selectPolitician(seeded, politicianId));
    audio.successSting();
  };

  const handleChoice = (choiceId: string) => {
    setState((prev) => applyChoice(prev, choiceId));
  };

  const handlePropose = (partyId: string, offer: CoalitionOffer) => {
    setState((prev) => {
      if (prev.coalition.partners.includes(partyId)) {
        return prev;
      }

      const seats = prev.parliamentSeats[partyId] ?? 0;
      const nextSeatTotal = prev.coalition.seatTotal + seats;
      const accepted = nextSeatTotal <= 150 && (offer.concessions + offer.budgetPromise + offer.ministries) >= 3;

      if (!accepted) {
        return {
          ...prev,
          coalition: {
            ...prev.coalition,
            deals: [
              {
                partyId,
                accepted: false,
                score: 42,
                offer,
                note: 'Offer rejected as insufficiently credible.'
              },
              ...prev.coalition.deals
            ].slice(0, 12)
          }
        };
      }

      return {
        ...prev,
        coalition: {
          ...prev.coalition,
          partners: [...prev.coalition.partners, partyId],
          seatTotal: nextSeatTotal,
          deals: [
            {
              partyId,
              accepted: true,
              score: 68,
              revealedPriority: 'Negotiation channel opened',
              offer,
              note: 'Conditional acceptance pending agreement compliance.'
            },
            ...prev.coalition.deals
          ].slice(0, 12),
          agreementTracker: {
            ...prev.coalition.agreementTracker,
            [partyId]: {
              promised: offer.concessions + offer.budgetPromise,
              delivered: Math.max(0, Math.round((offer.concessions + offer.budgetPromise) * 0.4))
            }
          }
        },
        metrics: {
          ...prev.metrics,
          politics: {
            ...prev.metrics.politics,
            coalitionStability: clamp(prev.metrics.politics.coalitionStability + 2),
            politicalCapital: clamp(prev.metrics.politics.politicalCapital - 2)
          }
        }
      };
    });
  };

  const handleFinalizeCoalition = () => {
    setState((prev) => {
      if (prev.coalition.seatTotal < 76) {
        return {
          ...prev,
          metrics: {
            ...prev.metrics,
            politics: {
              ...prev.metrics.politics,
              coalitionStability: clamp(prev.metrics.politics.coalitionStability - 5)
            }
          },
          timeline: [
            {
              id: `timeline-coalition-fail-${prev.currentDate.monthIndex}`,
              monthIndex: prev.currentDate.monthIndex,
              title: 'Coalition majority failed',
              detail: `Current support ${prev.coalition.seatTotal}/150.`,
              impact: 'Confidence pressure rises and election risk increases.'
            },
            ...prev.timeline
          ]
        };
      }

      return {
        ...prev,
        phase: 'governance',
        metrics: {
          ...prev.metrics,
          politics: {
            ...prev.metrics.politics,
            coalitionStability: clamp(prev.metrics.politics.coalitionStability + 8)
          }
        },
        timeline: [
          {
            id: `timeline-cabinet-formed-${prev.currentDate.monthIndex}`,
            monthIndex: prev.currentDate.monthIndex,
            title: 'Cabinet Formed',
            detail: `${prev.coalition.seatTotal} seats secured in coalition agreement.`,
            impact: 'Governance phase unlocked with policy event flow.'
          },
          ...prev.timeline
        ]
      };
    });
  };

  const handleDebateStart = () => {
    setState((prev) => beginDebate(prev, 'National Housing Stabilization Bill', 'VVD'));
  };

  const handleElection = () => {
    setState((prev) => callElection(prev));
  };

  const leaderPortrait = null;

  if (!state.selectedPoliticianId) {
    return (
      <PoliticianSelectionV2
        selectedScenario={state.scenarioId}
        selectedDifficulty={state.difficulty}
        onScenario={(scenarioId) => setState((prev) => setScenario(prev, scenarioId))}
        onDifficulty={(difficulty) => setState((prev) => setDifficulty(prev, difficulty as Difficulty))}
        onSelect={handleSelect}
      />
    );
  }

  return (
    <main className="vaderland-v2-shell">
      <section className="vaderland-v2-left">
        <header className="intel-card top-command-bar">
          <div>
            <h1>Vaderland - Cabinet Intelligence Console</h1>
            <p>
              Phase: {state.phase} · PK {state.metrics.politics.politicalCapital} · Election in{' '}
              {state.metrics.politics.daysUntilElection} days
            </p>
          </div>
          <div className="command-buttons">
            <button type="button" onClick={() => setState(createInitialGameState())}>
              New Run
            </button>
            <button type="button" onClick={() => setState((prev) => beginCampaign(prev))}>
              Start Campaign
            </button>
          </div>
        </header>

        <MediaPanelV2 state={state} onPressConference={() => audio.successSting()} onGrantExclusive={handleGrantExclusive} />

        {state.phase === 'coalition' ? (
          <CoalitionBuilderV2
            state={state}
            onPropose={handlePropose}
            onFinalize={handleFinalizeCoalition}
            onSnapElection={handleElection}
          />
        ) : null}

        {state.phase === 'governance' ? (
          <EventPanelV2
            event={activeEvent}
            leader={leaderPortrait}
            canAfford={canAfford}
            onPick={handleChoice}
          />
        ) : null}

        {state.phase === 'campaign' ? (
          <CampaignPanelV2
            momentum={state.campaignMomentum}
            daysUntilElection={state.metrics.politics.daysUntilElection}
            onAction={(action) => setState((prev) => applyCampaignAction(prev, action))}
            onElection={handleElection}
            onDebate={handleDebateStart}
          />
        ) : null}

        {state.phase === 'election-night' ? <ElectionNight state={state} onFinalize={() => setState((prev) => tickElectionNight(prev))} /> : null}

        <DebatePanel state={state} onState={setState} />
        <TimelinePanel entries={state.timeline} />
      </section>

      <section className="vaderland-v2-right">
        <Dashboard state={state} />
        <RelationshipWeb state={state} />
        <EncyclopediaPanel />
        <SaveSlotsPanel state={state} onLoad={setState} />
        <SettingsPanel
          state={state}
          onLanguage={(language) => setState((prev) => setLanguage(prev, language))}
          onDifficulty={(difficulty) => setState((prev) => setDifficulty(prev, difficulty))}
          onAccessibility={(partial) => setState((prev) => setAccessibility(prev, partial))}
        />
      </section>
    </main>
  );
}
