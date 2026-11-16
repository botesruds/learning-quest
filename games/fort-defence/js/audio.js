/* Sound effects and music, all generated in code with the Web Audio API (no audio files). */

let ctx = null, master, sfxBus, musicBus, noiseBuf, verb;
let sfxOn = true, musicOn = true;
const now = () => ctx.currentTime;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    master = ctx.createDynamicsCompressor(); master.threshold.value = -14; master.ratio.value = 4; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxOn ? 0.9 : 0; sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicOn ? 0.32 : 0; musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    verb = makeReverb(1.6);
  }
  if (ctx.state === "suspended") ctx.resume();
  return true;
}
export const audioReady = () => !!ctx && ctx.state === "running";

function makeReverb(sec) {
  const c = ctx.createConvolver(), len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  c.buffer = b; const g = ctx.createGain(); g.gain.value = 0.22; c.connect(g); g.connect(master); return c;
}

export function setSfx(on) { sfxOn = on; if (sfxBus) sfxBus.gain.setTargetAtTime(on ? 0.9 : 0, now(), 0.05); }
export function setMusic(on) { musicOn = on; if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.32 : 0, now(), 0.2); }

/* ---------- building blocks ---------- */
function env(g, t, a, peak, dec, sus = 0.0001) {
  g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(sus, t + a + dec);
}
function tone({ f = 440, f2 = null, type = "sine", t = 0, a = 0.005, peak = 0.3, dec = 0.2, bus = sfxBus, wet = 0, detune = 0 }) {
  if (!ctx) return; const st = now() + t;
  const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, st); o.detune.value = detune;
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, st + a + dec);
  env(g, st, a, peak, dec); o.connect(g); g.connect(bus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); }
  o.start(st); o.stop(st + a + dec + 0.05);
}
function noise({ t = 0, a = 0.003, peak = 0.4, dec = 0.15, type = "lowpass", f = 1200, f2 = null, q = 0.8, bus = sfxBus, wet = 0 }) {
  if (!ctx) return; const st = now() + t;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, st); fl.Q.value = q; if (f2) fl.frequency.exponentialRampToValueAtTime(f2, st + a + dec);
  const g = ctx.createGain(); env(g, st, a, peak, dec);
  s.connect(fl); fl.connect(g); g.connect(bus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); }
  s.start(st, Math.random() * 0.5); s.stop(st + a + dec + 0.05);
}

/* ---------- sound effects ---------- */
const SFX = {
  click() { tone({ f: 900, f2: 600, type: "triangle", peak: 0.15, dec: 0.06 }); },
  hover() { tone({ f: 1200, type: "sine", peak: 0.04, dec: 0.04 }); },
  pickup() { tone({ f: 380, f2: 760, type: "triangle", peak: 0.2, dec: 0.12 }); },
  place() { // chunky block landing: thud + click + dust
    tone({ f: 140, f2: 55, type: "sine", peak: 0.7, dec: 0.18 });
    noise({ f: 900, f2: 200, peak: 0.35, dec: 0.12 });
    tone({ f: 1800, type: "square", peak: 0.05, dec: 0.02, t: 0.005 });
  },
  wood() { tone({ f: 420, f2: 300, type: "triangle", peak: 0.35, dec: 0.08 }); noise({ type: "bandpass", f: 1800, q: 3, peak: 0.25, dec: 0.06 }); },
  stone() { tone({ f: 200, f2: 120, type: "sine", peak: 0.5, dec: 0.12 }); noise({ type: "bandpass", f: 3000, q: 1.5, peak: 0.3, dec: 0.08 }); },
  coin() { tone({ f: 988, type: "square", peak: 0.09, dec: 0.07 }); tone({ f: 1319, type: "square", peak: 0.09, dec: 0.25, t: 0.07, wet: 0.3 }); },
  correct() { [523, 659, 784].forEach((f, i) => tone({ f, type: "triangle", peak: 0.22, dec: 0.25, t: i * 0.07, wet: 0.4 })); },
  wrong() { tone({ f: 330, f2: 260, type: "triangle", peak: 0.2, dec: 0.25 }); tone({ f: 247, f2: 196, type: "triangle", peak: 0.16, dec: 0.3, t: 0.12 }); },
  star() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ f, type: "triangle", peak: 0.2, dec: 0.4, t: i * 0.08, wet: 0.6 })); noise({ type: "highpass", f: 6000, peak: 0.08, dec: 0.8, t: 0.3, wet: 0.5 }); },
  whoosh() { noise({ type: "bandpass", f: 400, f2: 2400, q: 1.2, a: 0.12, peak: 0.25, dec: 0.25 }); },
  zap() { tone({ f: 1600, f2: 200, type: "sawtooth", peak: 0.12, dec: 0.18 }); noise({ type: "highpass", f: 3000, peak: 0.1, dec: 0.1 }); },
  cannon() { tone({ f: 90, f2: 35, type: "sine", peak: 0.9, dec: 0.45 }); noise({ f: 1500, f2: 120, peak: 0.6, dec: 0.5, wet: 0.5 }); },
  arrow() { noise({ type: "bandpass", f: 2600, f2: 900, q: 4, peak: 0.25, dec: 0.12 }); tone({ f: 700, f2: 500, type: "triangle", peak: 0.05, dec: 0.05 }); },
  hit() { tone({ f: 260, f2: 90, type: "square", peak: 0.18, dec: 0.1 }); noise({ f: 2500, peak: 0.25, dec: 0.08 }); },
  pop() { tone({ f: 500, f2: 1400, type: "sine", peak: 0.35, dec: 0.1 }); noise({ type: "highpass", f: 4000, peak: 0.12, dec: 0.15, wet: 0.4 }); },
  crack() { noise({ type: "bandpass", f: 700, q: 2, peak: 0.6, dec: 0.25 }); tone({ f: 110, f2: 60, type: "sawtooth", peak: 0.2, dec: 0.3 }); },
  repair() { [0, 0.12, 0.24].forEach(t => { tone({ f: 600, f2: 420, type: "triangle", peak: 0.25, dec: 0.06, t }); noise({ type: "bandpass", f: 2000, q: 3, peak: 0.2, dec: 0.05, t }); }); },
  freeze() { tone({ f: 1200, f2: 300, type: "sine", a: 0.02, peak: 0.15, dec: 0.5, wet: 0.8 }); noise({ type: "highpass", f: 5000, a: 0.05, peak: 0.1, dec: 0.6, wet: 0.8 }); },
  demon() { tone({ f: 220, f2: 330, type: "square", peak: 0.08, dec: 0.12 }); tone({ f: 330, f2: 196, type: "square", peak: 0.08, dec: 0.16, t: 0.1 }); },
  horn() { [196, 196, 262].forEach((f, i) => tone({ f, type: "sawtooth", a: 0.04, peak: 0.12, dec: i === 2 ? 0.8 : 0.22, t: i * 0.26, wet: 0.5 })); },
  rooster() { [784, 988, 1175, 988].forEach((f, i) => tone({ f, type: "triangle", peak: 0.12, dec: 0.12, t: i * 0.09, wet: 0.4 })); },
};
export function sfx(name) { if (!ctx || !sfxOn) return; try { (SFX[name] || SFX.click)(); } catch (e) {} }
export const SFX_NAMES = Object.keys(SFX);

/* ---------- music: a small step sequencer ---------- */
const N = n => 440 * Math.pow(2, (n - 69) / 12); // midi -> Hz
const SONGS = {
  title: { bpm: 104, swing: 0.08, chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
    lead: [72, null, 76, null, 79, 77, 76, null, 74, null, 72, null, 69, null, 71, null], bass: "root", drums: "soft" },
  day: { bpm: 118, swing: 0.1, chords: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67], [57, 60, 64], [65, 69, 72], [62, 65, 69], [67, 71, 74]],
    lead: [76, null, 74, 76, 79, null, 76, null, 77, 76, 74, null, 72, null, null, null], bass: "bounce", drums: "march" },
  night: { bpm: 96, swing: 0.04, chords: [[57, 60, 64], [53, 57, 60], [55, 58, 62], [52, 56, 59]],
    lead: [69, null, 72, null, 71, null, 68, null, 69, 72, 76, null, 75, null, 71, null], bass: "creep", drums: "spooky" },
};
let seq = null;
export function playMusic(name) {
  if (!ctx) return; if (seq && seq.name === name) return; stopMusic();
  const song = SONGS[name]; if (!song) return;
  const step = 60 / song.bpm / 4; let i = 0, next = now() + 0.1;
  const s = { name, timer: null };
  const tick = () => {
    while (next < now() + 0.25) { schedule(song, i, next, step); next += step * (i % 2 ? 1 - song.swing : 1 + song.swing); i++; }
  };
  s.timer = setInterval(tick, 60); tick(); seq = s;
}
export function stopMusic() { if (seq) { clearInterval(seq.timer); seq = null; } }

function at(t, fn) { const d = t - now(); fn(Math.max(0, d)); }
function schedule(song, i, t, step) {
  const bar = Math.floor(i / 16), s16 = i % 16, ch = song.chords[bar % song.chords.length];
  const T = t - now();
  // pad chord on bar start
  if (s16 === 0) ch.forEach((n, k) => tone({ f: N(n), type: "triangle", a: 0.08, peak: 0.05, dec: step * 15, t: T, bus: musicBus, wet: 0.5, detune: k * 4 - 4 }));
  // bass
  const root = N(ch[0] - 24);
  if (song.bass === "root" && s16 % 8 === 0) tone({ f: root, type: "sine", peak: 0.35, dec: step * 6, t: T, bus: musicBus });
  if (song.bass === "bounce" && s16 % 4 === 0) tone({ f: s16 % 8 ? root * 1.5 : root, type: "triangle", peak: 0.3, dec: step * 2.5, t: T, bus: musicBus });
  if (song.bass === "creep" && [0, 3, 6, 8, 11, 14].includes(s16)) tone({ f: s16 === 14 ? root * Math.pow(2, 1 / 12) : root, type: "square", peak: 0.08, dec: step * 1.5, t: T, bus: musicBus });
  // lead (plucky)
  const ln = song.lead[s16]; if (ln && bar % 2 === 1) tone({ f: N(ln), type: song.drums === "spooky" ? "sine" : "square", peak: song.drums === "spooky" ? 0.1 : 0.05, dec: step * 2.2, t: T, bus: musicBus, wet: 0.5 });
  // drums
  if (song.drums === "march") { if (s16 % 8 === 0) kick(T); if (s16 % 8 === 4) snare(T); if (s16 % 2 === 0) hat(T, 0.04); }
  if (song.drums === "soft") { if (s16 === 0 || s16 === 10) kick(T, 0.4); if (s16 % 4 === 2) hat(T, 0.03); }
  if (song.drums === "spooky") { if (s16 === 0 || s16 === 7) kick(T, 0.5); if (s16 === 12) tone({ f: 1600, type: "sine", peak: 0.05, dec: 0.3, t: T, bus: musicBus, wet: 0.9 }); }
}
function kick(T, v = 0.6) { tone({ f: 120, f2: 40, type: "sine", peak: v, dec: 0.16, t: T, bus: musicBus }); }
function snare(T) { noise({ type: "bandpass", f: 1800, q: 0.7, peak: 0.15, dec: 0.12, t: T, bus: musicBus }); }
function hat(T, v) { noise({ type: "highpass", f: 7000, peak: v, dec: 0.03, t: T, bus: musicBus }); }
