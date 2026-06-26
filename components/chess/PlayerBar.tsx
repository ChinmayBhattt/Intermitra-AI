"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatClock } from "@/lib/chess/utils";

type PlayerBarProps = {
  name: string;
  color: "white" | "black";
  ms: number;
  isActive: boolean;
  isUnlimited: boolean;
  capturedSlot?: React.ReactNode;
  compact?: boolean;
};

export function PlayerBar({
  name,
  color,
  ms,
  isActive,
  isUnlimited,
  capturedSlot,
  compact = false,
}: PlayerBarProps) {
  const isLowTime = !isUnlimited && ms <= 10_000 && ms > 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors",
        isActive
          ? "border-primary/50 bg-primary/5 shadow-sm"
          : "border-border bg-card/50",
        compact && "py-1.5",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 shrink-0 rounded-full",
              color === "white" ? "bg-zinc-100 ring-1 ring-zinc-300" : "bg-zinc-800 ring-1 ring-zinc-600",
            )}
            aria-hidden
          />
          <span className="truncate text-sm font-medium">{name}</span>
          {isActive && (
            <span className="text-xs text-primary">●</span>
          )}
        </div>
        {!compact && capturedSlot}
      </div>
      <motion.span
        animate={isLowTime ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={isLowTime ? { repeat: Infinity, duration: 1 } : undefined}
        className={cn(
          "shrink-0 font-mono text-lg font-semibold tabular-nums",
          isLowTime && "text-destructive",
          isActive && "text-foreground",
          !isActive && "text-muted-foreground",
        )}
        aria-live="polite"
        aria-label={`${name} clock: ${formatClock(ms)}`}
      >
        {formatClock(ms)}
      </motion.span>
    </div>
  );
}
