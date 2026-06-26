import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import type React from "react";
import type { DrawReason, GameStatus } from "./constants";
import { PIECE_VALUES } from "./constants";
import type { BoardTheme } from "./themes";

export type LastMove = { from: Square; to: Square } | null;

export type CapturedPieces = {
  white: PieceSymbol[];
  black: PieceSymbol[];
};

export type GameSnapshot = {
  fen: string;
  whiteMs: number;
  blackMs: number;
  captured: CapturedPieces;
  moveHistory: string[];
  lastMove: LastMove;
};

export function formatClock(ms: number): string {
  if (!Number.isFinite(ms)) return "∞";

  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getDrawReason(chess: Chess): DrawReason | null {
  if (chess.isThreefoldRepetition()) return "threefold-repetition";
  if (chess.isDrawByFiftyMoves()) return "fifty-move";
  if (chess.isInsufficientMaterial()) return "insufficient-material";
  if (chess.isStalemate()) return "stalemate";
  return null;
}

export function getDrawReasonLabel(reason: DrawReason): string {
  switch (reason) {
    case "threefold-repetition":
      return "Draw by threefold repetition";
    case "fifty-move":
      return "Draw by fifty-move rule";
    case "insufficient-material":
      return "Draw by insufficient material";
    case "stalemate":
      return "Stalemate";
  }
}

export function getGameStatus(chess: Chess): GameStatus {
  if (chess.isCheckmate()) return "checkmate";
  if (chess.isDraw()) return "draw";
  return "playing";
}

export function getResultMessage(
  status: GameStatus,
  drawReason: DrawReason | null,
  winner: Color | null,
  resignedBy: Color | null,
  timedOutColor: Color | null,
): string {
  if (status === "checkmate") {
    return winner === "w" ? "White wins by checkmate" : "Black wins by checkmate";
  }
  if (status === "resigned") {
    const winnerLabel = resignedBy === "w" ? "Black" : "White";
    return `${winnerLabel} wins by resignation`;
  }
  if (status === "timeout") {
    const winnerLabel = timedOutColor === "w" ? "Black" : "White";
    return `${winnerLabel} wins on time`;
  }
  if (status === "draw" && drawReason) {
    return getDrawReasonLabel(drawReason);
  }
  return "Game over";
}

export function getCapturedFromHistory(moves: Move[]): CapturedPieces {
  const captured: CapturedPieces = { white: [], black: [] };

  for (const move of moves) {
    if (move.captured) {
      if (move.color === "w") {
        captured.white.push(move.captured);
      } else {
        captured.black.push(move.captured);
      }
    }
  }

  return captured;
}

export function getMaterialAdvantage(captured: CapturedPieces): number {
  const whiteValue = captured.white.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  const blackValue = captured.black.reduce((sum, p) => sum + PIECE_VALUES[p], 0);
  return whiteValue - blackValue;
}

export function formatMovePairs(history: string[]): { number: number; white: string; black?: string }[] {
  const pairs: { number: number; white: string; black?: string }[] = [];

  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  return pairs;
}

export function findKingSquare(chess: Chess, color: Color): Square | null {
  const board = chess.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === "k" && piece.color === color) {
        const file = String.fromCharCode(97 + col);
        const rank = 8 - row;
        return `${file}${rank}` as Square;
      }
    }
  }
  return null;
}

export function buildSquareStyles({
  theme,
  selectedSquare,
  legalTargets,
  lastMove,
  checkSquare,
}: {
  theme: BoardTheme;
  selectedSquare: Square | null;
  legalTargets: Square[];
  lastMove: LastMove;
  checkSquare: Square | null;
}): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};

  if (lastMove) {
    styles[lastMove.from] = { backgroundColor: theme.highlightLast };
    styles[lastMove.to] = { backgroundColor: theme.highlightLast };
  }

  if (selectedSquare) {
    styles[selectedSquare] = {
      backgroundColor: theme.highlightSelected,
      boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)",
    };
  }

  for (const square of legalTargets) {
    if (square === selectedSquare) continue;
    styles[square] = {
      ...styles[square],
      background: `radial-gradient(circle at center, ${theme.highlightLegal} 18%, transparent 19%)`,
      backgroundColor: styles[square]?.backgroundColor ?? undefined,
    };
  }

  if (checkSquare) {
    styles[checkSquare] = {
      ...styles[checkSquare],
      backgroundColor: theme.highlightCheck,
      boxShadow: "inset 0 0 12px rgba(255,0,0,0.6)",
    };
  }

  return styles;
}

export function getMoveSoundType(move: Move, chess: Chess): "move" | "capture" | "castle" | "promote" | "check" {
  if (move.isPromotion()) return "promote";
  if (move.isKingsideCastle() || move.isQueensideCastle()) return "castle";
  if (move.isCapture()) return "capture";
  if (chess.isCheck()) return "check";
  return "move";
}

export function isPawnPromotion(chess: Chess, from: Square, to: Square): boolean {
  const piece = chess.get(from);
  if (!piece || piece.type !== "p") return false;
  const rank = to[1];
  return (piece.color === "w" && rank === "8") || (piece.color === "b" && rank === "1");
}

export function pieceColorFromType(pieceType: string): Color | null {
  if (pieceType.startsWith("w")) return "w";
  if (pieceType.startsWith("b")) return "b";
  return null;
}
