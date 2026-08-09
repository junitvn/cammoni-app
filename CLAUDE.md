# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

moni-app is the Telegram Mini App frontend for Cam's Moni (a family expense tracker). It's a pure client — all data lives in Google Sheets and is only ever touched through the FastAPI backend in the sibling `moni-bot/webapp` repo. See the root [CLAUDE.md](../CLAUDE.md) for how the two repos relate and deploy.

## Commands

- `npm install`
- `npm run dev` — Vite dev server on `:5173`. Needs `moni-bot`'s backend running (see root `dev.sh`) or a live `VITE_API_BASE_URL`.
- `npm run build` — `tsc -b && vite build` (typecheck, then bundle)
- `npm run lint` — oxlint (not eslint; rules live in `.oxlintrc.json`)
- No test suite is configured.

Env: `VITE_API_BASE_URL` (see `.env.example`) — defaults to `http://localhost:8000` if unset. In production it's set as a Vercel env var, not committed.

## Architecture

**Routing & data**: `src/App.tsx` defines all routes, every screen lazy-loaded. Data fetching goes through TanStack Query: `src/api/client.ts` holds the raw `fetch` wrapper (`request<T>`) and typed `api.*` calls, `src/api/hooks.ts` wraps each in a `useQuery`/`useMutation` hook. Mutations invalidate specific query key sets (e.g. creating a transaction invalidates `['home']`, `['transactions']`, `['analysis']`) — when adding a new mutation, check which screens read stale data and invalidate accordingly rather than reaching for a global refetch.

**Telegram auth**: `src/telegram.ts` extracts the Telegram-signed `initData` string from `location.hash` once on load and holds onto it (in a module variable + `sessionStorage`), because react-router's client-side navigation clears the hash and Telegram sets it asynchronously on some clients (hence the short poll on startup). `api/client.ts` sends it as `Authorization: tma <initData>` on every request; the backend validates it in `webapp/auth.py`. Don't add the official `telegram-web-app.js` script to `index.html` — `@twa-dev/sdk` bundles its own copy and reads the hash first; loading both leaves the SDK with an empty stub.

**Deep links from the bot**: the Telegram bot links into the Mini App as `/?tx=<id>` (root URL only — Telegram only reliably attaches `initData` to the root, not to sub-paths opened directly). `App.tsx`'s `DeepLinkRedirect` reads `?tx=` on mount and client-side-navigates to `/transactions/:id`.

**Styling**: Tailwind v4, configured entirely in CSS (`src/index.css`'s `@theme` block) — there is no `tailwind.config.js`. Chart series colors (`--color-chart-1..8`) are defined as plain CSS custom properties outside `@theme` deliberately, since they're only read via `var()` in JS (Recharts `fill` props) and `@theme`'s tree-shaking would drop anything not referenced literally as a Tailwind class name. The palette is a fixed, CVD-safe 8-hue categorical order — never cycle past 8 series; fold extras into "Other" (see how `AnalysisScreen` does it).

**Components**: `src/components/ui/` holds Radix-based primitives (shadcn-style, built on `radix-ui` + `cn()` from `src/lib/utils.ts` which is `twMerge(clsx(...))`). `src/components/` holds feature-level components; `src/screens/` holds one component per route.

**Debug panel**: `src/lib/debugLog.ts` is a tiny hand-rolled pub-sub (no external store) that `api/client.ts` pushes every request/response into; `src/components/DebugPanel.tsx` subscribes to it. Useful for diagnosing auth/API issues when testing inside the actual Telegram client, where devtools aren't available.
