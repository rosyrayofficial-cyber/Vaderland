import { audio } from '../systems/audio';
import type { GameState, MediaOutlet } from '../types/game';

interface MediaPanelV2Props {
  state: GameState;
  onPressConference: () => void;
  onGrantExclusive: (outlet: MediaOutlet) => void;
}

const outletLean: Record<MediaOutlet, string> = {
  NOS: 'neutral',
  'RTL Nieuws': 'centrist',
  'De Telegraaf': 'right',
  'De Volkskrant': 'left',
  'Follow the Money': 'investigative',
  GeenStijl: 'populist'
};

export function MediaPanelV2({ state, onPressConference, onGrantExclusive }: MediaPanelV2Props) {
  const outlets = Object.entries(state.media.outlets) as Array<[MediaOutlet, number]>;

  return (
    <section className="intel-card media-panel-v2">
      <header className="intel-card-header">
        <h3>Media Ecosystem</h3>
        <p>Scandal risk {state.media.scandalRisk}% · Outlet framing pressure active.</p>
      </header>

      <div className="media-outlet-grid">
        {outlets.map(([outlet, score]) => (
          <article key={outlet} className="media-outlet-card">
            <div>
              <h4>{outlet}</h4>
              <small>{outletLean[outlet]}</small>
            </div>
            <strong>{score}%</strong>
            <button
              type="button"
              onClick={() => {
                audio.click();
                onGrantExclusive(outlet);
              }}
            >
              Grant Exclusive
            </button>
          </article>
        ))}
      </div>

      {state.media.activeScandals.length > 0 ? (
        <ul className="scandal-feed">
          {state.media.activeScandals.map((scandal) => (
            <li key={scandal}>{scandal}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No active scandals.</p>
      )}

      <button
        type="button"
        onClick={() => {
          audio.click();
          onPressConference();
        }}
      >
        Hold Press Conference
      </button>
    </section>
  );
}
