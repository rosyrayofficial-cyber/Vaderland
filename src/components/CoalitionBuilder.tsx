import { CoalitionBuilderV2 } from './CoalitionBuilderV2';
import type { CoalitionOffer, GameState } from '../types/game';

interface CoalitionBuilderProps {
  state: GameState;
  onPropose: (partyId: string, offer: CoalitionOffer) => void;
  onFormCabinet: () => void;
  onCallElection: () => void;
}

export function CoalitionBuilder({ state, onPropose, onFormCabinet, onCallElection }: CoalitionBuilderProps) {
  return (
    <CoalitionBuilderV2
      state={state}
      onPropose={onPropose}
      onFinalize={onFormCabinet}
      onSnapElection={onCallElection}
    />
  );
}