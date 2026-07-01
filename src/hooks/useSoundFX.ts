import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'checkers_sound_v1';

export type SoundName =
  | 'chipClick' | 'chipDrop' | 'chipClink' | 'hover' | 'select'
  | 'move' | 'capture' | 'kingMe' | 'nearWin'
  | 'win' | 'lose' | 'draw'
  | 'jackpot' | 'jackpotMini' | 'jackpotMinor' | 'jackpotMajor' | 'jackpotGrand'
  | 'coin' | 'coinShower' | 'error' | 'missionComplete' | 'skinUnlock' | 'levelUp';

function loadMuted(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
}

export interface UseSoundFXReturn {
  muted: boolean;
  toggleMute: () => void;
  play: (name: SoundName) => void;
  startAmbient: () => void;
  stopAmbient: () => void;
  ambientOn: boolean;
  toggleAmbient: () => void;
}

export function useSoundFX(): UseSoundFXReturn {
  const [muted, setMuted] = useState<boolean>(loadMuted);
  const [ambientOn, setAmbientOn] = useState<boolean>(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode; lfo: OscillatorNode; lfoGain: GainNode }[] | null>(null);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const beep = useCallback((
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gain = 0.15,
    startOffset = 0,
    slideTo?: number
  ) => {
    const t0 = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration);
    }
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }, []);

  // Filtered noise burst — great for chip clatter / coin shower crackle
  const noise = useCallback((
    ctx: AudioContext,
    duration: number,
    filterFreq: number,
    gain = 0.10,
    startOffset = 0
  ) => {
    const t0 = ctx.currentTime + startOffset;
    const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, t0);
    filter.Q.setValueAtTime(6, t0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }, []);

  const play = useCallback((name: SoundName) => {
    if (muted) return;
    const ctx = ensureCtx();
    if (!ctx) return;

    switch (name) {
      case 'chipClick':
        beep(ctx, 880, 0.045, 'square', 0.07);
        break;
      case 'chipDrop':
        beep(ctx, 520, 0.08, 'triangle', 0.13);
        beep(ctx, 260, 0.10, 'triangle', 0.09, 0.02);
        noise(ctx, 0.05, 3200, 0.04, 0.01);
        break;
      case 'chipClink':
        beep(ctx, 1600, 0.04, 'sine', 0.08);
        beep(ctx, 2200, 0.05, 'sine', 0.06, 0.015);
        noise(ctx, 0.04, 4200, 0.03, 0);
        break;
      case 'hover':
        beep(ctx, 1200, 0.025, 'sine', 0.045);
        break;
      case 'select':
        beep(ctx, 700, 0.05, 'triangle', 0.09);
        beep(ctx, 1050, 0.06, 'triangle', 0.06, 0.03);
        break;
      case 'move':
        beep(ctx, 660, 0.06, 'triangle', 0.06);
        noise(ctx, 0.03, 1800, 0.025, 0.01);
        break;
      case 'capture':
        beep(ctx, 220, 0.14, 'sawtooth', 0.14, 0, 90);
        noise(ctx, 0.10, 800, 0.06, 0);
        break;
      case 'kingMe':
        beep(ctx, 740, 0.09, 'triangle', 0.12);
        beep(ctx, 990, 0.11, 'triangle', 0.12, 0.07);
        beep(ctx, 1320, 0.14, 'triangle', 0.12, 0.14);
        beep(ctx, 1760, 0.16, 'triangle', 0.10, 0.22);
        break;
      case 'nearWin':
        // rising suspense tone
        beep(ctx, 400, 0.6, 'sawtooth', 0.06, 0, 900);
        beep(ctx, 402, 0.6, 'sawtooth', 0.05, 0, 902); // detuned for shimmer
        break;
      case 'win':
        [523, 659, 784, 1046].forEach((f, i) => beep(ctx, f, 0.20, 'triangle', 0.14, i * 0.10));
        beep(ctx, 1568, 0.30, 'triangle', 0.12, 0.40);
        break;
      case 'lose':
        beep(ctx, 220, 0.35, 'sawtooth', 0.14, 0, 90);
        beep(ctx, 165, 0.35, 'sawtooth', 0.10, 0.10, 60);
        break;
      case 'draw':
        beep(ctx, 440, 0.20, 'sine', 0.10);
        beep(ctx, 392, 0.20, 'sine', 0.10, 0.15);
        break;
      case 'jackpotMini':
        [700, 900, 1100].forEach((f, i) => beep(ctx, f, 0.10, 'square', 0.10, i * 0.06));
        break;
      case 'jackpotMinor':
        [523, 659, 784, 987].forEach((f, i) => beep(ctx, f, 0.12, 'square', 0.11, i * 0.07));
        break;
      case 'jackpotMajor':
        [392, 493, 587, 784, 987, 1174].forEach((f, i) => beep(ctx, f, 0.14, 'square', 0.11, i * 0.08));
        noise(ctx, 0.3, 5000, 0.05, 0.5);
        break;
      case 'jackpotGrand':
      case 'jackpot':
        for (let i = 0; i < 12; i++) beep(ctx, 400 + i * 90, 0.12, 'square', 0.10, i * 0.07);
        noise(ctx, 0.6, 6000, 0.06, 0);
        noise(ctx, 0.6, 6000, 0.06, 0.35);
        [1046, 1319, 1568, 2093].forEach((f, i) => beep(ctx, f, 0.35, 'triangle', 0.12, 1.0 + i * 0.15));
        break;
      case 'coin':
        beep(ctx, 1400, 0.05, 'sine', 0.12);
        beep(ctx, 2100, 0.07, 'sine', 0.10, 0.02);
        break;
      case 'coinShower':
        for (let i = 0; i < 14; i++) {
          const t = i * 0.05;
          beep(ctx, 1200 + Math.random() * 900, 0.06, 'sine', 0.08, t);
          if (i % 2 === 0) noise(ctx, 0.04, 3500, 0.03, t);
        }
        break;
      case 'error':
        beep(ctx, 180, 0.15, 'square', 0.10);
        break;
      case 'missionComplete':
        [660, 880, 1108, 1479].forEach((f, i) => beep(ctx, f, 0.12, 'triangle', 0.11, i * 0.08));
        break;
      case 'skinUnlock':
        [523, 784, 1046, 1568].forEach((f, i) => beep(ctx, f, 0.14, 'sine', 0.10, i * 0.10));
        break;
      case 'levelUp':
        [523, 659, 784, 1046, 1319, 1568].forEach((f, i) => beep(ctx, f, 0.16, 'triangle', 0.13, i * 0.09));
        noise(ctx, 0.4, 4500, 0.05, 0);
        break;
    }
  }, [muted, ensureCtx, beep, noise]);

  const startAmbient = useCallback(() => {
    if (muted) return;
    if (ambientNodesRef.current) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    // Two detuned low pads + gentle LFO for shimmer — evokes a distant casino floor
    const freqs = [110, 165];
    const nodes = freqs.map(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 2.5);
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12 + Math.random() * 0.15, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      lfo.start();
      return { osc, gain, lfo, lfoGain };
    });
    ambientNodesRef.current = nodes;
    setAmbientOn(true);
  }, [muted, ensureCtx]);

  const stopAmbient = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = ambientNodesRef.current;
    if (!ctx || !nodes) { setAmbientOn(false); return; }
    const t = ctx.currentTime;
    nodes.forEach(({ osc, gain, lfo }) => {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 1.2);
      osc.stop(t + 1.3);
      lfo.stop(t + 1.3);
    });
    ambientNodesRef.current = null;
    setAmbientOn(false);
  }, []);

  const toggleAmbient = useCallback(() => {
    if (ambientOn) stopAmbient();
    else startAmbient();
  }, [ambientOn, startAmbient, stopAmbient]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      if (next) {
        // muting also stops ambient
        stopAmbient();
      }
      return next;
    });
  }, [stopAmbient]);

  useEffect(() => {
    return () => {
      if (ambientNodesRef.current) {
        ambientNodesRef.current.forEach(({ osc, lfo }) => { try { osc.stop(); lfo.stop(); } catch { /* ignore */ } });
        ambientNodesRef.current = null;
      }
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { muted, toggleMute, play, startAmbient, stopAmbient, ambientOn, toggleAmbient };
}
