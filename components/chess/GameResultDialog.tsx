"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { DrawReason, GameStatus } from "@/lib/chess/constants";
import { getDrawReasonLabel, getResultMessage } from "@/lib/chess/utils";
import type { Color } from "chess.js";

type GameResultDialogProps = {
  open: boolean;
  status: GameStatus;
  drawReason: DrawReason | null;
  winner: Color | null;
  resignedBy: Color | null;
  timedOutColor: Color | null;
  onRestart: () => void;
  onClose: () => void;
};

export function GameResultDialog({
  open,
  status,
  drawReason,
  winner,
  resignedBy,
  timedOutColor,
  onRestart,
  onClose,
}: GameResultDialogProps) {
  const message = getResultMessage(
    status,
    drawReason,
    winner,
    resignedBy,
    timedOutColor,
  );

  const title =
    status === "draw"
      ? "Draw"
      : status === "checkmate" || status === "resigned" || status === "timeout"
        ? "Game Over"
        : "Game Over";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-base text-foreground/80">
              {message}
              {drawReason && status === "draw" && (
                <span className="mt-1 block text-sm text-muted-foreground">
                  {getDrawReasonLabel(drawReason)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onRestart}>New Game</Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
