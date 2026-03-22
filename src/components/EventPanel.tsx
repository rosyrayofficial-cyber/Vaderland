import type { GameEvent } from '../types/game';

interface EventPanelProps {
  event: GameEvent;
  onPick: (choiceIndex: number) => void;
}

export function EventPanel({ event, onPick }: EventPanelProps) {
  return (
    <section className="narrative-panel">
      <header>
        <h2>{event.title}</h2>
        <p>{event.summary}</p>
      </header>

      <article>
        <p>{event.body}</p>
      </article>

      <div className="choice-list">
        {event.choices.map((choice, index) => (
          <button key={choice.label} type="button" className="choice-card" onClick={() => onPick(index)}>
            <h3>{choice.label}</h3>
            <ul>
              {choice.preview.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
    </section>
  );
}