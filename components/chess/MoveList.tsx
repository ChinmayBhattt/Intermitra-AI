"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatMovePairs } from "@/lib/chess/utils";

type MoveListProps = {
  history: string[];
  currentMoveIndex?: number;
};

export function MoveList({ history, currentMoveIndex }: MoveListProps) {
  const pairs = formatMovePairs(history);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length]);

  return (
    <ScrollArea className="h-48 md:h-64">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 px-2 py-1 font-mono text-sm">
        {pairs.length === 0 ? (
          <p className="col-span-3 py-4 text-center text-muted-foreground">No moves yet</p>
        ) : (
          pairs.map((pair) => (
            <div key={pair.number} className="contents">
              <span className="text-muted-foreground">{pair.number}.</span>
              <span
                className={cn(
                  "rounded px-1",
                  currentMoveIndex === pair.number * 2 - 2 && "bg-accent",
                )}
              >
                {pair.white}
              </span>
              <span
                className={cn(
                  "rounded px-1",
                  pair.black &&
                    currentMoveIndex === pair.number * 2 - 1 &&
                    "bg-accent",
                )}
              >
                {pair.black ?? ""}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
