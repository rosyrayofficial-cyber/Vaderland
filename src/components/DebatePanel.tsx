import { playDebateRound } from '../systems/debate';
import type { DebateStrategy, GameState } from '../types/game';

interface DebatePanelProps {
  state: GameState;
  onState: (state: GameState) => void;
}

const strategies: Array<{ id: DebateStrategy; title: string; description: string }> = [
  { id: 'emotion', title: 'Appeal to Emotion', description: 'Narrative and moral framing.' },
  { id: 'data', title: 'Cite Data', description: 'Evidence-heavy and technocratic.' },
  { id: 'attack', title: 'Attack Opponent', description: 'High risk, high volatility.' },
  { id: 'consensus', title: 'Build Consensus', description: 'Moderate broad-chamber strategy.' },
  { id: 'deflect', title: 'Deflect', description: 'Protective but low upside.' }
];

export function DebatePanel({ state, onState }: DebatePanelProps) {
  if (!state.debate.active) {
    return (
      <section className="intel-card debate-panel">
        <header className="intel-card-header">
          <h3>Tweede Kamer Debate</h3>
          <p>No active chamber debate.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="intel-card debate-panel">
      <header className="intel-card-header">
        <h3>Debate: {state.debate.billName}</h3>
        <p>Rounds remaining: {state.debate.roundsRemaining}</p>
      </header>

      <div className="debate-choices">
        {strategies.map((strategy) => (
          <button key={strategy.id} type="button" onClick={() => onState(playDebateRound(state, strategy.id))}>
            <h4>{strategy.title}</h4>
            <p>{strategy.description}</p>
          </button>
        ))}
      </div>

      <div className="debate-log">
        {state.debate.log.slice(-6).map((entry, idx) => (
          <p key={`${entry}-${idx}`}>{entry}</p>
        ))}
      </div>
    </section>
  );
}
