interface CampaignPanelProps {
  campaignMomentum: number;
  daysUntilElection: number;
  onAction: (action: 'debate' | 'ground' | 'tv') => void;
  onHoldElection: () => void;
}

export function CampaignPanel({ campaignMomentum, daysUntilElection, onAction, onHoldElection }: CampaignPanelProps) {
  return (
    <section className="narrative-panel">
      <header>
        <h2>Election Campaign</h2>
        <p>
          Momentum: {campaignMomentum}/20 · {daysUntilElection} days remaining
        </p>
      </header>

      <div className="choice-list">
        <button type="button" className="choice-card" onClick={() => onAction('debate')}>
          <h3>National TV Debate</h3>
          <p>Boost competence image and moderate media gains.</p>
        </button>

        <button type="button" className="choice-card" onClick={() => onAction('ground')}>
          <h3>Ground Campaign Tour</h3>
          <p>Visit provinces, increase broad approval and grassroots energy.</p>
        </button>

        <button type="button" className="choice-card" onClick={() => onAction('tv')}>
          <h3>Prime-time Media Blitz</h3>
          <p>Maximum media attention, higher volatility.</p>
        </button>
      </div>

      <button type="button" onClick={onHoldElection} className="form-cabinet-btn">
        Hold Election Now
      </button>
    </section>
  );
}