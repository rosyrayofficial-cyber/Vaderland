import type { TimelineEntry } from '../types/game';

interface TimelinePanelProps {
  entries: TimelineEntry[];
}

export function TimelinePanel({ entries }: TimelinePanelProps) {
  return (
    <section className="intel-card timeline-panel">
      <header className="intel-card-header">
        <h3>Government Timeline</h3>
        <p>Full-term decision trail and impact notes.</p>
      </header>

      <div className="timeline-scroll">
        {entries.length === 0 ? (
          <p className="muted">No major entries yet.</p>
        ) : (
          entries.slice(0, 30).map((entry) => (
            <article key={entry.id} className="timeline-entry">
              <div className="timeline-chip">M{entry.monthIndex}</div>
              <div>
                <h4>{entry.title}</h4>
                <p>{entry.detail}</p>
                <small>{entry.impact}</small>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
