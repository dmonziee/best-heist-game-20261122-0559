// Sound, synthesized with the Web Audio API — no audio files, no network.
// The context is created lazily on the first user gesture, so a page that
// never gets a key press stays silent and never errors.

let context = null;
let muted = false;

function ensureContext() {
  if (context) return context;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  } catch {
    context = null;
  }
  return context;
}

function tone(freq, seconds, type, gain, when = 0) {
  const ctx = ensureContext();
  if (!ctx || muted) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ctx.currentTime + when);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + seconds);
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + seconds);
}

export function unlockAudio() {
  ensureContext();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function soundClick() {
  tone(620, 0.07, 'triangle', 0.05);
}

export function soundPickup() {
  tone(880, 0.12, 'sine', 0.08);
  tone(1318, 0.18, 'sine', 0.07, 0.09);
}

export function soundSmoke() {
  tone(220, 0.25, 'sawtooth', 0.04);
}

export function soundEmp() {
  tone(1400, 0.3, 'square', 0.04);
  tone(700, 0.3, 'square', 0.04, 0.08);
}

export function soundSpotted() {
  tone(330, 0.15, 'square', 0.05);
  tone(330, 0.15, 'square', 0.05, 0.18);
}

export function soundCaught() {
  tone(196, 0.5, 'sawtooth', 0.09);
  tone(147, 0.7, 'sawtooth', 0.09, 0.25);
}

export function soundWin() {
  [523, 659, 784, 1046].forEach((freq, i) => tone(freq, 0.22, 'triangle', 0.08, i * 0.13));
}
