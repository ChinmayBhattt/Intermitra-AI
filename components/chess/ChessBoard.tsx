"use client";

import { useMemo } from "react";
import { Chessboard } from "react-chessboard";
import { Chess, type Square } from "chess.js";
import { useGameSettingsStore } from "@/stores/game-settings-store";
import { buildSquareStyles, findKingSquare, pieceColorFromType } from "@/lib/chess/utils";
import type { LastMove } from "@/lib/chess/utils";

type ChessBoardProps = {
  fen: string;
  turn: "w" | "b";
  isPlaying: boolean;
  isCheck: boolean;
  selectedSquare: Square | null;
  legalTargets: Square[];
  lastMove: LastMove;
  onSquareClick: (square: Square) => void;
  onPieceDrop: (from: Square, to: Square) => boolean;
};

export function ChessBoard({
  fen,
  turn,
  isPlaying,
  isCheck,
  selectedSquare,
  legalTargets,
  lastMove,
  onSquareClick,
  onPieceDrop,
}: ChessBoardProps) {
  const boardTheme = useGameSettingsStore((s) => s.getBoardTheme());
  const pieceSet = useGameSettingsStore((s) => s.getPieceSet());
  const boardOrientation = useGameSettingsStore((s) => s.boardOrientation);
  const showNotation = useGameSettingsStore((s) => s.showNotation);

  const checkSquare = useMemo(() => {
    if (!isCheck) return null;
    const chess = new Chess(fen);
    return findKingSquare(chess, chess.turn());
  }, [fen, isCheck]);

  const squareStyles = useMemo(
    () =>
      buildSquareStyles({
        theme: boardTheme,
        selectedSquare,
        legalTargets,
        lastMove,
        checkSquare,
      }),
    [boardTheme, selectedSquare, legalTargets, lastMove, checkSquare],
  );

  const options = useMemo(
    () => ({
      id: "main-board",
      position: fen,
      boardOrientation,
      allowDragging: isPlaying,
      showNotation,
      animationDurationInMs: 150,
      pieces: pieceSet.pieces,
      darkSquareStyle: boardTheme.darkSquare,
      lightSquareStyle: boardTheme.lightSquare,
      squareStyles,
      dropSquareStyle: {
        boxShadow: "inset 0 0 1px 6px rgba(20,85,30,0.55)",
      },
      boardStyle: {
        borderRadius: "4px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      },
      canDragPiece: ({
        piece,
      }: {
        piece: { pieceType: string };
        isSparePiece: boolean;
        square: string | null;
      }) => {
        if (!isPlaying) return false;
        return pieceColorFromType(piece.pieceType) === turn;
      },
      onSquareClick: ({ square }: { square: string }) => {
        onSquareClick(square as Square);
      },
      onPieceDrop: ({
        sourceSquare,
        targetSquare,
      }: {
        sourceSquare: string;
        targetSquare: string | null;
      }) => {
        if (!targetSquare) return false;
        return onPieceDrop(sourceSquare as Square, targetSquare as Square);
      },
    }),
    [
      fen,
      boardOrientation,
      isPlaying,
      showNotation,
      pieceSet.pieces,
      boardTheme,
      squareStyles,
      turn,
      onSquareClick,
      onPieceDrop,
    ],
  );

  return (
    <div className="aspect-square w-full max-w-[min(100vw-2rem,70vh,640px)]">
      <Chessboard options={options} />
    </div>
  );
}
