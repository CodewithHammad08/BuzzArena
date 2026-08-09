/**
 * useSound – Plays the buzz sound effect using the Web Audio API.
 * Creates a synthesized buzz tone so no external file is required.
 */

import { useCallback, useRef } from 'react';

export function useSound() {
  const audioCtxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Plays a dramatic buzz/ding sound using oscillators.
   */
  const playBuzz = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;

      // Create a chord-like buzz: fundamental + harmonics
      const frequencies = [220, 440, 660];
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.type = i === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.8);

        oscGain.gain.setValueAtTime(1 / frequencies.length, now);
        osc.start(now);
        osc.stop(now + 0.8);
      });

      // Add a short high ding on top
      const ding = ctx.createOscillator();
      const dingGain = ctx.createGain();
      ding.connect(dingGain);
      dingGain.connect(ctx.destination);
      ding.type = 'sine';
      ding.frequency.setValueAtTime(1200, now);
      ding.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      dingGain.gain.setValueAtTime(0.3, now);
      dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      ding.start(now);
      ding.stop(now + 0.3);
    } catch (err) {
      console.warn('[Sound] Playback failed:', err);
    }
  }, [getCtx]);

  /**
   * Plays a countdown tick.
   */
  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Silent fail
    }
  }, [getCtx]);

  /**
   * Plays a GO sound (higher pitch).
   */
  const playGo = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Silent fail
    }
  }, [getCtx]);

  return { playBuzz, playTick, playGo };
}
