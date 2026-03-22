import parties from '../data/parties.json';
import scenarios from '../data/scenarios.json';
import { politicianData } from '../state/gameState';
import type { Difficulty, Party, ScenarioConfig } from '../types/game';

interface PoliticianSelectionV2Props {
  selectedScenario: string;
  selectedDifficulty: Difficulty;
  onScenario: (scenarioId: string) => void;
  onDifficulty: (difficulty: Difficulty) => void;
  onSelect: (politicianId: string) => void;
}

const partyData = parties as Party[];
const scenarioData = scenarios as ScenarioConfig[];

export function PoliticianSelectionV2({
  selectedScenario,
  selectedDifficulty,
  onScenario,
  onDifficulty,
  onSelect
}: PoliticianSelectionV2Props) {
  return (
    <main className="selection-v2-shell">
      <section className="selection-v2-header intel-card">
        <h1>Vaderland Command Briefing</h1>
        <p>Select scenario, difficulty, and political leadership profile.</p>
      </section>

      <section className="selection-v2-controls intel-card">
        <label>
          Scenario
          <select value={selectedScenario} onChange={(event) => onScenario(event.target.value)}>
            {scenarioData.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty
          <select value={selectedDifficulty} onChange={(event) => onDifficulty(event.target.value as Difficulty)}>
            <option value="Stageplek">Stageplek</option>
            <option value="Tweede Kamerlid">Tweede Kamerlid</option>
            <option value="Formateur">Formateur</option>
            <option value="Lijsttrekker">Lijsttrekker</option>
          </select>
        </label>
      </section>

      <section className="selection-v2-grid">
        {politicianData.map((politician) => {
          const party = partyData.find((item) => item.id === politician.party);

          return (
            <button key={politician.id} type="button" className="candidate-card-v2" onClick={() => onSelect(politician.id)}>
              <header>
                <span className="portrait-large">{politician.portrait.neutral}</span>
                <div>
                  <h2>{politician.name}</h2>
                  <p>{party?.name ?? politician.party}</p>
                </div>
              </header>
              <p>{politician.bio}</p>
              <ul>
                <li>Debate skill: {politician.stats.debateSkill}</li>
                <li>Media savvy: {politician.stats.mediaSavvy}</li>
                <li>Public trust: {politician.stats.publicTrust}</li>
              </ul>
            </button>
          );
        })}
      </section>
    </main>
  );
}
