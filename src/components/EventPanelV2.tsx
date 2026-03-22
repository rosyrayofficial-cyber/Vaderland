import { useEffect, useMemo, useState } from 'react';
import { audio } from '../systems/audio';
import type { DynamicEvent, EventChoice, Politician } from '../types/game';

interface EventPanelV2Props {
  event: DynamicEvent | null;
  leader: Politician | null;
  canAfford: (choice: EventChoice) => boolean;
  onPick: (choiceId: string) => void;
}

const toneFromEvent = (event: DynamicEvent | null): 'neutral' | 'concerned' | 'angry' | 'pleased' => {
  if (!event) return 'neutral';
  if (event.category === 'opportunity') return 'pleased';
  if (event.category === 'domestic') return 'angry';
  if (event.category === 'environment') return 'concerned';
  return 'neutral';
};

export function EventPanelV2({ event, leader, canAfford, onPick }: EventPanelV2Props) {
  const [typed, setTyped] = useState('');
  const bodyText = event?.body ?? 'No briefing available.';

  useEffect(() => {
    setTyped('');
    let cursor = 0;

    const handle = window.setInterval(() => {
      cursor += 1;
      setTyped(bodyText.slice(0, cursor));
      audio.typeTick();
      if (cursor >= bodyText.length) {
        window.clearInterval(handle);
      }
    }, 18);

    return () => window.clearInterval(handle);
  }, [bodyText]);

  const mood = useMemo(() => toneFromEvent(event), [event]);
  const portrait = leader ? leader.portrait[mood] : '🏛️';

  if (!event) {
    return (
      <section className="intel-card briefing-panel">
        <header className="intel-card-header">
          <h3>Cabinet Briefing</h3>
          <p>Awaiting next policy dossier.</p>
        </header>
      </section>
    );
  }

  return (
    <section className="intel-card briefing-panel">
      <header className="briefing-header">
        <div>
          <small className="seal">Kingdom of the Netherlands - Cabinet Intelligence</small>
          <h3>{event.title}</h3>
          <p>{event.summary}</p>
        </div>

        <div className="minister-portrait" aria-label="Minister portrait">
          <span>{portrait}</span>
          <strong>{leader?.name ?? 'Cabinet Office'}</strong>
          <small>{mood}</small>
        </div>
      </header>

      <article className="briefing-body">
        <p>{typed}</p>
      </article>

      <div className="briefing-choices">
        {event.choices.map((choice) => {
          const affordable = canAfford(choice);
          return (
            <button
              key={choice.id}
              type="button"
              className="briefing-choice"
              disabled={!affordable}
              onClick={() => {
                audio.click();
                onPick(choice.id);
              }}
            >
              <header>
                <h4>{choice.label}</h4>
                <span>PK {choice.pkCost}</span>
              </header>
              <ul>
                {choice.preview.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
              {!affordable ? <small>Not enough Politiek Kapitaal</small> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
