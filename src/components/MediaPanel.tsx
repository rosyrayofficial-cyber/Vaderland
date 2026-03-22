import type { GameState, MediaOutlet } from '../types/game';

interface MediaPanelProps {
  state: GameState;
  onPressConference: () => void;
}

const outlets: MediaOutlet[] = ['NOS', 'RTL', 'Telegraaf', 'De Volkskrant'];

export function MediaPanel({ state, onPressConference }: MediaPanelProps) {
  return (
    <section className="coalition-card">
      <h2>Media & Reputation</h2>
      <p>Scandal risk: {state.scandalRisk}%</p>

      <div className="media-grid">
        {outlets.map((outlet) => (
          <div key={outlet} className="media-row">
            <span>{outlet}</span>
            <strong>{state.mediaByOutlet[outlet]}%</strong>
          </div>
        ))}
      </div>

      {state.scandalsActive.length > 0 ? (
        <ul className="scandal-list">
          {state.scandalsActive.map((scandal) => (
            <li key={scandal}>{scandal}</li>
          ))}
        </ul>
      ) : (
        <p className="no-scandal">No active scandals.</p>
      )}

      <button type="button" className="form-cabinet-btn" onClick={onPressConference}>
        Hold Press Conference
      </button>
    </section>
  );
}