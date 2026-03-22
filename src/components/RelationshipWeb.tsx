import type { GameState } from '../types/game';

interface RelationshipWebProps {
  state: GameState;
}

const relationTone = (value: number): string => {
  if (value >= 25) return 'relation-positive';
  if (value <= -25) return 'relation-negative';
  return 'relation-neutral';
};

export function RelationshipWeb({ state }: RelationshipWebProps) {
  const relationships = Object.entries(state.relationships.byPoliticianId).slice(0, 12);

  return (
    <section className="intel-card relationship-web">
      <header className="intel-card-header">
        <h3>Relationship Web</h3>
        <p>Live trust network across political actors.</p>
      </header>

      <div className="relation-grid">
        {relationships.map(([id, score]) => (
          <article key={id} className={`relation-node ${relationTone(score)}`}>
            <h4>{id}</h4>
            <p>{score}</p>
          </article>
        ))}
      </div>

      <div className="faction-bar-wrap">
        {(Object.entries(state.relationships.factionLoyalty) as Array<[string, number]>).map(([name, value]) => (
          <div key={name} className="faction-row">
            <span>{name}</span>
            <div className="faction-track">
              <div
                className={`faction-fill ${value >= 0 ? 'faction-good' : 'faction-bad'}`}
                style={{ width: `${Math.min(100, Math.abs(value))}%` }}
              />
            </div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
