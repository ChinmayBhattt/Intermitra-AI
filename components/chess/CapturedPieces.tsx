"use client";

import { defaultPieces } from "react-chessboard";
import type { PieceSymbol } from "chess.js";
import { Badge } from "@/components/ui/badge";
import { PIECE_VALUES } from "@/lib/chess/constants";
import type { CapturedPieces } from "@/lib/chess/utils";
import { getMaterialAdvantage } from "@/lib/chess/utils";

const SORT_ORDER: PieceSymbol[] = ["q", "r", "b", "n", "p"];

type CapturedPiecesProps = {
  captured: CapturedPieces;
};

function sortPieces(pieces: PieceSymbol[]) {
  return [...pieces].sort(
    (a, b) => SORT_ORDER.indexOf(a) - SORT_ORDER.indexOf(b),
  );
}

function PieceIcon({ piece, color }: { piece: PieceSymbol; color: "w" | "b" }) {
  const key = `${color}${piece.toUpperCase()}` as keyof typeof defaultPieces;
  const renderer = defaultPieces[key];
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center opacity-80">
      {renderer?.({ svgStyle: { width: "100%", height: "100%" } })}
    </span>
  );
}

export function CapturedPiecesDisplay({ captured }: CapturedPiecesProps) {
  const advantage = getMaterialAdvantage(captured);
  const whiteSorted = sortPieces(captured.white);
  const blackSorted = sortPieces(captured.black);

  return (
    <div className="space-y-2">
      <div className="flex min-h-6 flex-wrap items-center gap-0.5">
        {blackSorted.map((piece, i) => (
          <PieceIcon key={`b-${piece}-${i}`} piece={piece} color="b" />
        ))}
        {advantage > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            +{advantage}
          </Badge>
        )}
      </div>
      <div className="flex min-h-6 flex-wrap items-center gap-0.5">
        {whiteSorted.map((piece, i) => (
          <PieceIcon key={`w-${piece}-${i}`} piece={piece} color="w" />
        ))}
        {advantage < 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            +{Math.abs(advantage)}
          </Badge>
        )}
      </div>
    </div>
  );
}

export { PIECE_VALUES };
