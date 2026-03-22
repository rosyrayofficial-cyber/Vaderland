import { audio } from '../systems/audio';

interface CampaignPanelV2Props {
  momentum: number;
  daysUntilElection: number;
  onAction: (action: 'debate' | 'ground' | 'tv') => void;
  onElection: () => void;
  onDebate: () => void;
}

export function CampaignPanelV2({ momentum, daysUntilElection, onAction, onElection, onDebate }: CampaignPanelV2Props) {
  return (
    <section className="intel-card campaign-panel-v2">
      <header className="intel-card-header">
        <h3>Campaign War Room</h3>
        <p>
          Momentum {momentum}/20 · {daysUntilElection} days to election
        </p>
      </header>

      <div className="campaign-actions">
        <button
          type="button"
          onClick={() => {
            audio.click();
            onAction('debate');
          }}
        >
          <h4>National TV Debate Tour</h4>
          <p>Raise competence profile and centrist trust.</p>
        </button>

        <button
          type="button"
          onClick={() => {
            audio.click();
            onAction('ground');
          }}
        >
          <h4>Ground Mobilization</h4>
          <p>Grassroots canvassing across provinces.</p>
        </button>

        <button
          type="button"
          onClick={() => {
            audio.click();
            onAction('tv');
          }}
        >
          <h4>Prime-time Media Blitz</h4>
          <p>Big reach and volatility spike.</p>
        </button>
      </div>

      <div className="campaign-controls">
        <button type="button" onClick={onDebate}>
          Trigger Tweede Kamer Debate Mini-game
        </button>
        <button type="button" onClick={onElection}>
          Hold Election Now
        </button>
      </div>
    </section>
  );
}
