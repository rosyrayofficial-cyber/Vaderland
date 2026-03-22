import { useMemo, useState } from 'react';
import { deleteSlot, listSlotMeta, loadFromSlot, saveToSlot } from '../state/gameState';
import type { GameState, SaveSlot } from '../types/game';

interface SaveSlotsPanelProps {
  state: GameState;
  onLoad: (state: GameState) => void;
}

export function SaveSlotsPanel({ state, onLoad }: SaveSlotsPanelProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const slots = useMemo(() => listSlotMeta(), [refreshKey]);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  const handleSave = (slotId: SaveSlot['id']) => {
    saveToSlot(state, slotId);
    refresh();
  };

  const handleLoad = (slotId: SaveSlot['id']) => {
    const loaded = loadFromSlot(slotId);
    if (loaded) {
      onLoad(loaded);
    }
  };

  const handleDelete = (slotId: SaveSlot['id']) => {
    deleteSlot(slotId);
    refresh();
  };

  return (
    <section className="intel-card save-slots">
      <header className="intel-card-header">
        <h3>Cabinet Archives</h3>
        <p>Named multi-slot save system.</p>
      </header>

      <div className="slot-grid">
        {slots.map((slot) => (
          <article key={slot.id} className="slot-card">
            <h4>{slot.name}</h4>
            <p>{slot.hasData ? `Updated: ${slot.updatedAt ?? 'Unknown'}` : 'Empty slot'}</p>
            <div className="slot-actions">
              <button type="button" onClick={() => handleSave(slot.id)}>
                Save
              </button>
              <button type="button" disabled={!slot.hasData} onClick={() => handleLoad(slot.id)}>
                Load
              </button>
              <button type="button" disabled={!slot.hasData} onClick={() => handleDelete(slot.id)}>
                Clear
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
