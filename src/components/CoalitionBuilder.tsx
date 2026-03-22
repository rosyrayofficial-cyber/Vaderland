import { dutchParties } from '../data/parties';
import type { CoalitionOffer, GameState } from '../types/game';

interface CoalitionBuilderProps {
  state: GameState;
  onPropose: (partyId: string, offer: CoalitionOffer) => void;
  onFormCabinet: () => void;
}

const offers: CoalitionOffer[] = [
  { ministries: 1, policyConcessions: 1 },
  { ministries: 2, policyConcessions: 2 },
  { ministries: 3, policyConcessions: 3 }
];

export function CoalitionBuilder({ state, onPropose, onFormCabinet }: CoalitionBuilderProps) {
  const latestDealByParty = Object.fromEntries(state.coalition.lastDeals.map((deal) => [deal.partyId, deal]));

  return (
    <section className="narrative-panel">
      <header>
        <h2>Coalition Formation</h2>
        <p>
          Reach 76 seats to form a cabinet. Current coalition: {state.coalition.seatTotal}/150 seats.
        </p>
      </header>

      <div className="seat-table">
        {dutchParties.map((party) => {
          const seats = state.parliamentSeats[party.id] ?? 0;
          const inCoalition = state.coalition.partners.includes(party.id);
          const latest = latestDealByParty[party.id];

          return (
            <article key={party.id} className={`seat-row ${inCoalition ? 'active' : ''}`}>
              <div>
                <strong>
                  {party.id} ({seats})
                </strong>
                <p>{party.name}</p>
                {latest ? (
                  <small className={latest.accepted ? 'deal-good' : 'deal-bad'}>
                    {latest.accepted ? 'Accepted' : 'Rejected'} · score {latest.score} · {latest.reason}
                  </small>
                ) : null}
              </div>

              {inCoalition ? (
                <span className="tag-good">In coalition</span>
              ) : (
                <div className="offer-row">
                  {offers.map((offer) => (
                    <button
                      key={`${offer.ministries}-${offer.policyConcessions}`}
                      type="button"
                      onClick={() => onPropose(party.id, offer)}
                    >
                      {offer.ministries}M/{offer.policyConcessions}C
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      <button type="button" onClick={onFormCabinet} className="form-cabinet-btn">
        Form Cabinet (Need 76+)
      </button>
    </section>
  );
}