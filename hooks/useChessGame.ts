"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Chess, type Color, type Move, type PieceSymbol, type Square } from "chess.js";
import type { GameStatus, DrawReason } from "@/lib/chess/constants";
import {
  type CapturedPieces,
  type GameSnapshot,
  type LastMove,
  getCapturedFromHistory,
  getDrawReason,
  getDrawReasonLabel,
  getGameStatus,
  getMoveSoundType,
  isPawnPromotion,
} from "@/lib/chess/utils";

export type PromotionPending = {
  from: Square;
  to: Square;
} | null;

export type MoveEvent = {
  move: Move;
  sound: ReturnType<typeof getMoveSoundType>;
};

export function useChessGame() {
  const chessRef = useRef(new Chess());
  const historyStackRef = useRef<GameSnapshot[]>([]);

  const [fen, setFen] = useState(chessRef.current.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<LastMove>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionPending, setPromotionPending] = useState<PromotionPending>(null);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [drawReason, setDrawReason] = useState<DrawReason | null>(null);
  const [resignedBy, setResignedBy] = useState<Color | null>(null);
  const [timedOutColor, setTimedOutColor] = useState<Color | null>(null);
  const [captured, setCaptured] = useState<CapturedPieces>({ white: [], black: [] });
  const [lastMoveEvent, setLastMoveEvent] = useState<MoveEvent | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [undoStackSize, setUndoStackSize] = useState(0);

  const chess = chessRef.current;
  const turn = chess.turn();
  const isPlaying = status === "playing";
  const isCheck = chess.isCheck();
  const winner: Color | null =
    status === "checkmate"
      ? turn === "w"
        ? "b"
        : "w"
      : status === "resigned" || status === "timeout"
        ? resignedBy === "w" || timedOutColor === "w"
          ? "b"
          : "w"
        : null;

  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !isPlaying) return [] as Square[];
    return chess
      .moves({ square: selectedSquare, verbose: true })
      .map((m) => m.to);
  }, [selectedSquare, fen, isPlaying]);

  const pushSnapshot = useCallback(
    (whiteMs: number, blackMs: number) => {
      historyStackRef.current.push({
        fen: chess.fen(),
        whiteMs,
        blackMs,
        captured: { ...captured, white: [...captured.white], black: [...captured.black] },
        moveHistory: [...moveHistory],
        lastMove,
      });
      setUndoStackSize(historyStackRef.current.length);
    },
    [captured, lastMove, moveHistory],
  );

  const updateGameEndState = useCallback(() => {
    const gameStatus = getGameStatus(chess);
    if (gameStatus === "draw") {
      const reason = getDrawReason(chess);
      setDrawReason(reason);
      setStatus("draw");
      setAnnouncement(reason ? getDrawReasonLabel(reason) : "Game drawn");
      return;
    }
    if (gameStatus === "checkmate") {
      setStatus("checkmate");
      setAnnouncement("Checkmate");
      return;
    }
    if (chess.isCheck()) {
      setAnnouncement("Check");
    } else {
      setAnnouncement("");
    }
  }, []);

  const applySuccessfulMove = useCallback(
    (move: Move) => {
      setFen(chess.fen());
      setMoveHistory(chess.history());
      setLastMove({ from: move.from, to: move.to });
      setCaptured(getCapturedFromHistory(chess.history({ verbose: true })));
      setSelectedSquare(null);
      setLastMoveEvent({ move, sound: getMoveSoundType(move, chess) });
      updateGameEndState();
    },
    [updateGameEndState],
  );

  const tryMove = useCallback(
    (
      from: Square,
      to: Square,
      promotion?: PieceSymbol,
      clockSnapshot?: { whiteMs: number; blackMs: number },
    ): Move | null => {
      if (!isPlaying || promotionPending) return null;

      if (isPawnPromotion(chess, from, to) && !promotion) {
        setPromotionPending({ from, to });
        setSelectedSquare(null);
        return null;
      }

      if (clockSnapshot) {
        pushSnapshot(clockSnapshot.whiteMs, clockSnapshot.blackMs);
      }

      try {
        const move = chess.move({ from, to, promotion: promotion ?? "q" });
        if (!move) {
          historyStackRef.current.pop();
          setUndoStackSize(historyStackRef.current.length);
          return null;
        }
        applySuccessfulMove(move);
        return move;
      } catch {
        historyStackRef.current.pop();
        setUndoStackSize(historyStackRef.current.length);
        return null;
      }
    },
    [applySuccessfulMove, isPlaying, promotionPending, pushSnapshot],
  );

  const completePromotion = useCallback(
    (piece: PieceSymbol) => {
      if (!promotionPending) return null;
      const { from, to } = promotionPending;
      setPromotionPending(null);
      return tryMove(from, to, piece);
    },
    [promotionPending, tryMove],
  );

  const cancelPromotion = useCallback(() => {
    setPromotionPending(null);
  }, []);

  const handleSquareClick = useCallback(
    (square: Square, clockSnapshot?: { whiteMs: number; blackMs: number }): boolean => {
      if (!isPlaying || promotionPending) return false;

      const piece = chess.get(square);

      if (selectedSquare) {
        if (selectedSquare === square) {
          setSelectedSquare(null);
          return false;
        }

        if (isPawnPromotion(chess, selectedSquare, square)) {
          if (clockSnapshot) {
            pushSnapshot(clockSnapshot.whiteMs, clockSnapshot.blackMs);
          }
          setPromotionPending({ from: selectedSquare, to: square });
          setSelectedSquare(null);
          return false;
        }

        const move = tryMove(selectedSquare, square, undefined, clockSnapshot);
        if (move) return true;

        if (piece && piece.color === turn) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
        return false;
      }

      if (piece && piece.color === turn) {
        setSelectedSquare(square);
      }

      return false;
    },
    [isPlaying, promotionPending, selectedSquare, tryMove, turn, pushSnapshot],
  );

  const handlePieceDrop = useCallback(
    (
      sourceSquare: Square,
      targetSquare: Square,
      clockSnapshot?: { whiteMs: number; blackMs: number },
    ): "moved" | "promotion" | "failed" => {
      if (!isPlaying || !targetSquare) return "failed";

      if (isPawnPromotion(chess, sourceSquare, targetSquare)) {
        if (clockSnapshot) {
          pushSnapshot(clockSnapshot.whiteMs, clockSnapshot.blackMs);
        }
        setPromotionPending({ from: sourceSquare, to: targetSquare });
        setSelectedSquare(null);
        return "promotion";
      }

      const move = tryMove(sourceSquare, targetSquare, undefined, clockSnapshot);
      return move ? "moved" : "failed";
    },
    [isPlaying, tryMove, pushSnapshot],
  );

  const undo = useCallback((): GameSnapshot | null => {
    if (promotionPending) {
      setPromotionPending(null);
      return null;
    }

    const snapshot = historyStackRef.current.pop();
    if (!snapshot) return null;

    chess.load(snapshot.fen);
    setFen(snapshot.fen);
    setMoveHistory(snapshot.moveHistory);
    setLastMove(snapshot.lastMove);
    setCaptured(snapshot.captured);
    setSelectedSquare(null);
    setStatus("playing");
    setDrawReason(null);
    setResignedBy(null);
    setTimedOutColor(null);
    setLastMoveEvent(null);
    setAnnouncement(chess.isCheck() ? "Check" : "");
    setUndoStackSize(historyStackRef.current.length);
    return snapshot;
  }, [promotionPending]);

  const resign = useCallback((by: Color) => {
    if (!isPlaying) return;
    setStatus("resigned");
    setResignedBy(by);
    setAnnouncement(`${by === "w" ? "White" : "Black"} resigned`);
  }, [isPlaying]);

  const flagTimeout = useCallback((color: Color) => {
    if (!isPlaying) return;
    setStatus("timeout");
    setTimedOutColor(color);
    setAnnouncement(`${color === "w" ? "White" : "Black"} ran out of time`);
  }, [isPlaying]);

  const restart = useCallback(() => {
    chess.reset();
    historyStackRef.current = [];
    setUndoStackSize(0);
    setFen(chess.fen());
    setMoveHistory([]);
    setLastMove(null);
    setSelectedSquare(null);
    setPromotionPending(null);
    setStatus("playing");
    setDrawReason(null);
    setResignedBy(null);
    setTimedOutColor(null);
    setCaptured({ white: [], black: [] });
    setLastMoveEvent(null);
    setAnnouncement("");
  }, []);

  const canUndo = undoStackSize > 0 && isPlaying;

  return {
    fen,
    turn,
    moveHistory,
    lastMove,
    selectedSquare,
    setSelectedSquare,
    legalMovesForSelected,
    promotionPending,
    status,
    drawReason,
    resignedBy,
    timedOutColor,
    winner,
    captured,
    isPlaying,
    isCheck,
    announcement,
    lastMoveEvent,
    clearLastMoveEvent: () => setLastMoveEvent(null),
    handleSquareClick,
    handlePieceDrop,
    completePromotion,
    cancelPromotion,
    undo,
    canUndo,
    resign,
    flagTimeout,
    restart,
  };
}

export type UseChessGameReturn = ReturnType<typeof useChessGame>;
