# CLAUDE.md — Developer Reference

This file documents the internal architecture of the Prabhananda Cup 4th Edition codebase for AI assistants and developers working in this repo.

---

## Codebase Map

```
prabhananda-cup-4th-edition/
├── index.html                    # Vite HTML entry point
├── vite.config.ts                # Vite config: React plugin, Tailwind plugin, path alias (@)
├── tsconfig.json                 # TypeScript config (strict, bundler module resolution)
├── package.json                  # Scripts: dev, build, lint (tsc --noEmit), seed
├── vercel.json                   # SPA rewrite rule + security headers
├── metadata.json                 # App metadata for AI Studio integration
│
└── src/
    ├── main.tsx                  # React root: mounts <App /> into #root
    ├── App.tsx                   # Root component: AppProvider wraps AppContent;
    │                             #   controls showAdmin state; renders all sections
    ├── AppContext.tsx             # React context: provides teams, fixtures, sponsors,
    │                             #   updateMatch, selectedMatchId to the whole tree
    ├── types.ts                  # Shared TypeScript interfaces (see Firebase Schema section)
    ├── data.ts                   # Static seed data: TEAMS, FIXTURES, SPONSORS arrays
    ├── index.css                 # Global CSS: Tailwind v4 @import, custom font faces
    ├── vite-env.d.ts             # Vite env type declarations (ImportMeta.env)
    │
    ├── firebase.ts               # Firebase app init; exports db (Realtime DB) and auth
    │
    ├── services/
    │   ├── db.ts                 # All Firebase RTDB read/write helpers:
    │   │                         #   subscribeToTournamentData, updateMatch, addMatch,
    │   │                         #   deleteMatch, addEvent, upsertTeam, deleteTeam,
    │   │                         #   upsertSponsor, deleteSponsor, updateTournamentMeta,
    │   │                         #   updateHeroContent, updateVenueInfo
    │   └── auth.ts               # Firebase Auth helpers: signIn, signOut, onAuthChange
    │
    ├── components/
    │   ├── Navbar.tsx            # Sticky top navigation with section anchor links
    │   ├── Hero.tsx              # Full-bleed hero with tournament title and badge
    │   ├── LiveMatch.tsx         # Live match card; polls/subscribes to LIVE match data
    │   ├── Fixtures.tsx          # Full fixture list grouped by status
    │   ├── MatchDetailsModal.tsx # Modal overlay with match events, stats, stream/highlights
    │   ├── MatchHighlights.tsx   # Highlights reel for FINISHED matches with YouTube embed
    │   ├── Teams.tsx             # Team grid with expandable roster cards
    │   ├── Sponsors.tsx          # Sponsor showcase grouped by tier
    │   ├── Location.tsx          # Venue info with Google Maps embed
    │   ├── Footer.tsx            # Footer with social links; gear icon triggers admin panel
    │   ├── AdminPanel.tsx        # Admin command center: login form + match score/status editor
    │   └── auth.ts               # (Note: duplicate path — this is components/auth.ts,
    │                             #   distinct from services/auth.ts)
    │
    ├── seed/
    │   └── (seed script)         # Populated via `npm run seed` (tsx src/seed/seedFirebase.ts)
    │                             #   Writes data.ts content into Firebase. One-time use only.
    │
    └── utils/
        └── (utility helpers)     # Shared utility functions (formatting, etc.)
```

---

## Firebase Schema

The Realtime Database root contains four top-level keys:

```
/
├── tournament/
│   ├── meta/          # TournamentMeta: name, edition, year, tagline, matchDay,
│   │                  #   startDate, endDate
│   ├── hero/          # HeroContent: titleLine1, titleLine2, badgeText,
│   │                  #   subtitleText, backgroundImageUrl
│   └── venue/         # VenueInfo: name, address, mapEmbedUrl, stadiumLabel
│
├── teams/
│   └── <teamId>/      # Team: id, name, logo, group
│       └── roster/
│           └── <playerId>/   # Player: id, name, photo, position, bio
│
├── matches/
│   └── <matchId>/     # Match: id, homeTeam (Team object), awayTeam (Team object),
│       │              #   homeScore, awayScore, status (UPCOMING|LIVE|FINISHED),
│       │              #   date, time, streamUrl?, highlightsUrl?, aiCommentary?,
│       │              #   stats?: { possession, shots, fouls }
│       └── events/
│           └── <eventId>/    # PlayEvent: id, time, type (Goal|Yellow Card|Red Card|
│                             #   Substitution|Commentary), description, teamId?
│
└── sponsors/
    └── <sponsorId>/   # Sponsor: id, name, logoUrl, tier (Title|Platinum|Gold),
                       #   websiteUrl
```

All IDs under `teams/`, `matches/`, and `sponsors/` match the `id` field stored inside the object.

---

## Data Flow

```
Admin writes (AdminPanel.tsx)
  └─> services/db.ts helpers (e.g. updateMatch, addEvent)
        └─> Firebase Realtime Database (RTDB)
              └─> onValue listener in services/db.ts (subscribeToTournamentData)
                    └─> AppContext.tsx (state update)
                          └─> All subscribed components re-render
```

Key points:
- `subscribeToTournamentData` attaches a single `onValue` listener at the database root (`/`). Every change anywhere in the tree triggers a full snapshot callback.
- `AppContext` owns all client-side state. Components read from context; they never call Firebase directly.
- The admin panel calls `services/db.ts` write helpers which require an authenticated Firebase session (`auth != null` per security rules).
- The Gemini AI commentary is generated client-side via `@google/genai` using `VITE_GEMINI_API_KEY`.

---

## How to Add a New Admin Panel Tab

The `AdminPanel.tsx` component currently renders a single "Live Match Controller" section. To add a new tab (e.g., "Teams Manager"):

1. Add a `tab` state to `AdminPanel` with a union type: `'matches' | 'teams'`.
2. Render a tab bar above the content area — one button per tab, styled consistently with the existing monospace/uppercase design language.
3. Conditionally render the new tab's content based on `tab` state.
4. Wire the new tab's save/update actions to the appropriate `services/db.ts` helper (e.g., `upsertTeam`).
5. Read the relevant data from `useAppContext()` — teams, sponsors, etc. are already available in context.

---

## How to Add a New Configurable Field

Follow these four steps to add a new field (e.g., `broadcastChannel` to `TournamentMeta`):

**Step 1 — Add to the TypeScript type**

In `src/types.ts`, add the property to the relevant interface:

```typescript
export interface TournamentMeta {
  // ...existing fields...
  broadcastChannel?: string;
}
```

**Step 2 — Add to db.ts**

The existing `updateTournamentMeta` in `src/services/db.ts` uses a partial update, so no change is required there. If the field belongs to a different node, add a new helper following the same pattern.

**Step 3 — Expose in AppContext**

In `src/AppContext.tsx`, ensure the field flows from the raw Firebase snapshot through to the typed state. If `tournamentMeta` is already mapped, the new optional field will be included automatically since TypeScript allows extra keys in partial updates.

**Step 4 — Add to the admin tab and the display component**

- In the relevant admin tab component, add a labeled `<input>` or `<select>` and call the `db.ts` helper on change.
- In the display component that reads this field (e.g., `Hero.tsx`), read `tournamentMeta.broadcastChannel` from context and render it.

---

## Key Constraints

- **No SSR.** This is a pure client-side SPA. `vite.config.ts` does not configure SSR. `vercel.json` rewrites all paths to `index.html`. Do not add any server-side rendering or API routes.
- **All writes require Firebase Auth.** The database security rules reject any write from an unauthenticated client. The admin panel must complete `signIn` (via `services/auth.ts`) before calling any `db.ts` write helper.
- **The seed script is one-time only.** `npm run seed` writes the static data from `src/data.ts` to Firebase. Re-running it will overwrite any live edits made through the admin panel. Only run it against a fresh database or a dedicated staging project.
- **Environment variables must be prefixed `VITE_`.** Vite only exposes env vars with this prefix to the client bundle. All Firebase and Gemini credentials use this prefix. Never put secrets in `VITE_*` vars that should not be visible in the browser — Firebase keys and Gemini keys are intentionally client-exposed here.
- **`@` alias resolves to project root.** The Vite path alias `@` maps to the repository root (`.`), not `./src`. Imports such as `@/src/types` are valid.

---

## DEPLOYMENT CHECKLIST — Complete These Before Going Live

Code is complete. `npm run lint` and `npm run build` pass. All remaining steps are infrastructure setup.

### Status legend: ✅ done | ⬜ todo

---

### A. Firebase Setup (console.firebase.google.com)

⬜ **A1** — Create new Firebase project (name it `prabhananda-cup` or similar)
⬜ **A2** — Enable **Realtime Database** → Start in test mode → choose region (asia-south1 recommended)
⬜ **A3** — Enable **Authentication** → Sign-in method → Email/Password → Enable
⬜ **A4** — Create admin user: Authentication → Users → Add user → set email + password
⬜ **A5** — Copy Web App config: Project Settings → Your apps → SDK setup → Config → copy the object
⬜ **A6** — Create `.env.local` in project root using `.env.example` as template, paste config values
⬜ **A7** — Set Security Rules in Realtime Database → Rules tab:
```json
{ "rules": { ".read": true, ".write": "auth != null" } }
```
⬜ **A8** — Run seed script ONCE: `npm run seed` (pushes `src/data.ts` → Firebase, one-time only)
⬜ **A9** — Test locally: `npm run dev` → open localhost:3000 → verify data loads from Firebase

---

### B. GitHub Repo Setup

⬜ **B1** — Create new GitHub repo at github.com (name: `prabhananda-cup-4th-edition`, public or private)
⬜ **B2** — In project root run:
```
git init
git add .
git commit -m "Initial production-ready release"
git remote add origin https://github.com/YOUR_USERNAME/prabhananda-cup-4th-edition.git
git push -u origin main
```
⬜ **B3** — Add GitHub Secrets (repo Settings → Secrets and variables → Actions → New repository secret):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_DATABASE_URL`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_GEMINI_API_KEY`
  - `VERCEL_TOKEN` (get from vercel.com → Account Settings → Tokens)
  - `VERCEL_ORG_ID` (run `vercel whoami` after `vercel login`)
  - `VERCEL_PROJECT_ID` (created in step C3 below)

---

### C. Vercel Setup

⬜ **C1** — Log in: `vercel login` (browser auth)
⬜ **C2** — Link project: run `vercel` in project root → follow prompts → creates project on Vercel
⬜ **C3** — Get project ID: `vercel project ls` → copy Project ID → add as `VERCEL_PROJECT_ID` secret in GitHub
⬜ **C4** — Add all 8 `VITE_*` env vars in Vercel Dashboard → Project → Settings → Environment Variables
⬜ **C5** — Push to main → GitHub Actions runs → deploys to Vercel production URL automatically

---

### D. Verify End-to-End

⬜ **D1** — Visit production URL → data loads (teams, fixtures, sponsors)
⬜ **D2** — Click gear icon in footer → admin login with Firebase Auth credentials → all 6 tabs work
⬜ **D3** — Change a score in Matches tab → verify it updates live in another browser tab
⬜ **D4** — Change hero title in Hero tab → verify Hero section updates on the page

---

### MCP Servers (already configured in `.mcp.json`)

After approving `.mcp.json` in Claude Code, these are available:
- **github** MCP → Claude can create repos, push commits, manage PRs/issues directly
  - Requires: `GITHUB_PAT` env var set in Windows → `[System.Environment]::SetEnvironmentVariable("GITHUB_PAT", "ghp_...", "User")`
  - Get PAT: github.com → Settings → Developer settings → Personal access tokens → Fine-grained → scopes: `repo`, `read:org`
- **firebase** MCP (`firebase experimental:mcp`) → Claude can query/write RTDB, manage auth
  - Requires: `firebase login` run first (one-time browser auth)
- **vercel** CLI → deployed via `vercel --prod` bash command (no Vercel MCP server exists yet)
