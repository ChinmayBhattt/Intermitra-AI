"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import type { Square, PieceSymbol } from "chess.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { PromotionPicker } from "@/components/chess/PromotionPicker";
import { MoveList } from "@/components/chess/MoveList";
import { CapturedPiecesDisplay } from "@/components/chess/CapturedPieces";
import { PlayerBar } from "@/components/chess/PlayerBar";
import { GameControls } from "@/components/chess/GameControls";
import { GameResultDialog } from "@/components/chess/GameResultDialog";
import { SettingsSheet } from "@/components/settings/SettingsSheet";
import { useChessGame } from "@/hooks/useChessGame";
import { useChessClock } from "@/hooks/useChessClock";
import { useChessSounds } from "@/hooks/useChessSounds";
import { useGameSettingsStore } from "@/stores/game-settings-store";

export function ChessGame() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resultDismissed, setResultDismissed] = useState(false);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(0);

  const timeControl = useGameSettingsStore((s) => s.getTimeControl());
  const boardOrientation = useGameSettingsStore((s) => s.boardOrientation);
  const autoFlipBoard = useGameSettingsStore((s) => s.autoFlipBoard);
  const flipBoard = useGameSettingsStore((s) => s.flipBoard);
  const setBoardOrientation = useGameSettingsStore((s) => s.setBoardOrientation);

  const game = useChessGame();
  const { play } = useChessSounds();

  const clock = useChessClock(
    timeControl,
    game.isPlaying,
    game.turn,
    game.flagTimeout,
  );


  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setSquareSize(entry.contentRect.width / 8);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (game.lastMoveEvent) {
      play(game.lastMoveEvent.sound);
      game.clearLastMoveEvent();
    }
  }, [game.lastMoveEvent, game, play]);

  useEffect(() => {
    if (!game.isPlaying && game.status !== "playing") {
      play("gameEnd");
      clock.pause();
    }
  }, [game.isPlaying, game.status, clock, play]);

  useEffect(() => {
    if (game.promotionPending) {
      clock.pause();
    } else if (game.isPlaying) {
      clock.resume();
    }
  }, [game.promotionPending, game.isPlaying, clock]);

  useEffect(() => {
    if (!autoFlipBoard || !game.isPlaying) return;
    const desired = game.turn === "w" ? "white" : "black";
    if (boardOrientation !== desired) {
      setBoardOrientation(desired);
    }
  }, [autoFlipBoard, game.turn, game.isPlaying, boardOrientation, setBoardOrientation]);

  const getClockSnapshot = useCallback(
    () => clock.getSnapshot(),
    [clock],
  );

  const handleMoveComplete = useCallback(
    (movedColor: "w" | "b") => {
      clock.switchTurn(movedColor, timeControl.incrementMs);
    },
    [clock, timeControl.incrementMs],
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      const beforeTurn = game.turn;
      const moved = game.handleSquareClick(square, getClockSnapshot());
      if (moved) handleMoveComplete(beforeTurn);
    },
    [game, getClockSnapshot, handleMoveComplete],
  );

  const onPieceDrop = useCallback(
    (from: Square, to: Square) => {
      const beforeTurn = game.turn;
      const result = game.handlePieceDrop(from, to, getClockSnapshot());
      if (result === "moved") handleMoveComplete(beforeTurn);
      return result !== "failed";
    },
    [game, getClockSnapshot, handleMoveComplete],
  );

  const onPromotionSelect = useCallback(
    (piece: PieceSymbol) => {
      const beforeTurn = game.turn;
      const move = game.completePromotion(piece);
      if (move) handleMoveComplete(beforeTurn);
    },
    [game, handleMoveComplete],
  );

  const onUndo = useCallback(() => {
    const snapshot = game.undo();
    if (snapshot) {
      clock.restore(snapshot.whiteMs, snapshot.blackMs, game.turn);
    }
  }, [game, clock]);

  const onResign = useCallback(() => {
    game.resign(game.turn);
  }, [game]);

  const onRestart = useCallback(() => {
    game.restart();
    clock.reset();
    setResultDismissed(false);
  }, [game, clock]);

  const showResult =
    !game.isPlaying && !resultDismissed && game.status !== "playing";

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const topPlayer = boardOrientation === "white" ? "black" : "white";
  const bottomPlayer = boardOrientation === "white" ? "white" : "black";

  const topMs = topPlayer === "white" ? clock.clocks.whiteMs : clock.clocks.blackMs;
  const bottomMs =
    bottomPlayer === "white" ? clock.clocks.whiteMs : clock.clocks.blackMs;

  const topActive =
    (topPlayer === "white" && clock.clocks.activeColor === "w") ||
    (topPlayer === "black" && clock.clocks.activeColor === "b");

  const bottomActive =
    (bottomPlayer === "white" && clock.clocks.activeColor === "w") ||
    (bottomPlayer === "black" && clock.clocks.activeColor === "b");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {game.announcement}
      </div>

      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -8, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              className="text-2xl"
              aria-hidden
            >
              ♔
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Chess</h1>
              <p className="text-xs text-muted-foreground">Local Player vs Player</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{timeControl.label}</Badge>
            {game.isCheck && game.isPlaying && (
              <Badge variant="destructive">Check</Badge>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-4 md:py-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_minmax(280px,360px)] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full max-w-[min(100vw-2rem,70vh,640px)] lg:hidden">
              <PlayerBar
                name={topPlayer === "white" ? "White" : "Black"}
                color={topPlayer}
                ms={topMs}
                isActive={topActive && game.isPlaying}
                isUnlimited={clock.isUnlimited}
                compact
              />
            </div>

            <motion.div
              ref={boardContainerRef}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full max-w-[min(100vw-2rem,70vh,640px)]"
            >
              <ChessBoard
                fen={game.fen}
                turn={game.turn}
                isPlaying={game.isPlaying}
                isCheck={game.isCheck}
                selectedSquare={game.selectedSquare}
                legalTargets={game.legalMovesForSelected}
                lastMove={game.lastMove}
                onSquareClick={onSquareClick}
                onPieceDrop={onPieceDrop}
              />
              {game.promotionPending && squareSize > 0 && (
                <PromotionPicker
                  square={game.promotionPending.to}
                  color={game.turn}
                  boardOrientation={boardOrientation}
                  squareSize={squareSize}
                  onSelect={onPromotionSelect}
                  onCancel={game.cancelPromotion}
                />
              )}
            </motion.div>

            <div className="w-full max-w-[min(100vw-2rem,70vh,640px)] lg:hidden">
              <PlayerBar
                name={bottomPlayer === "white" ? "White" : "Black"}
                color={bottomPlayer}
                ms={bottomMs}
                isActive={bottomActive && game.isPlaying}
                isUnlimited={clock.isUnlimited}
                compact
              />
            </div>

            <div className="w-full max-w-[min(100vw-2rem,70vh,640px)] lg:hidden">
              <GameControls
                canUndo={game.canUndo}
                isPlaying={game.isPlaying}
                onUndo={onUndo}
                onResign={onResign}
                onRestart={onRestart}
                onFlipBoard={flipBoard}
                onOpenSettings={() => setSettingsOpen(true)}
                compact
              />
            </div>
          </div>

          <aside className="hidden lg:block">
            <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlayerBar
                  name="Black"
                  color="black"
                  ms={clock.clocks.blackMs}
                  isActive={clock.clocks.activeColor === "b" && game.isPlaying}
                  isUnlimited={clock.isUnlimited}
                  capturedSlot={
                    <CapturedPiecesDisplay captured={game.captured} />
                  }
                />
                <PlayerBar
                  name="White"
                  color="white"
                  ms={clock.clocks.whiteMs}
                  isActive={clock.clocks.activeColor === "w" && game.isPlaying}
                  isUnlimited={clock.isUnlimited}
                />
                <GameControls
                  canUndo={game.canUndo}
                  isPlaying={game.isPlaying}
                  onUndo={onUndo}
                  onResign={onResign}
                  onRestart={onRestart}
                  onFlipBoard={flipBoard}
                  onOpenSettings={() => setSettingsOpen(true)}
                />
                <MoveList history={game.moveHistory} />
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-4 lg:hidden">
          <Tabs defaultValue="moves">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="moves">Moves</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="moves" className="mt-3">
              <Card>
                <CardContent className="pt-4">
                  <MoveList history={game.moveHistory} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="info" className="mt-3">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <CapturedPiecesDisplay captured={game.captured} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

      <GameResultDialog
        open={showResult}
        status={game.status}
        drawReason={game.drawReason}
        winner={game.winner}
        resignedBy={game.resignedBy}
        timedOutColor={game.timedOutColor}
        onRestart={onRestart}
        onClose={() => setResultDismissed(true)}
      />
    </div>
  );
}
