"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Color } from "chess.js";
import type { TimeControl } from "@/lib/chess/constants";

export type ClockState = {
  whiteMs: number;
  blackMs: number;
  activeColor: Color;
  isRunning: boolean;
  isPaused: boolean;
};

export function useChessClock(
  timeControl: TimeControl,
  isPlaying: boolean,
  turn: Color,
  onTimeout: (color: Color) => void,
) {
  const [clocks, setClocks] = useState<ClockState>(() => ({
    whiteMs: timeControl.initialMs,
    blackMs: timeControl.initialMs,
    activeColor: "w",
    isRunning: false,
    isPaused: false,
  }));

  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const isUnlimited = !Number.isFinite(timeControl.initialMs);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    lastTickRef.current = null;
    setClocks({
      whiteMs: timeControl.initialMs,
      blackMs: timeControl.initialMs,
      activeColor: "w",
      isRunning: !isUnlimited,
      isPaused: false,
    });
  }, [timeControl.initialMs, isUnlimited]);

  const pause = useCallback(() => {
    setClocks((prev) => ({ ...prev, isPaused: true, isRunning: false }));
    lastTickRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (isUnlimited || !isPlaying) return;
    setClocks((prev) => ({ ...prev, isPaused: false, isRunning: true }));
  }, [isPlaying, isUnlimited]);

  const switchTurn = useCallback(
    (movedColor: Color, incrementMs: number) => {
      if (isUnlimited) {
        setClocks((prev) => ({ ...prev, activeColor: movedColor === "w" ? "b" : "w" }));
        return;
      }

      setClocks((prev) => {
        const key = movedColor === "w" ? "whiteMs" : "blackMs";
        return {
          ...prev,
          [key]: prev[key] + incrementMs,
          activeColor: movedColor === "w" ? "b" : "w",
          isRunning: isPlaying,
          isPaused: false,
        };
      });
      lastTickRef.current = performance.now();
    },
    [isPlaying, isUnlimited],
  );

  const restore = useCallback(
    (whiteMs: number, blackMs: number, activeColor: Color) => {
      setClocks({
        whiteMs,
        blackMs,
        activeColor,
        isRunning: isPlaying && !isUnlimited,
        isPaused: false,
      });
      lastTickRef.current = performance.now();
    },
    [isPlaying, isUnlimited],
  );

  const getSnapshot = useCallback(
    () => ({ whiteMs: clocks.whiteMs, blackMs: clocks.blackMs }),
    [clocks.whiteMs, clocks.blackMs],
  );

  useEffect(() => {
    reset();
  }, [timeControl.id, reset]);

  useEffect(() => {
    if (!isPlaying || isUnlimited || clocks.isPaused || !clocks.isRunning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now;
      }

      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      setClocks((prev) => {
        const key = prev.activeColor === "w" ? "whiteMs" : "blackMs";
        const nextMs = prev[key] - delta;

        if (nextMs <= 0) {
          onTimeoutRef.current(prev.activeColor);
          return {
            ...prev,
            [key]: 0,
            isRunning: false,
            isPaused: true,
          };
        }

        return { ...prev, [key]: nextMs };
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [clocks.isPaused, clocks.isRunning, clocks.activeColor, isPlaying, isUnlimited]);

  useEffect(() => {
    if (!isPlaying) {
      pause();
    }
  }, [isPlaying, pause]);

  return {
    clocks,
    isUnlimited,
    reset,
    pause,
    resume,
    switchTurn,
    restore,
    getSnapshot,
  };
}

export type UseChessClockReturn = ReturnType<typeof useChessClock>;
