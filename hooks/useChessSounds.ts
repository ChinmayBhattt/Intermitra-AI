"use client";

import { useCallback, useRef } from "react";
import { useGameSettingsStore } from "@/stores/game-settings-store";

type SoundId =
  | "move"
  | "capture"
  | "castle"
  | "promote"
  | "check"
  | "illegal"
  | "gameEnd";

const SOUND_PROFILES: Record<
  SoundId,
  { frequency: number; duration: number; type: OscillatorType; gain: number }
> = {
  move: { frequency: 520, duration: 0.06, type: "sine", gain: 0.08 },
  capture: { frequency: 280, duration: 0.1, type: "square", gain: 0.1 },
  castle: { frequency: 440, duration: 0.12, type: "triangle", gain: 0.09 },
  promote: { frequency: 660, duration: 0.14, type: "sine", gain: 0.1 },
  check: { frequency: 880, duration: 0.18, type: "sawtooth", gain: 0.07 },
  illegal: { frequency: 180, duration: 0.05, type: "square", gain: 0.05 },
  gameEnd: { frequency: 392, duration: 0.35, type: "triangle", gain: 0.12 },
};

export function useChessSounds() {
  const soundEnabled = useGameSettingsStore((s) => s.soundEnabled);
  const soundVolume = useGameSettingsStore((s) => s.soundVolume);
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    async (id: SoundId) => {
      if (!soundEnabled) return;

      const ctx = await ensureContext();
      if (!ctx) return;

      const profile = SOUND_PROFILES[id];
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = profile.type;
      oscillator.frequency.setValueAtTime(profile.frequency, ctx.currentTime);

      const volume = soundVolume * profile.gain;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + profile.duration,
      );

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + profile.duration);
    },
    [ensureContext, soundEnabled, soundVolume],
  );

  return { play };
}
