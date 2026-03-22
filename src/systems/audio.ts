import type { GameState } from '../types/game';

let audioContext: AudioContext | null = null;

const ensureContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const beep = (frequency: number, duration = 0.08, volume = 0.03): void => {
  const context = ensureContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
};

/** Audio system: lightweight UI and major-moment stings via WebAudio synthesis. */
export const audio = {
  click() {
    beep(420, 0.04, 0.02);
  },
  typeTick() {
    beep(880, 0.02, 0.01);
  },
  successSting() {
    beep(520, 0.08, 0.035);
    setTimeout(() => beep(780, 0.08, 0.03), 80);
  },
  warningSting() {
    beep(220, 0.1, 0.04);
    setTimeout(() => beep(180, 0.1, 0.035), 100);
  },
  syncAmbience(_state: GameState) {
    // Placeholder hook for dynamic music layers; synthesized stings are active now.
  }
};
