import { useEffect, useMemo, useState } from 'react';
import { CampaignPanel } from './components/CampaignPanel';
import { CoalitionBuilder } from './components/CoalitionBuilder';
import { EventPanel } from './components/EventPanel';
import { Dashboard } from './components/Dashboard';
import { MediaPanel } from './components/MediaPanel';
import { PoliticianSelection } from './components/PoliticianSelection';
import { dutchParties, sampleSeatProjection } from './data/parties';
import { politicians } from './data/politicians';
import {
  applyChoice,
  enterCampaign,
  formCabinet,
  getActiveEvent,
  initialGameState,
  loadGameState,
  pushHistoryPoint,
  resetGame,
  saveGameState,
  selectPolitician
} from './state/gameState';
import { proposeCoalitionDeal } from './systems/coalition';
import { applyCampaignAction, runElection } from './systems/election';
import { applyMediaCycle, holdPressConference } from './systems/media';
import type { CoalitionOffer, GameState, Politician } from './types/game';

export function App() {
  const [gameState, setGameState] = useState<GameState>(() => loadGameState() ?? initialGameState);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const selectedPolitician = useMemo(
    () => politicians.find((p) => p.id === gameState.selectedPoliticianId) ?? null,
    [gameState.selectedPoliticianId]
  );

  const activeEvent = getActiveEvent(gameState);

  const handleSelectPolitician = (politician: Politician) => {
    setGameState(selectPolitician({ ...initialGameState }, politician));
  };

  const handleChoose = (choiceIndex: number) => {
    setGameState((prev: GameState) => pushHistoryPoint(applyMediaCycle(applyChoice(prev, choiceIndex), true)));
  };

  const handleProposeDeal = (partyId: string, offer: CoalitionOffer) => {
    setGameState((prev: GameState) => pushHistoryPoint(applyMediaCycle(proposeCoalitionDeal(prev, partyId, offer), false)));
  };

  const handleFormCabinet = () => {
    setGameState((prev: GameState) => pushHistoryPoint(applyMediaCycle(formCabinet(prev), false)));
  };

  const handleCampaignAction = (action: 'debate' | 'ground' | 'tv') => {
    setGameState((prev: GameState) => pushHistoryPoint(applyMediaCycle(applyCampaignAction(prev, action), true)));
  };

  const handleHoldElection = () => {
    setGameState((prev: GameState) => pushHistoryPoint(applyMediaCycle(runElection(prev), false)));
  };

  const handleBeginCampaign = () => {
    setGameState((prev: GameState) => enterCampaign(prev));
  };

  const handlePressConference = () => {
    setGameState((prev: GameState) => pushHistoryPoint(applyMediaCycle(holdPressConference(prev), false)));
  };

  const handleReset = () => {
    resetGame();
    setGameState(initialGameState);
  };

  if (!selectedPolitician) {
    return <PoliticianSelection onSelect={handleSelectPolitician} />;
  }

  return (
    <main className="game-shell">
      <section className="left-pane">
        <header className="top-strip">
          <div>
            <h1>{selectedPolitician.name}</h1>
            <p>
              {selectedPolitician.party} · Prime Ministerial Candidate · Post-Rutte Era
            </p>
          </div>
          <button type="button" onClick={handleReset}>
            New Run
          </button>
        </header>

        <div className="coalition-card">
          <h2>Parliament Snapshot</h2>
          <p>
            Current projection: {(Object.entries(gameState.parliamentSeats) as Array<[string, number]>)
              .filter(([, seats]) => seats > 1)
              .slice(0, 4)
              .map(([party, seats]) => `${party} ${seats}`)
              .join(' · ')}
          </p>
          <small>
            Phase: {gameState.phase} · Coalition seats: {gameState.coalition.seatTotal}/150 · Election in{' '}
            {gameState.metrics.politics.daysUntilElection} days.
          </small>
        </div>

        <MediaPanel state={gameState} onPressConference={handlePressConference} />

        {gameState.phase === 'coalition' ? (
          <CoalitionBuilder state={gameState} onPropose={handleProposeDeal} onFormCabinet={handleFormCabinet} />
        ) : null}

        {gameState.phase === 'governance' ? <EventPanel event={activeEvent} onPick={handleChoose} /> : null}

        {gameState.phase === 'campaign' ? (
          <CampaignPanel
            campaignMomentum={gameState.campaignMomentum}
            daysUntilElection={gameState.metrics.politics.daysUntilElection}
            onAction={handleCampaignAction}
            onHoldElection={handleHoldElection}
          />
        ) : null}

        {gameState.phase === 'governance' && gameState.metrics.politics.daysUntilElection <= 180 ? (
          <button type="button" className="form-cabinet-btn" onClick={handleBeginCampaign}>
            Start Campaign Phase
          </button>
        ) : null}

        {gameState.phase === 'governance' ? (
          <button type="button" className="form-cabinet-btn" onClick={handleHoldElection}>
            Call Early Election
          </button>
        ) : null}

        <section className="event-log">
          <h2>Political Timeline</h2>
          <ul>
            {[...gameState.eventLog].slice(-6).reverse().map((entry, idx) => (
              <li key={`${entry}-${idx}`}>{entry}</li>
            ))}
          </ul>
        </section>
      </section>

      <Dashboard
        metrics={gameState.metrics}
        year={gameState.currentDate.year}
        month={gameState.currentDate.month}
        trends={gameState.history}
      />

      <footer className="party-footer">
        <span>
          Major Parties Loaded: {dutchParties.map((p) => p.id).join(', ')} · Baseline reference seats:{' '}
          {(Object.values(sampleSeatProjection) as number[]).reduce((sum, seats) => sum + seats, 0)}
        </span>
      </footer>
    </main>
  );
}