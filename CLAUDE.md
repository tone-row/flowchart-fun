# Flowchart Fun

A text-to-flowchart editor. Users type in a custom DSL and see a live graph visualization. Supports local (sandbox) and hosted (cloud) charts, with a pro subscription tier (~500 paying customers).

**Live site:** flowchart.fun (dev site: dev.flowchart.fun)
**GitHub:** tone-row/flowchart-fun
**Single maintainer:** Rob Gordon (~1400+ commits)

## Monorepo Structure

**pnpm workspaces** monorepo with 4 packages:

```
flowchart-fun/
├── app/        → React frontend (CRA / react-scripts 5.0.1)
├── api/        → Vercel serverless functions (Node.js)
├── shared/     → Shared TypeScript types & constants (compiled with tsc)
├── formulaic/  → React form-building library (compiled with microbundle)
```

**Package manager:** pnpm (v10)
**Node version:** 22 (see `.node-version`)

> **Maintainer note:** The monorepo structure with all these packages partly exists because of CRA/webpack limitations that needed workarounds. Some of this sprawl is historical.

## Getting Started

```bash
pnpm install

# IMPORTANT: shared and formulaic must be built before the app can run
pnpm -F shared build
pnpm -F formulaic build

# Start the dev server (use this for local development)
pnpm start
```

### Dev Server: `pnpm start` vs `pnpm dev`

**Use `pnpm start`** (runs `vercel dev`) for local development. This starts the React app AND exposes the `/api/*` serverless functions. Required for features like feedback submission, AI prompts, auth flows, and Stripe — and required for E2E tests to pass.

`pnpm dev` (runs `pnpm -F '*' --parallel dev`) only starts the React app + workspace watchers without API routes. Use this only if you're working on purely frontend changes and don't need API access.

Both serve on port 3000 by default.

### Environment Variables

The app requires env vars in `app/.env.local`. Pull from Vercel with:
```bash
pnpm env:pull    # runs: vercel env pull app/.env
```

Key variables (see `app/.env.example`):
- `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` — Supabase auth & DB
- `REACT_APP_STRIPE_KEY` / `STRIPE_KEY` — Stripe payments
- `REACT_APP_SENTRY_ENVIRONMENT` — Sentry error tracking
- `SENDGRID_API_KEY` — Email via SendGrid
- `NOTION_ACCESS_TOKEN` — Notion integration (blog/roadmap)

## Build Order

Strict dependency order:

```
formulaic → shared → app
```

Root `build` script: `pnpm -F formulaic build && pnpm -F shared build && pnpm -F app build`

If you modify `shared/` or `formulaic/`, rebuild them before the app will pick up changes (or use `pnpm dev` which runs watch mode for all).

## Release Workflow

1. Create feature branch off `dev` (e.g., `robgordon/ff-485-add-folders`), merge back into `dev` via PR
2. On `dev`, bump version in `app/package.json` and commit as `chore: version {type}` (where type is `feature`, `fix`, `patch`, or `hotfix`)
3. Create PR from `dev` → `main` with title being just the version number (e.g., `v1.63.1`)
4. Merge triggers `.github/workflows/release.yml` which uses `justincy/github-action-npm-release` to auto-create a GitHub Release + tag from `app/package.json` version
5. Vercel auto-deploys from `main`

Multiple feature PRs may accumulate on `dev` before a single version bump + release to `main`, or a single feature may get its own release. All merges to `main` come exclusively from `dev` — never direct feature branch → main.

The version in `app/package.json` is the source of truth. Tags are created automatically.

## Core Architecture

### The Graph-Selector DSL

The core feature is a **custom text DSL** parsed by the `graph-selector` npm package (v0.13.0). This is the most fundamental dependency in the project — it's what makes flowchart.fun work.

Key pipeline: **Text → parse() → toCytoscapeElements() → Cytoscape renders**

Main parsing entry point: `app/src/lib/getElements.ts`

> **Maintainer note:** `graph-selector` lives in a separate repository (also maintained by Rob). It has extensive unit tests. The workflow for parser changes is: make changes in that repo, publish to npm, bump version here. It was made separate thinking others might use it, but in practice nobody else does. Moving it into this monorepo is an option if it would reduce friction — the tests would come with it.

### Document Format

Charts are stored as text with embedded metadata:

```
Node A
  Node B
    Node C

=====
{"themeEditor": {...}, "cytoscapeStyle": "..."}
=====
```

- `=====` — Current delimiter for JSON metadata (`newDelimiters` in `app/src/lib/constants.ts`)
- `~~~` — Legacy delimiter (YAML frontmatter via gray-matter)
- `¼▓╬` — Legacy hidden graph options divider

The parsing logic in `app/src/lib/prepareChart/prepareChart.ts` handles all three formats and merges them, with migration logic for old layouts.

> **DO NOT REMOVE** the legacy delimiter handling. There are ~500 paying customers with existing charts that may use older formats. Removing backward compatibility could break their projects.

### State Management

**Primary:** Zustand stores

| Store | File | Purpose |
|-------|------|---------|
| `useDoc` | `lib/useDoc.ts` | Document text, metadata, and chart details |
| `useEditorStore` | `lib/useEditorStore.ts` | Monaco editor instance & state |
| `useGraphStore` | `lib/useGraphStore.ts` | Cytoscape layout, elements, zoom, pan, selected nodes |
| `useMobileStore` | `lib/useMobileStore.ts` | Mobile UI tab/menu state |
| `usePaywallModalStore` | `lib/usePaywallModalStore.ts` | Paywall dialog state |
| `usePromptStore` | `lib/usePromptStore.ts` | AI prompt/diff state |
| `useParseErrorStore` | `lib/useDoc.ts` | Parser error tracking |

**Secondary:** React Context (`AppContextProvider.tsx`) provides auth session, theme, language, and Stripe customer info.

### Routing

Routes use short paths (defined in `app/src/components/Router.tsx`):

| Path | Page | Purpose |
|------|------|---------|
| `/` | Sandbox | Local storage editor (home) |
| `/u/:id` | EditHosted | Edit a hosted chart |
| `/p/:public_id` | Public | Public read-only view (permalink) |
| `/r/:graphText` | ReadOnly | Encoded chart in URL |
| `/c/:graphText` | ReadOnly | Compressed chart in URL |
| `/f/:graphText` | Fullscreen | Fullscreen read-only view |
| `/charts` | MyCharts | User's saved charts (auth required) |
| `/new` | New | Create hosted chart (auth required) |
| `/a` | Account | Account settings |
| `/l` | LogIn | Login page |
| `/s` | Settings | App settings |
| `/o` | Feedback | Feedback form |
| `/d` | DesignSystem | Internal design system page |
| `/pricing` | Pricing2 | Pricing page |

> **Maintainer note:** The single-letter routes (`/a`, `/l`, `/s`, `/o`, `/d`) were originally chosen to avoid conflicting with user project names, but that reasoning no longer holds up. They're kept for backward compatibility.

### Free vs Pro Feature Split

**Free (Sandbox):**
- 1 temporary chart stored in localStorage (`flowcharts.fun.sandbox`)
- Charts expire after 24 hours (client-side check in `Sandbox.tsx` via `meta.expires`)
- Exports watermarked (base64 PNG watermark in constants.ts, 15% width, bottom-left, 80% opacity)
- Lower export resolution (1.5x scale)
- PNG/JPG export only
- Theme editor available
- AI convert: 2 requests per 30 days

**Pro ($4/month):**
- Unlimited permanent charts stored in Supabase DB
- No watermark, higher resolution exports (3x scale)
- SVG export
- Import from Visio, Lucidchart, CSV
- AI editing: 3 requests per minute
- Custom sharing options
- Local file support
- Priority support

Pro access is determined by Stripe subscription status (`active` or `trialing`) via `useHasProAccess()` in `lib/hooks.ts`.

The sandbox warning modal (`SandboxWarning.tsx`) appears after 3 minutes of editing to encourage upgrade.

## Tech Stack Details

### Frontend (app/)
- **React 18.2** with CRA (react-scripts 5.0.1) — no eject, no craco
- **TypeScript 5.5.3**
- **Cytoscape.js 3.31** with layout plugins: dagre, klay, elk, fcose, cose-bilkent
- **Monaco Editor** (pinned v0.33.0) — code editor with custom syntax highlighting from graph-selector
- **Radix UI** — headless component library (dialogs, dropdowns, tabs, toasts, etc.)
- **Tailwind CSS 3.2.6** — utility classes, dark mode via `dark:` prefix
- **@tone-row/slang** — legacy CSS-in-JS design token system (see Slang section below)
- **CSS Modules** — scoped styles via `*.module.css` files
- **Zustand** — state management
- **React Query v3** — server state & caching
- **Lingui** — i18n (8 languages: en, fr, zh, de, hi, ko, pt-br, es)
- **Framer Motion** — animations
- **Stripe** (react-stripe-js) — payment UI
- **Supabase** (supabase-js v2) — auth & database
- **Sentry** — error tracking
- **PostHog** — product analytics
- **React Router v6** — routing

### Backend (api/)
- **Vercel serverless functions**
- **Supabase** — auth verification, database queries
- **Stripe** — payment processing, subscription management
- **OpenAI** (via Vercel AI SDK) — AI flowchart generation/editing (see AI section)
- **SendGrid** — transactional email
- **Notion API** — blog content, roadmap (still renders but no new posts in a while)
- **Upstash** — rate limiting via Redis
- **Zod** — request validation

### Shared (shared/)
- TypeScript-only, no runtime deps
- Exports: template names, ImportDataFormType, blog utilities
- Built with `tsc` to CommonJS

### Formulaic (formulaic/)
- Generic `createControls<T>()` form builder framework
- Built with microbundle (CJS/ESM/UMD outputs)
- Uses Vitest for tests

> **Maintainer note:** Formulaic was an experiment in simplifying form markup generation. In practice it may have made things more complex rather than simpler. But the theme tab (`app/src/components/Tabs/ThemeTab.tsx`) is deeply built on it — it renders all 27 FFTheme properties across 5 sections using 7 custom controls (select, range, text, color, checkbox, fontpicker, customCss). We're stuck with it for now.

## Styling System

Three overlapping systems exist for historical reasons:

1. **Tailwind CSS** — preferred for new code, utility-first classes
2. **CSS Modules** — `*.module.css` files with scoped class names, used by many existing components
3. **@tone-row/slang** — legacy auto-generated design tokens and typed `Box`/`Type` components from `src/slang/config.ts`

Dark mode: controlled by `AppContext.theme`, adds `dark` class to `<body>`. Slang's `colors` and `darkTheme` from `src/slang/config.ts` are used in `AppContextProvider.tsx`.

### Slang Status

`@tone-row/slang` is a CSS-in-JS library also written by the maintainer. It generates code in `src/slang/` — those files say "Do not edit this file directly". Running `pnpm -F app theme` regenerates them.

Currently **15 files** still import from slang, mostly using the `Box` component: App.tsx, Graph.tsx, Layout.tsx, Settings.tsx, Loading.tsx, GraphWrapper.tsx, ShareDialog.tsx, Account.tsx, Blog.tsx, and several others.

> **Maintainer note:** The Box and Type components from slang are disliked and ideally would be replaced with plain Tailwind. There was an attempt to remove slang entirely but it wasn't fully successful. The `theme` and `theme:watch` scripts are rarely touched. New code should use Tailwind, not slang components.

Note: `app/package.json` still has a `start` script referencing `yarn theme:watch` — this is legacy/dead and the actual dev command is `dev`.

## Internationalization (i18n)

The app uses **Lingui** for internationalization, supporting 8 languages: English, French, Chinese, German, Hindi, Korean, Brazilian Portuguese, and Spanish.

### Wrapping Copy

All user-facing text must be wrapped in Lingui macros:

- **JSX content:** `<Trans>Hello world</Trans>` (from `@lingui/macro`)
- **JS strings** (e.g. props, variables): `` t`Hello world` `` (from `@lingui/macro`)

If you change, add, or remove any user-facing copy, you **must** run the translation pipeline before committing.

### Translation Pipeline

After any copy changes, run these commands in order:

```bash
pnpm -F app extract          # Extract new/changed strings from source
pnpm -F app autotranslations # Auto-translate to all supported languages
pnpm -F app compile          # Compile translation catalogs for runtime
```

Then commit the updated locale files (in `app/src/locales/`) alongside your code changes.

> **Important:** Skipping this workflow means new or changed copy will only appear in English for non-English users. Always run the full extract → autotranslations → compile pipeline when copy changes.

## AI Integration

The AI features use OpenAI via Vercel AI SDK. All endpoints are in `api/prompt/`.

### AI Features

| Feature | Endpoint | Model | Access |
|---------|----------|-------|--------|
| Convert to Flowchart | `/api/prompt/convert` | gpt-4-turbo | Free: 2/30 days, Pro: 3/min |
| Edit with AI | `/api/prompt/edit` | gpt-4-turbo-2024-04-09 | Pro only: 3/min |
| Generate Flowchart | `/api/prompt/prompt` | gpt-4-turbo | Free: 2/30 days, Pro: 3/min |
| Choose Template | `/api/prompt/choose-template` | gpt-3.5-turbo | All: 3/min |
| Speech-to-Text | `/api/prompt/speech-to-text` | whisper-1 | Pro only |

Rate limiting uses Upstash Redis (`@upstash/ratelimit`). Default model is set in `api/prompt/_shared.ts`.

> **Maintainer note:** The AI integration uses outdated models (gpt-4-turbo, gpt-3.5-turbo) from early 2024. This is one of the big things that needs updating — the models should be migrated to newer options (gpt-4o, gpt-4o-mini, etc.). The prompts teach the AI the graph-selector syntax so it can generate valid flowchart text. The `openai` v3.2.1 package in app/ may be dead code (api/ uses v4.24.2).

### Package Version Mismatches (AI)
- `@ai-sdk/openai`: app v0.0.37 vs api v0.0.45
- `ai`: app v3.2.32 vs api v3.3.6
- `openai`: app v3.2.1 vs api v4.24.2 (major version gap)

## Testing

### Running Tests After Changes

Run the full verification suite after making changes:

```bash
# 1. Type check (fast, catches type errors)
pnpm -F api check                          # API types (~2s)
pnpm -F app check                          # App types (~10s)

# 2. Unit tests (8 suites, 32 tests, ~28s)
pnpm -F app test -- --watchAll=false

# 3. E2E tests (~37s, requires `pnpm start` running on port 3000)
pnpm -F app e2e
```

**E2E tests require `pnpm start` (vercel dev)**, not `pnpm dev`. The tests hit `/api/*` routes that only exist via vercel dev.

### Unit Tests (app)

**Command:** `pnpm -F app test -- --watchAll=false`
**Framework:** Jest via react-scripts + React Testing Library
**Status:** 8 suites, 32 passed, 5 todo, 0 failures
**Duration:** ~28 seconds

Test files are in `app/src/` alongside source code (e.g., `Graph.test.tsx`, `AppContextProvider.test.tsx`, `toVisio.test.ts`).

Test utilities in `app/src/test-utils.tsx` wrap render with all providers (AppContext, Router, QueryClient). Helpers: `flushMicrotasks()`, `nextFrame()`, `sleep()`.

**Prerequisites:** `shared` and `formulaic` must be built first. No env vars needed.

**Jest config** is in `app/package.json` under `"jest"` key. Key settings:
- `transformIgnorePatterns` excludes `react-use-localstorage`, `monaco-editor`, and `monaco-editor-core` from ignore (forces Babel transform for ESM compat)
- If a new ESM-only dependency causes "Cannot use import statement outside a module" errors, add it to the negation pattern in transformIgnorePatterns

### API Type Check

**Command:** `pnpm -F api check`
**What it does:** `tsc --noEmit` — type checking only, no tests

### E2E Tests (Playwright)

**Command:** `pnpm -F app e2e`
**Framework:** Playwright 1.45.2
**Config:** `app/playwright.config.ts`

**Prerequisites:**
1. `vercel dev` running on port 3000 (`pnpm start`) — **NOT** `pnpm dev`. E2E tests hit `/api/*` routes (e.g., feedback form → `/api/mail`) which only exist via vercel dev.
2. Playwright browsers installed: `npx playwright install`
3. Environment file: `app/.env.e2e` (contains test account credentials)

**Run against a different port:**
```bash
E2E_START_URL="http://localhost:8080" pnpm -F app e2e
```

**Debug mode (Chromium only, single worker, UI):**
```bash
pnpm -F app e2e:debug
```

**Test files** in `app/e2e/`:

| File | Tests | Auth Required | Notes |
|------|-------|---------------|-------|
| `not-logged-in.spec.ts` | Theme editor, exports, paywalls, settings, language | No | Most reliable suite |
| `logged-in.spec.ts` | Login, chart creation, account access, logout | Yes (basic) | Chromium only |
| `pro.spec.ts` | Create/rename/publish charts, SVG export, import CSV | Yes (pro) | Chromium only, serial |
| `sign-up.spec.ts` | Full Stripe signup flow | No | **SKIPPED** (test.skip()) |

**E2E Config Details:**
- 12 parallel workers, 120s timeout, 1200x1080 viewport
- Runs Chromium + Firefox (normal mode) or Chromium only (debug)
- Max 3 failures before stopping
- Tests add `?isE2E=true` to URLs for special E2E handling
- `window.__set_text()` is used to programmatically set editor content

**Current E2E Status (with `pnpm start` / vercel dev):**
- `not-logged-in.spec.ts`: **5/6 pass** — 1 flaky: Mermaid Live popup URL check has a timing issue (test reads URL before redirect completes)
- `logged-in.spec.ts`: **7/7 pass** (1 Firefox skipped by design)
- `pro.spec.ts`: **all pass** (Chromium only, serial execution)
- `sign-up.spec.ts`: entirely **skipped** (test.skip())

**Known E2E Issues:**
- Pro tests depend on the `.env.e2e` pro account (`rob.gordon+111@tone-row.com`) having an active Stripe subscription — if it lapses, all pro tests fail
- The Mermaid Live test in `not-logged-in.spec.ts:45` is flaky due to popup redirect timing
- `sign-up.spec.ts` is entirely skipped
- **Must use `pnpm start` (vercel dev)**, not `pnpm dev` — tests that hit API routes will fail without the serverless functions

### Formulaic Tests

**Command:** `pnpm -F formulaic test -- --run`
**Status:** All test cases are commented out — effectively no tests exist.

### Shared Tests

No test files exist in the `shared` package.

> **Maintainer note:** E2E test coverage is between "bad and moderate" — roughly 50% of happy paths, with no edge case or error coverage. They've been problematic over the years. Unit tests are well-maintained and passing. If we ever migrate off CRA, E2E tests will become much more important and we'll need to write more.

## CI/CD

- **GitHub Actions:**
  - `test.yml` — runs on all pushes (build shared, run app tests + api type check)
  - `e2e.yml` — runs on PRs (waits for Vercel preview, runs Playwright)
  - `release.yml` — runs on push to main (auto GitHub release from app/package.json version)
- **Vercel:** auto-deploys on push, preview deployments on PRs
- **Husky pre-commit:** lint-staged (eslint + prettier) + TypeScript check + unstage vercel.json

## Key Gotchas & Landmines

### CRA (Create React App)
The app uses `react-scripts` which is effectively unmaintained. This means:
- No easy webpack customization (no craco/rewired)
- Stuck with CRA's webpack 5 config
- Buffer polyfill is manually imported in `index.tsx`
- Some transform ignores needed in jest config for monaco-editor
- Webpack dev server deprecation warnings (onAfterSetupMiddleware/onBeforeSetupMiddleware) — not actionable without ejecting

> **Maintainer note:** Would love to migrate off CRA (to Vite or similar), but it's been too risky and too large to attempt without dedicated bandwidth. Some branches may have attempted ejecting but never merged. The CRA limitations are partly why the monorepo has so much structural complexity.

### vercel.json is Special
The committed version contains a `"rewrites": [{ "source": "/(.*)", "destination": "/" }]` rule needed for SPA client-side routing in production. But this rewrite breaks `vercel dev` locally, so the local working copy has it removed. The pre-commit hook (`git reset HEAD vercel.json`) prevents accidentally committing the local version without the rewrites. **Do not commit changes to vercel.json** — the hook handles this automatically.

### Monaco Editor Pinned Version
`monaco-editor` is pinned to exactly `0.33.0` (not `^0.33.0`). Intentional — newer versions may break the integration.

### graph-selector is External
The DSL parser is a separate npm package. Changes to parsing require publishing a new version of `graph-selector` and bumping here. See architecture section for more detail.

### Cytoscape Rendering Pipeline is Fragile
The flow from user typing → parsing → updating the Cytoscape instance has known gotchas. There have been weird bugs related to timing, re-rendering, and state synchronization between the editor, parser, and graph view. Be careful when modifying anything in this pipeline.

### Three Delimiter Formats — DO NOT REMOVE
Document parsing handles three formats for backward compatibility. ~500 paying customers may have charts using any format. Do not remove legacy format handling.

### Route Naming
Many routes use single-letter paths (`/a`, `/l`, `/s`, `/o`, `/d`). See the routing table for what they map to.

### Dev Users Cron
The `deleteDevUsers` cron job (daily at 4 AM) prevents people from signing up on dev.flowchart.fun with Stripe test credentials and getting free access. It's a safety hatch, not just for test cleanup.

### Local Storage Keys
- `flowcharts.fun.sandbox` — sandbox chart data (with `meta.expires` for 24-hour TTL)
- `flowcharts.fun.user.settings` — user preferences (theme, language)

### `.parcel-cache/` at Root
Origin unknown. Possibly from formulaic's dev build. Should probably be gitignored.

## Dead Code & Technical Debt (Known, Not Yet Addressed)

There is significant technical debt that is acknowledged but not yet prioritized:

- **OpenAI version mismatch** between app (v3) and api (v4) — app v3 may be dead code
- **React Query v3** — could upgrade to TanStack Query v5
- **Supabase SDK** — likely outdated, still functional
- **Slang components** — 15 files still depend on Box/Type, ideally replaced with Tailwind
- **Legacy `yarn` reference** in app's `start` script
- **AI models** — using gpt-4-turbo and gpt-3.5-turbo, need migration to newer models
- **Browserslist** — data is 13+ months old (`npx update-browserslist-db@latest`)

> **Maintainer note:** There are a lot of open questions around dead code. Eventually we might tackle these, but not ready yet. Worth tracking as potential future work but don't attempt cleanup without explicit direction.

## API Endpoints

Key serverless functions in `api/`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/prompt/*` | POST | AI flowchart generation/editing |
| `/api/customer-info` | POST | Get Stripe customer data |
| `/api/create-checkout-session` | POST | Start Stripe checkout |
| `/api/cancel-subscription` | POST | Cancel subscription |
| `/api/resume-subscription` | POST | Resume subscription |
| `/api/customer-portal-session` | POST | Stripe customer portal |
| `/api/public` | POST | Get public chart data |
| `/api/generate-public-id` | POST | Generate shareable chart ID |
| `/api/mail` | POST | Send email via SendGrid |
| `/api/update-email` | POST | Update user email |
| `/api/version` | GET | Get app version |
| `/api/changelog` | GET | Get changelog (from GitHub releases) |
| `/api/roadmap` | GET | Get roadmap (from Notion) |
| `/api/cron/deleteDevUsers` | CRON | Daily dev site user cleanup (4 AM) |

## Export Formats

Charts can be exported as: PNG, JPG, SVG (pro only), PDF, JSON Canvas, Excalidraw, Visio XML, Mermaid, CSV.
