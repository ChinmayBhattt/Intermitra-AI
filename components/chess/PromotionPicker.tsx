"use client";

import { motion, AnimatePresence } from "framer-motion";
import { defaultPieces } from "react-chessboard";
import type { Color, PieceSymbol, Square } from "chess.js";
import { PROMOTION_PIECES } from "@/lib/chess/constants";

type PromotionPickerProps = {
  square: Square;
  color: Color;
  boardOrientation: "white" | "black";
  squareSize: number;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
};

function squareToCoords(
  square: Square,
  orientation: "white" | "black",
  squareSize: number,
) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(square[1], 10) - 1;

  const col = orientation === "white" ? file : 7 - file;
  const row = orientation === "white" ? 7 - rank : rank;

  return { left: col * squareSize, top: row * squareSize };
}

export function PromotionPicker({
  square,
  color,
  boardOrientation,
  squareSize,
  onSelect,
  onCancel,
}: PromotionPickerProps) {
  const { left, top } = squareToCoords(square, boardOrientation, squareSize);
  const direction = boardOrientation === "white" ? (square[1] === "8" ? -1 : 1) : square[1] === "1" ? 1 : -1;

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-40 bg-black/20"
        aria-label="Cancel promotion"
        onClick={onCancel}
      />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: direction * 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: direction * 8 }}
          transition={{ duration: 0.15 }}
          className="absolute z-50 flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-xl"
          style={{
            left,
            top: direction === -1 ? top - squareSize * 3 : top + squareSize,
            width: squareSize,
          }}
          role="listbox"
          aria-label="Choose promotion piece"
        >
          {PROMOTION_PIECES.map((piece) => {
            const key = `${color}${piece.toUpperCase()}` as keyof typeof defaultPieces;
            const renderer = defaultPieces[key];
            return (
              <button
                key={piece}
                type="button"
                aria-selected={false}
                className="flex aspect-square items-center justify-center bg-card transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                style={{ width: squareSize, height: squareSize }}
                onClick={() => onSelect(piece)}
                aria-label={`Promote to ${piece}`}
              >
                {renderer?.({ svgStyle: { width: "85%", height: "85%" } })}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
