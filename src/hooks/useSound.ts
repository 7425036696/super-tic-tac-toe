import { useCallback, useRef } from 'react';
import type{ Player } from '../types';

export const useSound = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        ctxRef.current = new Ctx();
      }
    }
    return ctxRef.current;
  };

  const playTone = (
    freq: number, 
    type: OscillatorType, 
    duration: number, 
    startTime: number = 0, 
    vol: number = 0.1
  ) => {
    const ctx = getCtx();
    if (!ctx) return;
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  const playMove = useCallback((player: Player) => {
    // X gets a higher pitch, O gets a lower pitch
    if (player === 'X') {
      playTone(600, 'sine', 0.15); // Clear ping
    } else {
      playTone(400, 'triangle', 0.15); // Softer thud
    }
  }, []);

  const playBoardWin = useCallback((winner: Player | 'D') => {
    if (winner === 'D') {
      playTone(300, 'sawtooth', 0.3);
      return;
    }
    // Ascending arpeggio
    const base = winner === 'X' ? 600 : 400;
    playTone(base, 'sine', 0.1, 0);
    playTone(base * 1.25, 'sine', 0.1, 0.1);
    playTone(base * 1.5, 'sine', 0.2, 0.2);
  }, []);

  const playGameWin = useCallback(() => {
    // Victory fanfare
    const now = 0;
    playTone(523.25, 'square', 0.2, now);      // C5
    playTone(659.25, 'square', 0.2, now + 0.15); // E5
    playTone(783.99, 'square', 0.2, now + 0.30); // G5
    playTone(1046.50, 'square', 0.8, now + 0.45); // C6
  }, []);

  const playError = useCallback(() => {
    playTone(150, 'sawtooth', 0.2);
  }, []);

  return { playMove, playBoardWin, playGameWin, playError };
};