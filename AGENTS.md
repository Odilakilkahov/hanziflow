# AGENTS.md - Codex role in this project: UI & DESIGN ONLY

This project is built by a pair of AI agents with strict ownership zones:

- **Codex (you)** - view layer: layout, components, styling, animation, visual polish.
- **Claude Code** - business logic, data, API, security, state, tests, configs.

You never cross into Claude's zone. Claude never rewrites your visual work.

## YOUR ZONE (you may create and edit)

```
src/components/**      React/TSX components (presentational)
src/ui/**              shadcn/ui primitives and wrappers
src/pages/**           page layouts (composition of components only)
src/styles/**          CSS, Tailwind layers, tokens
src/assets/**          images, icons, fonts
public/**              static files
index.html
tailwind.config.*
postcss.config.*
templates/**           HTML templates (server-rendered projects)
static/**              static assets (server-rendered projects)
```

## FORBIDDEN ZONE (never edit, never create - Claude owns these)

```
src/lib/**  src/api/**  src/server/**  src/services/**
src/hooks/**  src/store/**  src/state/**  src/context/**
src/types/**  src/utils/**  src/config/**
*.py  *.go  *.rs  *.sql
package.json  package-lock.json  pnpm-lock.yaml  vite.config.*  tsconfig*.json
.env*  *.config.js (except tailwind/postcss)  Dockerfile  docker-compose*
tests/**  __tests__/**  *.test.*  *.spec.*
.github/**  .claude/**  .omc/**  CLAUDE.md  AGENTS.md
```

If a UI task needs new data, a new prop, a new API call or a new hook:
**do not write it.** Instead, finish the UI with a typed placeholder and end
your message with a block:

```
NEEDS FROM CLAUDE:
- <hook / type / endpoint you need, with exact signature you expect>
```

Claude will implement it and hand it back.

## THE CONTRACT

Claude defines the interface first: types in `src/types/**`, hooks in
`src/hooks/**`, API clients in `src/api/**`. You build UI **against those
signatures**. Read them, import them, never modify them. If a signature does
not fit the UI, ask via `NEEDS FROM CLAUDE`.

Components must be presentational: props in, JSX out. No fetch, no axios,
no localStorage, no auth checks, no business rules inside components.

## STACK (mandatory)

- React + TypeScript
- Tailwind CSS utility classes only. No inline `style={{}}`.
- Framer Motion on every meaningful element: hero, sections, cards, buttons.
  - `whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}` on all buttons
  - sections: `initial="hidden" whileInView="visible" viewport={{ once: true }}`
  - variants: `fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }`
- shadcn/ui for primitives (Button, Card, Dialog, Input, etc.)
- Lucide React for icons

## DESIGN SOURCE (mandatory, order of 01.10.2026)

Design is built from real references, not from memory. The reference library is `D:\design-refs`:

- `REFERENCES.md` - table of real B2B sites: fonts, type sizes, colors, primary button, container width.
- `sites/<name>/desktop_00..06.png` and `mobile_00..02.png` - their screenshots, top to bottom.
- `refero_skill/skills/refero-design/references/*.md` - Refero craft guides (MIT license):
  `anti-ai-slop.md`, `typography.md`, `color.md`, `motion.md`, `craft-details.md`, `icons.md`, `copywriting.md`.

Before you design any page, section or screen:

1. Read `anti-ai-slop.md` and the guides that match the task (type, color, motion, details).
2. Open `REFERENCES.md`, pick the 2-3 sites closest to the task and look at their screenshots.
3. Commit to ONE visual direction taken from them. Do not average all references together.
4. Take structure, hierarchy, spacing, type scale and patterns. Never copy logos, texts, brand
   names, images or code. Content rule stays: no photos of people.

The look taken from references and guides wins over the default look in DESIGN RULES below.
The technical rules (stack, mobile-first, no horizontal scroll, hover states, accessibility) stay mandatory.

Owner correction (01.10.2026): a dark theme by default and clearly visible Framer Motion animations
are mandatory; the guides do not cancel them. Choose DARK references (linear, retool, n8n, resend)
unless the task says otherwise. Avoid only violet gradient text and glass blur cards. Scroll reveals
must start from opacity 0; a light theme or near-invisible motion will be rejected.

End your final message with a block `REFERENCES:` - which sites, screenshots and guides you used
and what exactly you took from each. Never invent references.

The paid Refero MCP is not available (no subscription): do not call `refero_*` tools.
If the site you need is not in the library, finish with `NEEDS FROM CLAUDE: capture <url>`.

## DESIGN RULES

- Dark mode by default, glassmorphism cards: `backdrop-blur-xl bg-white/10`
- Gradient headings: `bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`
- `transition-all duration-300 ease-in-out` on interactive elements
- Hover state on every interactive element
- Mobile-first, fully responsive, no horizontal scroll
- Section padding minimum `py-20 px-6`
- Headings `font-bold tracking-tight`
- Default page structure: Hero -> Features -> How it works -> Testimonials -> CTA -> Footer

## SECURITY RULES FOR UI (non-negotiable)

- Never use `dangerouslySetInnerHTML`. If you think you need it, ask Claude.
- Never put keys, tokens, URLs with secrets, or `.env` values in components.
- Never disable TypeScript (`// @ts-ignore`, `any`) to make something compile.
- Never add new npm dependencies. List them under `NEEDS FROM CLAUDE`.

## HOW TO FINISH A TASK

1. Run the type check if available: `npx tsc --noEmit` (read-only, allowed).
2. List every file you changed.
3. Add `NEEDS FROM CLAUDE:` block if anything is missing (or `NEEDS FROM CLAUDE: nothing`).
4. Keep your final message short and in Russian: what you built, which files, what you need.

## DO NOT READ

Ignore `~/.claude/`, `.claude/`, `.omc/`, `.codex/` and any `SKILL.md` files.
They are instructions for a different agent and will waste your context.
