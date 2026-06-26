"use client";

import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TIME_CONTROLS } from "@/lib/chess/constants";
import { BOARD_THEMES, PIECE_SETS } from "@/lib/chess/themes";
import { useGameSettingsStore } from "@/stores/game-settings-store";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { theme, setTheme } = useTheme();
  const boardThemeId = useGameSettingsStore((s) => s.boardThemeId);
  const pieceSetId = useGameSettingsStore((s) => s.pieceSetId);
  const timeControlId = useGameSettingsStore((s) => s.timeControlId);
  const soundEnabled = useGameSettingsStore((s) => s.soundEnabled);
  const soundVolume = useGameSettingsStore((s) => s.soundVolume);
  const showNotation = useGameSettingsStore((s) => s.showNotation);
  const autoFlipBoard = useGameSettingsStore((s) => s.autoFlipBoard);
  const setBoardThemeId = useGameSettingsStore((s) => s.setBoardThemeId);
  const setPieceSetId = useGameSettingsStore((s) => s.setPieceSetId);
  const setTimeControlId = useGameSettingsStore((s) => s.setTimeControlId);
  const setSoundEnabled = useGameSettingsStore((s) => s.setSoundEnabled);
  const setSoundVolume = useGameSettingsStore((s) => s.setSoundVolume);
  const setShowNotation = useGameSettingsStore((s) => s.setShowNotation);
  const setAutoFlipBoard = useGameSettingsStore((s) => s.setAutoFlipBoard);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize board appearance, time controls, and sound.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section className="space-y-3">
            <Label>Appearance</Label>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Theme mode</Label>
              <Select
                value={theme ?? "dark"}
                onValueChange={(v) => v && setTheme(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Board theme</Label>
              <Select
                value={boardThemeId}
                onValueChange={(v) =>
                  v && setBoardThemeId(v as typeof boardThemeId)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BOARD_THEMES).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Piece set</Label>
              <Select
                value={pieceSetId}
                onValueChange={(v) => v && setPieceSetId(v as typeof pieceSetId)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PIECE_SETS).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <Label>Game</Label>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Time control</Label>
              <Select
                value={timeControlId}
                onValueChange={(v) => v && setTimeControlId(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_CONTROLS.map((tc) => (
                    <SelectItem key={tc.id} value={tc.id}>
                      {tc.label} ({tc.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Applies on next new game or restart.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-notation">Show coordinates</Label>
              <Switch
                id="show-notation"
                checked={showNotation}
                onCheckedChange={setShowNotation}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-flip">Auto-flip board</Label>
              <Switch
                id="auto-flip"
                checked={autoFlipBoard}
                onCheckedChange={setAutoFlipBoard}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <Label>Sound</Label>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled">Enable sounds</Label>
              <Switch
                id="sound-enabled"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Volume</span>
                <span>{Math.round(soundVolume * 100)}%</span>
              </div>
              <Slider
                value={[soundVolume * 100]}
                min={0}
                max={100}
                step={5}
                disabled={!soundEnabled}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setSoundVolume(val / 100);
                }}
              />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
