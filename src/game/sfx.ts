/**
 * Tiny synthesized sound set (Web Audio, no files). Silent until
 * `setSoundEnabled(true)` and until `unlockAudio()` has run inside a user
 * gesture, which browsers require before audio can start.
 */
let ctx: AudioContext | null = null;
let enabled = false;

type Wave = OscillatorType;

interface ToneOpts {
  type?: Wave;
  /** Seconds. */
  dur?: number;
  gain?: number;
  /** Seconds from now. */
  at?: number;
  /** Glide to this frequency over the duration. */
  slideTo?: number;
}

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Call from a click/keydown handler so the context is allowed to start. */
export function unlockAudio() {
  const c = getContext();
  if (c && c.state === "suspended") void c.resume();
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on) unlockAudio();
}

export function isSoundEnabled() {
  return enabled;
}

function tone(freq: number, opts: ToneOpts = {}) {
  if (!enabled) return;
  const c = getContext();
  if (!c) return;
  const { type = "square", dur = 0.08, gain = 0.05, at = 0, slideTo } = opts;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  blip: () => tone(880, { dur: 0.06, gain: 0.035 }),
  coin: () => {
    tone(988, { dur: 0.07, gain: 0.045 });
    tone(1319, { dur: 0.09, gain: 0.045, at: 0.06 });
  },
  jump: () => tone(300, { dur: 0.09, gain: 0.04, slideTo: 600 }),
  hurt: () => tone(220, { type: "sawtooth", dur: 0.18, gain: 0.05, slideTo: 110 }),
  unlock: () => {
    tone(523, { type: "triangle", dur: 0.08, gain: 0.05 });
    tone(659, { type: "triangle", dur: 0.08, gain: 0.05, at: 0.07 });
    tone(784, { type: "triangle", dur: 0.12, gain: 0.05, at: 0.14 });
  },
  zone: () => {
    tone(660, { type: "sine", dur: 0.12, gain: 0.05 });
    tone(880, { type: "sine", dur: 0.16, gain: 0.05, at: 0.1 });
  },
  quest: () => {
    tone(523, { type: "triangle", dur: 0.3, gain: 0.04 });
    tone(659, { type: "triangle", dur: 0.3, gain: 0.04 });
    tone(784, { type: "triangle", dur: 0.3, gain: 0.04 });
    tone(1047, { type: "triangle", dur: 0.35, gain: 0.03, at: 0.12 });
  },
  levelUp: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, { type: "square", dur: 0.1, gain: 0.04, at: i * 0.08 })
    );
    tone(1568, { type: "triangle", dur: 0.5, gain: 0.035, at: 0.42 });
  },
  win: () => {
    tone(130, { type: "square", dur: 0.6, gain: 0.03 });
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone(f, { type: "square", dur: 0.1, gain: 0.04, at: i * 0.08 })
    );
    tone(1568, { type: "triangle", dur: 0.6, gain: 0.035, at: 0.42 });
  },
  lose: () => tone(392, { type: "sawtooth", dur: 0.4, gain: 0.05, slideTo: 196 }),
};
