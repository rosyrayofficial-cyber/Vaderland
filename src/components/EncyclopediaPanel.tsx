import encyclopedia from '../data/encyclopedia.json';

const data = encyclopedia as {
  mechanics: Array<{ title: string; body: string }>;
  parties: Array<{ id: string; note: string }>;
  metrics: Array<{ id: string; affects: string }>;
};

export function EncyclopediaPanel() {
  return (
    <section className="intel-card encyclopedia-panel">
      <header className="intel-card-header">
        <h3>Politieke Gids</h3>
        <p>Reference for parties, systems, and metrics.</p>
      </header>

      <div className="guide-grid">
        <div>
          <h4>Mechanics</h4>
          <ul>
            {data.mechanics.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Parties</h4>
          <ul>
            {data.parties.map((item) => (
              <li key={item.id}>
                <strong>{item.id}</strong>
                <p>{item.note}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Metrics</h4>
          <ul>
            {data.metrics.map((item) => (
              <li key={item.id}>
                <strong>{item.id}</strong>
                <p>{item.affects}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
