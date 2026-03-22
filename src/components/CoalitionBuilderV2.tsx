import parties from '../data/parties.json';
import { audio } from '../systems/audio';
import type { CoalitionOffer, GameState, Party } from '../types/game';

interface CoalitionBuilderV2Props {
  state: GameState;
  onPropose: (partyId: string, offer: CoalitionOffer) => void;
  onFinalize: () => void;
  onSnapElection: () => void;
}

const partyData = parties as Party[];

const offers: CoalitionOffer[] = [
  { ministries: 1, concessions: 1, budgetPromise: 1 },
  { ministries: 2, concessions: 2, budgetPromise: 2 },
  { ministries: 3, concessions: 3, budgetPromise: 3 }
];

export function CoalitionBuilderV2({ state, onPropose, onFinalize, onSnapElection }: CoalitionBuilderV2Props) {
  const seatEntries = partyData
    .map((party) => ({
      id: party.id,
      name: party.name,
      seats: state.parliamentSeats[party.id] ?? 0,
      inCoalition: state.coalition.partners.includes(party.id)
    }))
    .sort((a, b) => b.seats - a.seats);

  const cumulative = seatEntries.reduce<number[]>((acc, entry) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(prev + entry.seats);
    return acc;
  }, []);

  return (
    <section className="intel-card coalition-builder-v2">
      <header className="intel-card-header">
        <h3>Coalition Formation Chamber</h3>
        <p>
          Round {state.coalition.round} · Seats {state.coalition.seatTotal}/150 · Majority at 76
        </p>
      </header>

      <div className="parliament-semicircle" role="img" aria-label="Semicircle parliament coalition visual">
        {seatEntries.map((entry, idx) => {
          const pct = Math.max(1.5, (entry.seats / 150) * 100);
          return (
            <div
              key={entry.id}
              className={`parliament-segment ${entry.inCoalition ? 'in-coalition' : ''}`}
              style={{ width: `${pct}%`, order: idx }}
              title={`${entry.id} ${entry.seats} seats`}
            />
          );
        })}
      </div>

      <div className="coalition-seat-list">
        {seatEntries.map((entry, idx) => (
          <article key={entry.id} className={`coalition-seat-row ${entry.inCoalition ? 'active' : ''}`}>
            <div>
              <strong>
                {entry.id} ({entry.seats})
              </strong>
              <p>{entry.name}</p>
              <small>Cumulative chamber index: {cumulative[idx]}</small>
            </div>

            {entry.inCoalition ? (
              <span className="coalition-badge">In coalition</span>
            ) : (
              <div className="offer-actions">
                {offers.map((offer) => (
                  <button
                    key={`${entry.id}-${offer.ministries}-${offer.concessions}`}
                    type="button"
                    onClick={() => {
                      audio.click();
                      onPropose(entry.id, offer);
                    }}
                  >
                    {offer.ministries}M/{offer.concessions}C/{offer.budgetPromise}B
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="coalition-controls">
        <button type="button" onClick={onFinalize}>
          Finalize Coalition
        </button>
        <button type="button" onClick={onSnapElection}>
          Call Confidence Vote / Snap Election
        </button>
      </div>
    </section>
  );
}
