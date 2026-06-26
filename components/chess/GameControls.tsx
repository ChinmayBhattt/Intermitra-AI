"use client";

import {
  FlipVertical2,
  Flag,
  RotateCcw,
  Settings2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type GameControlsProps = {
  canUndo: boolean;
  isPlaying: boolean;
  onUndo: () => void;
  onResign: () => void;
  onRestart: () => void;
  onFlipBoard: () => void;
  onOpenSettings: () => void;
  compact?: boolean;
};

export function GameControls({
  canUndo,
  isPlaying,
  onUndo,
  onResign,
  onRestart,
  onFlipBoard,
  onOpenSettings,
  compact = false,
}: GameControlsProps) {
  return (
    <div className={compact ? "flex gap-1" : "flex flex-wrap gap-2"}>
      <Button
        variant="outline"
        size={compact ? "icon-sm" : "sm"}
        onClick={onUndo}
        disabled={!canUndo || !isPlaying}
        aria-label="Undo move"
      >
        <Undo2 />
        {!compact && "Undo"}
      </Button>
      <Button
        variant="outline"
        size={compact ? "icon-sm" : "sm"}
        onClick={onFlipBoard}
        aria-label="Flip board"
      >
        <FlipVertical2 />
        {!compact && "Flip"}
      </Button>
      {!compact && <Separator orientation="vertical" className="mx-1 h-8" />}
      <Button
        variant="destructive"
        size={compact ? "icon-sm" : "sm"}
        onClick={onResign}
        disabled={!isPlaying}
        aria-label="Resign"
      >
        <Flag />
        {!compact && "Resign"}
      </Button>
      <Button
        variant="secondary"
        size={compact ? "icon-sm" : "sm"}
        onClick={onRestart}
        aria-label="Restart game"
      >
        <RotateCcw />
        {!compact && "Restart"}
      </Button>
      <Button
        variant="ghost"
        size={compact ? "icon-sm" : "sm"}
        onClick={onOpenSettings}
        aria-label="Open settings"
      >
        <Settings2 />
        {!compact && "Settings"}
      </Button>
    </div>
  );
}
