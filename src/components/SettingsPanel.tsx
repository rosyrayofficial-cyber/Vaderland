import type { Difficulty, GameState, LanguageCode } from '../types/game';

interface SettingsPanelProps {
  state: GameState;
  onLanguage: (language: LanguageCode) => void;
  onDifficulty: (difficulty: Difficulty) => void;
  onAccessibility: (partial: Partial<GameState['settings']>) => void;
}

export function SettingsPanel({ state, onLanguage, onDifficulty, onAccessibility }: SettingsPanelProps) {
  return (
    <section className="intel-card settings-panel">
      <header className="intel-card-header">
        <h3>Control Room</h3>
        <p>Language, difficulty, and accessibility.</p>
      </header>

      <div className="settings-grid">
        <label>
          Language
          <select value={state.language} onChange={(event) => onLanguage(event.target.value as LanguageCode)}>
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
          </select>
        </label>

        <label>
          Difficulty
          <select value={state.difficulty} onChange={(event) => onDifficulty(event.target.value as Difficulty)}>
            <option value="Stageplek">Stageplek</option>
            <option value="Tweede Kamerlid">Tweede Kamerlid</option>
            <option value="Formateur">Formateur</option>
            <option value="Lijsttrekker">Lijsttrekker</option>
          </select>
        </label>

        <label>
          Font Scale
          <input
            type="range"
            min={0.9}
            max={1.2}
            step={0.05}
            value={state.settings.fontScale}
            onChange={(event) => onAccessibility({ fontScale: Number(event.target.value) })}
          />
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={state.settings.colorBlindMode}
            onChange={(event) => onAccessibility({ colorBlindMode: event.target.checked })}
          />
          Color-blind mode
        </label>

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={state.settings.reduceMotion}
            onChange={(event) => onAccessibility({ reduceMotion: event.target.checked })}
          />
          Reduce motion
        </label>
      </div>
    </section>
  );
}
