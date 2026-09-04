export type GameSound = "success" | "xp" | "trophy" | "level-up" | "streak";

type Note = readonly [frequency: number, delay: number, duration: number];

const SOUND_NOTES: Record<GameSound, readonly Note[]> = {
  success: [
    [440, 0, 0.07],
    [660, 0.08, 0.1],
  ],
  xp: [
    [880, 0, 0.06],
    [1175, 0.07, 0.09],
  ],
  trophy: [
    [523, 0, 0.1],
    [659, 0.11, 0.1],
    [784, 0.22, 0.16],
  ],
  "level-up": [
    [82, 0, 0.2],
    [82, 0.22, 0.16],
    [98, 0.42, 0.2],
    [110, 0.65, 0.34],
    [82, 1.02, 0.15],
    [123, 1.2, 0.18],
    [147, 1.42, 0.48],
    [294, 1.45, 0.52],
  ],
  streak: [
    [220, 0, 0.08],
    [330, 0.08, 0.08],
    [440, 0.16, 0.14],
  ],
};

let enabled = true;
let audioContext: AudioContext | undefined;

export function setSoundEffectsEnabled(next: boolean) {
  enabled = next;
}

function scheduleSound(context: AudioContext, sound: GameSound, volume = 0.035) {
  const start = context.currentTime + 0.01;

  SOUND_NOTES[sound].forEach(([frequency, delay, duration], index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + delay;
    const noteEnd = noteStart + duration;

    oscillator.type =
      sound === "level-up"
        ? index % 3 === 0
          ? "sawtooth"
          : "square"
        : index % 2 === 0
          ? "square"
          : "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(volume, noteStart + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd + 0.02);
  });
}

export function playGameSound(sound?: GameSound) {
  if (!enabled || !sound || typeof window === "undefined" || document.hidden) return;

  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "running") {
      scheduleSound(audioContext, sound);
      return;
    }
    void audioContext.resume().then(() => scheduleSound(audioContext!, sound));
  } catch {
    // L'app resta completamente utilizzabile se il browser blocca Web Audio.
  }
}
