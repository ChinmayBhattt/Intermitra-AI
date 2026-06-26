# Chess — Local PvP

A premium local chess web app built with Next.js, chess.js, and react-chessboard.

## Features

- Full chess rules (castling, en passant, promotion, check, mate, stalemate, draws)
- Drag-and-drop and click-to-move with legal move highlights
- Chess clocks with Bullet, Blitz, Rapid, Classical, and Unlimited presets
- Move list in algebraic notation, captured pieces, board flip, undo, resign, restart
- Multiple board themes and piece sets
- Dark/light mode, synthesized sound effects, responsive layout

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- chess.js + react-chessboard v5
- Zustand (persisted settings)
