export type GameStatus =
  | "playing"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned"
  | "timeout";

export type DrawReason =
  | "threefold-repetition"
  | "fifty-move"
  | "insufficient-material"
  | "stalemate";

export type TimeControlCategory =
  | "bullet"
  | "blitz"
  | "rapid"
  | "classical"
  | "casual";

export type TimeControl = {
  id: string;
  label: string;
  category: TimeControlCategory;
  initialMs: number;
  incrementMs: number;
};

export const TIME_CONTROLS: TimeControl[] = [
  { id: "1+0", label: "1+0", category: "bullet", initialMs: 60_000, incrementMs: 0 },
  { id: "2+1", label: "2+1", category: "bullet", initialMs: 120_000, incrementMs: 1_000 },
  { id: "3+0", label: "3+0", category: "blitz", initialMs: 180_000, incrementMs: 0 },
  { id: "5+0", label: "5+0", category: "blitz", initialMs: 300_000, incrementMs: 0 },
  { id: "10+0", label: "10+0", category: "rapid", initialMs: 600_000, incrementMs: 0 },
  { id: "15+10", label: "15+10", category: "rapid", initialMs: 900_000, incrementMs: 10_000 },
  { id: "30+0", label: "30+0", category: "classical", initialMs: 1_800_000, incrementMs: 0 },
  { id: "90+30", label: "90+30", category: "classical", initialMs: 5_400_000, incrementMs: 30_000 },
  {
    id: "unlimited",
    label: "Unlimited",
    category: "casual",
    initialMs: Number.POSITIVE_INFINITY,
    incrementMs: 0,
  },
];

export const DEFAULT_TIME_CONTROL_ID = "5+0";

export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PROMOTION_PIECES = ["q", "r", "b", "n"] as const;
