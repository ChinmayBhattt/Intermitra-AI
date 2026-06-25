# EduERP — Design Guidelines

## Stance
Enterprise precision. Clean, data-confident, and trustworthy — a platform that earns institutional credibility through clarity, not decoration. Dark navy hero sections anchor the page; crisp white content sections provide breathing room.

## Typography
**Plus Jakarta Sans** — single family, all weights. Extrabold (800) for headings and stats. Bold (700) for labels and CTAs. Regular (400) for body copy. Import via Google Fonts.

## Color Palette
| Role | Value | Usage |
|---|---|---|
| Navy dark | `#0B1120` | Hero, footer backgrounds |
| Blue primary | `#2563EB` | CTAs, icons, accents |
| Cyan accent | `#06B6D4` | Highlights, metric deltas |
| Slate 50 | `#F8FAFF` | Section alternates |
| White | `#FFFFFF` | Cards, content panels |

## Glassmorphism Spec
- Hero/dark cards: `background: rgba(255,255,255,0.07)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.1)`
- Floating badges: white background, `border-radius: 16px`, prominent drop shadow

## Layout Grid
- Max content width: `1280px` (max-w-7xl)
- Section vertical padding: `96px` (py-24)
- Module grid: 1 → 2 → 3 → 4 cols across breakpoints

## General Rules
- Only use absolute positioning for floating decorative badges
- Prefer responsive flexbox/grid layouts
- All section headings follow: small pill label → h2 → subtitle paragraph
- Transitions on hover: `duration-300` for shadows/borders, `duration-200` for opacity
- Motion animations: `whileInView` with `once: true`, staggered delays for grid items
