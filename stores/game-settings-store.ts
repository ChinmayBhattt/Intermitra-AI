import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_TIME_CONTROL_ID,
  TIME_CONTROLS,
  type TimeControl,
} from "@/lib/chess/constants";
import {
  BOARD_THEMES,
  PIECE_SETS,
  type BoardThemeId,
  type PieceSetId,
} from "@/lib/chess/themes";

export type GameSettingsState = {
  boardThemeId: BoardThemeId;
  pieceSetId: PieceSetId;
  timeControlId: string;
  soundEnabled: boolean;
  soundVolume: number;
  showNotation: boolean;
  autoFlipBoard: boolean;
  boardOrientation: "white" | "black";
  setBoardThemeId: (id: BoardThemeId) => void;
  setPieceSetId: (id: PieceSetId) => void;
  setTimeControlId: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setShowNotation: (show: boolean) => void;
  setAutoFlipBoard: (auto: boolean) => void;
  setBoardOrientation: (orientation: "white" | "black") => void;
  flipBoard: () => void;
  getTimeControl: () => TimeControl;
  getBoardTheme: () => (typeof BOARD_THEMES)[BoardThemeId];
  getPieceSet: () => (typeof PIECE_SETS)[PieceSetId];
};

export const useGameSettingsStore = create<GameSettingsState>()(
  persist(
    (set, get) => ({
      boardThemeId: "classic",
      pieceSetId: "classic",
      timeControlId: DEFAULT_TIME_CONTROL_ID,
      soundEnabled: true,
      soundVolume: 0.6,
      showNotation: true,
      autoFlipBoard: false,
      boardOrientation: "white",

      setBoardThemeId: (boardThemeId) => set({ boardThemeId }),
      setPieceSetId: (pieceSetId) => set({ pieceSetId }),
      setTimeControlId: (timeControlId) => set({ timeControlId }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSoundVolume: (soundVolume) => set({ soundVolume }),
      setShowNotation: (showNotation) => set({ showNotation }),
      setAutoFlipBoard: (autoFlipBoard) => set({ autoFlipBoard }),
      setBoardOrientation: (boardOrientation) => set({ boardOrientation }),
      flipBoard: () =>
        set((state) => ({
          boardOrientation:
            state.boardOrientation === "white" ? "black" : "white",
        })),

      getTimeControl: () =>
        TIME_CONTROLS.find((tc) => tc.id === get().timeControlId) ??
        TIME_CONTROLS.find((tc) => tc.id === DEFAULT_TIME_CONTROL_ID)!,

      getBoardTheme: () => BOARD_THEMES[get().boardThemeId],
      getPieceSet: () => PIECE_SETS[get().pieceSetId],
    }),
    {
      name: "chess-game-settings",
      partialize: (state) => ({
        boardThemeId: state.boardThemeId,
        pieceSetId: state.pieceSetId,
        timeControlId: state.timeControlId,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        showNotation: state.showNotation,
        autoFlipBoard: state.autoFlipBoard,
        boardOrientation: state.boardOrientation,
      }),
    },
  ),
);
