// Web Audio API Synthesizer for Aviator Crash Game

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try {
    localStorage.setItem('aviator_sound_enabled', enabled ? '1' : '0');
  } catch {
    // Ignore storage issues
  }
}

export function initSoundPreference() {
  try {
    const saved = localStorage.getItem('aviator_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === '1';
    }
  } catch {
    soundEnabled = true;
  }
}

// Engine oscillator for continuous flight
let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;

export function startEngineSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  stopEngineSound();

  try {
    engineOsc = ctx.createOscillator();
    engineGain = ctx.createGain();

    engineOsc.type = 'sawtooth';
    engineOsc.frequency.setValueAtTime(70, ctx.currentTime);

    // Lowpass filter for smooth rumble
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    engineGain.gain.setValueAtTime(0.01, ctx.currentTime);
    engineGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.3);

    engineOsc.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(ctx.destination);

    engineOsc.start();
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export function updateEnginePitch(multiplier: number) {
  if (!soundEnabled || !engineOsc || !audioCtx) return;
  try {
    // Smoothly scale pitch from 70Hz to 350Hz as multiplier climbs
    const targetFreq = Math.min(70 + Math.log(multiplier) * 60, 360);
    engineOsc.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.1);
  } catch {
    // ignore
  }
}

export function stopEngineSound() {
  if (engineOsc && audioCtx) {
    try {
      if (engineGain) {
        engineGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      }
      setTimeout(() => {
        try {
          engineOsc?.stop();
          engineOsc?.disconnect();
          engineOsc = null;
          engineGain = null;
        } catch {
          // ignore
        }
      }, 100);
    } catch {
      engineOsc = null;
      engineGain = null;
    }
  }
}

// Play countdown tick
export function playCountdownTick() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

// Play zone change radar pulse
export function playZoneShift(color: 'RED' | 'BLACK' | 'GREEN') {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';

  const freq = color === 'GREEN' ? 1046.5 : color === 'RED' ? 659.25 : 523.25;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.09, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

// Play Cashout win chime
export function playCashoutSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

    gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.06);
    osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
  });
}

// Play Crash boom & fall
export function playCrashSound() {
  stopEngineSound();
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Sub bass thud
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

// Play Roulette hedge win fanfare
export function playRouletteWin() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880]; // A chord
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

    gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.07);
    osc.stop(ctx.currentTime + idx * 0.07 + 0.4);
  });
}

// Play UI Click
export function playClickSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}
