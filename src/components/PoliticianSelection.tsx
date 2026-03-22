import { politicians } from '../data/politicians';
import type { Politician } from '../types/game';

interface PoliticianSelectionProps {
  onSelect: (politician: Politician) => void;
}

export function PoliticianSelection({ onSelect }: PoliticianSelectionProps) {
  return (
    <section className="selection-wrap">
      <div className="selection-header">
        <h1>Vaderland</h1>
        <p>Dutch Parliament Simulator (2025 start)</p>
      </div>

      <div className="selection-grid">
        {politicians.map((politician) => (
          <button
            key={politician.id}
            className="politician-card"
            onClick={() => onSelect(politician)}
            type="button"
          >
            <div className="portrait" aria-hidden>
              {politician.portrait}
            </div>
            <h2>{politician.name}</h2>
            <h3>{politician.party}</h3>
            <p>{politician.bio}</p>

            <ul>
              <li>Charisma: {politician.stats.charisma}</li>
              <li>Ideology: {politician.stats.ideologyScore}</li>
              <li>Party loyalty: {politician.stats.partyLoyalty}</li>
              <li>Public trust: {politician.stats.publicTrust}</li>
              <li>Media relations: {politician.stats.mediaRelations}</li>
            </ul>
          </button>
        ))}
      </div>
    </section>
  );
}