import { defaultPieces, type PieceRenderObject } from "react-chessboard";
import type React from "react";

export type BoardThemeId =
  | "classic"
  | "blue"
  | "brown"
  | "ice"
  | "forest"
  | "midnight";

export type PieceSetId = "classic" | "neo" | "glass";

export type BoardTheme = {
  id: BoardThemeId;
  name: string;
  darkSquare: React.CSSProperties;
  lightSquare: React.CSSProperties;
  highlightLast: string;
  highlightSelected: string;
  highlightLegal: string;
  highlightCheck: string;
};

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  classic: {
    id: "classic",
    name: "Classic Green",
    darkSquare: { backgroundColor: "#769656" },
    lightSquare: { backgroundColor: "#eeeed2" },
    highlightLast: "rgba(255, 255, 0, 0.35)",
    highlightSelected: "rgba(20, 85, 30, 0.55)",
    highlightLegal: "rgba(20, 85, 30, 0.45)",
    highlightCheck: "rgba(255, 0, 0, 0.55)",
  },
  blue: {
    id: "blue",
    name: "Blue",
    darkSquare: { backgroundColor: "#8ca2ad" },
    lightSquare: { backgroundColor: "#dee3e6" },
    highlightLast: "rgba(100, 149, 237, 0.4)",
    highlightSelected: "rgba(30, 80, 140, 0.55)",
    highlightLegal: "rgba(30, 80, 140, 0.4)",
    highlightCheck: "rgba(255, 60, 60, 0.55)",
  },
  brown: {
    id: "brown",
    name: "Brown",
    darkSquare: { backgroundColor: "#b58863" },
    lightSquare: { backgroundColor: "#f0d9b5" },
    highlightLast: "rgba(255, 200, 100, 0.4)",
    highlightSelected: "rgba(120, 60, 20, 0.5)",
    highlightLegal: "rgba(120, 60, 20, 0.4)",
    highlightCheck: "rgba(220, 40, 40, 0.55)",
  },
  ice: {
    id: "ice",
    name: "Ice",
    darkSquare: { backgroundColor: "#96b4c5" },
    lightSquare: { backgroundColor: "#e8f4fc" },
    highlightLast: "rgba(180, 220, 255, 0.5)",
    highlightSelected: "rgba(40, 100, 160, 0.45)",
    highlightLegal: "rgba(40, 100, 160, 0.35)",
    highlightCheck: "rgba(255, 80, 80, 0.55)",
  },
  forest: {
    id: "forest",
    name: "Forest",
    darkSquare: { backgroundColor: "#4a6741" },
    lightSquare: { backgroundColor: "#c8d6b9" },
    highlightLast: "rgba(200, 255, 150, 0.35)",
    highlightSelected: "rgba(30, 70, 30, 0.55)",
    highlightLegal: "rgba(30, 70, 30, 0.4)",
    highlightCheck: "rgba(255, 60, 60, 0.55)",
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    darkSquare: { backgroundColor: "#4b5563" },
    lightSquare: { backgroundColor: "#9ca3af" },
    highlightLast: "rgba(147, 197, 253, 0.35)",
    highlightSelected: "rgba(59, 130, 246, 0.45)",
    highlightLegal: "rgba(59, 130, 246, 0.35)",
    highlightCheck: "rgba(248, 113, 113, 0.6)",
  },
};

const PIECE_COLORS: Record<
  PieceSetId,
  { white: string; black: string; stroke?: string }
> = {
  classic: { white: "#ffffff", black: "#1a1a1a", stroke: "#333" },
  neo: { white: "#f5f5f5", black: "#2d3748", stroke: "#1a202c" },
  glass: { white: "#e2e8f0", black: "#0f172a", stroke: "#64748b" },
};

function tintPieces(
  colors: { white: string; black: string; stroke?: string },
): PieceRenderObject {
  const tinted: PieceRenderObject = {};

  for (const [key, renderer] of Object.entries(defaultPieces)) {
    tinted[key] = (props) => {
      const isWhite = key.startsWith("w");
      return renderer({
        ...props,
        fill: isWhite ? colors.white : colors.black,
        svgStyle: {
          filter: isWhite
            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
            : "drop-shadow(0 1px 1px rgba(255,255,255,0.1))",
          ...(props?.svgStyle ?? {}),
        },
      });
    };
  }

  return tinted;
}

export const PIECE_SETS: Record<
  PieceSetId,
  { id: PieceSetId; name: string; pieces: PieceRenderObject }
> = {
  classic: {
    id: "classic",
    name: "Classic",
    pieces: tintPieces(PIECE_COLORS.classic),
  },
  neo: {
    id: "neo",
    name: "Neo",
    pieces: tintPieces(PIECE_COLORS.neo),
  },
  glass: {
    id: "glass",
    name: "Glass",
    pieces: tintPieces(PIECE_COLORS.glass),
  },
};
