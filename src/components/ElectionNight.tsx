import type { GameState } from '../types/game';

interface ElectionNightProps {
  state: GameState;
  onFinalize: () => void;
}

export function ElectionNight({ state, onFinalize }: ElectionNightProps) {
  const seats = Object.entries(state.parliamentSeats)
    .filter(([party]) => party !== 'Others')
    .sort((a, b) => b[1] - a[1]);

  return (
    <section className="election-night-overlay">
      <header>
        <h2>Election Night</h2>
        <p>Live seat count projection</p>
      </header>

      <div className="election-seat-list">
        {seats.map(([party, value]) => (
          <article key={party}>
            <span>{party}</span>
            <div className="seat-bar">
              <div style={{ width: `${Math.max(2, (value / 150) * 100)}%` }} />
            </div>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <button type="button" onClick={onFinalize}>
        Continue to Coalition Talks
      </button>
    </section>
  );
}
