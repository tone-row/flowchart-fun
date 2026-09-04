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

**Package manager:** pnpm 9.9.0 (lockfile v9.0). Nothing pins it — there's no `packageManager` field — so a machine with pnpm 10 installed will still run, but match 9.9.0 to avoid lockfile churn.
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

### Bringing Up a Fresh Clone (e.g. a secondary or dispatch machine)

A clean `git clone` **cannot run the app** — four things live outside the repo. In order:

1. **Node 22 + pnpm.** `.node-version` pins v22.13.0; pnpm is 9.9.0. If node is managed by `fnm`, note that `fnm env` is typically sourced from `.zshrc`, which **non-interactive shells do not read** — so `ssh host 'pnpm -v'` and any dispatched agent will fail with "command not found: node" even though it works in a terminal. Put the node bin dir on `PATH` from `.zshenv` instead.
2. **Env files.** Not in git and not creatable from `.env.example` alone: `app/.env` (~40 vars), `app/.env.local` (`PROJECT_ID`), and `app/.env.e2e` (test-account credentials, needed only for e2e). Either `pnpm env:pull` or copy them from a machine that has them. Note `app/.env` holds the **dev** Supabase project and Stripe **test** keys (`sk_test_…`/`pk_test_…`), never production — so local work can't touch real customer data or charge real cards. If you genuinely need production values, pull them explicitly rather than assuming this file has them.
3. **Vercel CLI login + project link.** `pnpm start` is `vercel dev`, which needs both an authenticated CLI (`vercel whoami`) and `.vercel/project.json`. `.vercel/` is gitignored, so copy `project.json` and log in (or copy `~/Library/Application Support/com.vercel.cli/auth.json`).
4. **`vercel.json`.** The committed file contains the SPA `"rewrites"` rule required in production; it **breaks `vercel dev`** locally, so delete that one line in your working copy. See the `vercel.json is Special` gotcha — the pre-commit hook keeps it unstaged. Any `git checkout`/`stash` of that file silently reinstates it, and the symptom is confusing (client routes stop resolving), so re-check it if local routing breaks.

Then `pnpm install && pnpm -F formulaic build && pnpm -F shared build`, and `pnpm start`. To run e2e or visual on that machine, also `npx playwright install chromium firefox`.

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

### ⚠️ Always open feature PRs against `dev` — pass `--base dev` explicitly

The repo's **default branch is `main`**, so `gh pr create` *without* `--base` silently targets `main`, which is wrong for every feature PR. Some tooling also reports `main` as "the branch you usually use for PRs" — ignore that here. Only the version-bump release PR (step 3) targets `main`, and it comes from `dev`, never from a feature branch.

```bash
git checkout -b robgordon/<short-description>      # branch off dev
gh pr create --base dev --title "..." --body "..."  # --base dev is REQUIRED
```

`dev` is protected and has a **merge queue** (squash). So `gh pr merge` fails on it — a PR has to be *enqueued*, either with `gh pr merge --auto --squash` or the `enqueuePullRequest` GraphQL mutation. Don't retry a plain `gh pr merge` and conclude the repo is broken.

Note that a branch protection rule uses the glob `[dm][ea][vi]*`, which matches **both** `dev` and `main` and requires status checks plus an approving review. That is intentional but easy to misread as applying to only one branch.

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

Pro access is determined by Stripe subscription status (`active` or `trialing`) OR an active **30-Day Pass** via `useHasProAccess()` in `lib/hooks.ts`. The pass is a $9 one-time `mode: "payment"` checkout whose PaymentIntent carries `metadata.ff_pass`; entitlement is derived live in `api/customer-info.ts` via `api/_lib/_pass.ts` (created + 30 days, refunds/disputes invalidate). No webhooks, no DB. Pass holders authenticate to the AI endpoints with their PaymentIntent id (`useProAiToken()` in `lib/hooks.ts`).

The sandbox warning modal (`SandboxWarning.tsx`) appears after 3 minutes of editing to encourage upgrade.

## Examples, Themes & Layouts

### Templates Overview

10 templates defined in `shared/src/templates.ts` (single source of truth, `as const` array). Each template is a file at `app/src/lib/templates/{name}-template.ts` exporting three things:

- `content: string` — starter DSL text for the editor
- `theme: FFTheme` — layout + visual config object (26 properties)
- `cytoscapeStyle: string` — Cytoscape CSS with variables, color/shape class definitions, and advanced selectors

Template names: default, decision-tree, process-lanes, blueprint, ink-mindmap, constellation, org-chart, sitemap, timeline, storyline.

> Always read `shared/src/templates.ts` rather than trusting this list — the set was fully replaced in the July 2026 theme overhaul and may change again.

### FFTheme Schema

- Type definition at `app/src/lib/FFTheme.ts`
- **If you change FFTheme, run `pnpm -F app theme:schema:generate`** to regenerate `FFTheme.schema.json`
- 26 properties in 4 groups:
  - **Global:** fontFamily, background, lineHeight
  - **Layout:** layoutName (10 options), direction (RIGHT/LEFT/DOWN/UP), spacingFactor
  - **Node:** shape, textMaxWidth, padding, borderWidth, borderColor, nodeBackground, nodeForeground, textMarginY, curveStyle, useFixedHeight, fixedHeight
  - **Edge:** edgeWidth, edgeColor, sourceArrowShape, targetArrowShape, sourceDistanceFromNode, targetDistanceFromNode, arrowScale, edgeTextSize, rotateEdgeLabel
- Edited via ThemeTab UI (`app/src/components/Tabs/ThemeTab.tsx`) using the formulaic library
- Stored in document metadata as `meta.themeEditor`
- Conversion: `toTheme(themeEditor)` in `app/src/lib/toTheme.ts` → returns `{ layout, style, postStyle }`

### Available Layouts

10 layout algorithms (from `LayoutName` type in `FFTheme.ts`):

| Layout | Engine | Best For |
|--------|--------|----------|
| dagre | dagre | Hierarchical flowcharts |
| klay | klayjs | Hierarchical (alternative) |
| layered | ELK | Hierarchical with balanced alignment |
| mrtree | ELK | Tree structures |
| stress | ELK | Force-directed, interactive |
| radial | ELK | Radial/spoke layouts |
| cose | fcose | Force-directed with animation |
| breadthfirst | cytoscape | Breadth-first tree |
| concentric | cytoscape | Concentric circles |
| circle | cytoscape | Simple circle |

Direction property maps to layout-specific direction configs (dagre: rankDir TB/LR/RL/BT; klay: klay.direction; ELK: elk.direction). Reference: https://js.cytoscape.org/ for Cytoscape layout/CSS docs.

### Cytoscape CSS (Not Browser CSS)

All CSS in `cytoscapeStyle` is **Cytoscape CSS** — different property names, selectors, and values from browser CSS. Reference: https://js.cytoscape.org/#style

Key features:
- **Variables:** `$varname: value;` — preprocessed by `app/src/lib/preprocessStyle.ts`, substituted throughout
- **Font imports:** `@import url(...)` — extracted and loaded via FontFace API
- **Dynamic class detection:** classes matching `type_name` pattern (e.g., `color_blue`, `shape_diamond`) auto-detected and made available in the right-click context menu on nodes/edges (`GraphContextMenu.tsx`)
- **Selectors:** `:childless` (leaf nodes), `:parent` (group nodes), `edge`, `[in_degree < 1]` (data attributes)
- **Three-stage pipeline:** themeStyle (generated from FFTheme) → customCss (user's cytoscapeStyle) → postStyle (utility classes). All concatenated unless `customCssOnly: true` in metadata.

Example from flowchart-template.ts cytoscapeStyle:
```css
$blue: #e3f2fd;
:childless.color_blue {
  background-color: $blue;
  color: $color;
}
:childless[in_degree > 0][out_degree > 1] {
  shape: diamond;
  height: $width;
}
```

### Built-in Utility Classes

From `app/src/lib/graphUtilityClasses.ts` (generated as postStyle, always available):

- **Shape classes** (`.shape_*`): All Cytoscape shapes (rectangle, roundrectangle, ellipse, triangle, diamond, star, hexagon, etc.) + "smart shapes" (circle, square, roundsquare) that enforce 1:1 aspect ratio
- **Border classes** (`.border_*`): none, solid, dashed, dotted, double — works on both nodes and edges
- **Color classes** (`.color_*`): **Defined per-template** in cytoscapeStyle, NOT global. Common set across most templates: red, orange, yellow, green, blue, pink, grey, white, black. Each template defines its own color values.
- **Text size classes** (from `getSize.ts`): text-sm (0.75x), text-base (1x), text-lg (1.5x), text-xl (2x)

Applied in the DSL with dot notation: `Node Name .color_blue .shape_diamond`

### How to Add a New Template

1. Create `app/src/lib/templates/{name}-template.ts` exporting `content`, `theme` (FFTheme), and `cytoscapeStyle`
2. Add the template name string to the array in `shared/src/templates.ts`
3. Rebuild shared: `pnpm -F shared build`
4. Generate screenshots (requires dev server running on port 3000 + ImageMagick installed):
   ```bash
   # Terminal 1:
   pnpm start
   # Terminal 2:
   pnpm -F app screenshot-templates {name}
   ```
5. Verify: `app/public/template-screenshots/thumb_{name}.png` (275x275) and `{name}.png` (full) exist
6. The template will automatically appear in LoadTemplateDialog, New chart page, and AI template chooser

### How to Edit an Existing Template

1. Modify the template file in `app/src/lib/templates/`
2. If visual changes were made, regenerate its screenshot: `pnpm -F app screenshot-templates {name}`
3. If FFTheme type was changed: `pnpm -F app theme:schema:generate`

### How to Remove a Template

1. Delete the template file from `app/src/lib/templates/`
2. Remove the name from `shared/src/templates.ts`
3. Rebuild shared: `pnpm -F shared build`
4. Delete the screenshot files from `app/public/template-screenshots/` ({name}.png and thumb_{name}.png)

### Screenshot System

- **Script:** `app/scripts/screenshot-templates.mjs`
- **Command:** `pnpm -F app screenshot-templates [optional-filter]`
- **Prerequisites:** Dev server on port 3000 (`pnpm start`), ImageMagick installed (`convert` command)
- **Process:**
  1. Playwright launches Chromium (1000x1000 viewport)
  2. Navigates to localhost:3000
  3. Calls `window.__load_template__(name, true)` to load each template
  4. Waits 3s for render, gets fullscreen link via `window.__get_screenshot_link__()`
  5. Navigates to fullscreen URL, screenshots the `[data-flowchart-fun-canvas="true"]` element
  6. ImageMagick resizes to 275x275 centered thumbnails
- **Output:** `app/public/template-screenshots/{name}.png` + `thumb_{name}.png`
- **Filter:** Pass a string to only screenshot matching templates (e.g., `pnpm -F app screenshot-templates mindmap` screenshots all mindmap variants)
- **Window globals** set up by `app/src/lib/loadTemplate.ts` (`useEnsureLoadTemplate` hook) and `app/src/lib/useEnsureGetScreenshotLink.ts`

### Templates in the AI Pipeline

- When user runs AI "prompt" or "convert", `runAi()` (`app/src/lib/runAi.ts`) first calls `/api/prompt/choose-template` to auto-select the best template for the user's prompt
- The choose-template endpoint uses a short system prompt to pick from the 13 template names (avoids "default"); the specific model is documented in the AI Integration table
- Selected template's `theme` and `cytoscapeStyle` are applied to the document **before** the AI streams generated text — so the graph looks right as text arrives
- Edit mode does NOT use template selection (it edits existing text in-place, preserving the current theme)

### Templates in Chart Creation UI

- **LoadTemplateDialog** (`app/src/components/LoadTemplateDialog.tsx`): "Examples" button in toolbar; shows grid of 13 thumbnails; user can independently toggle "Load layout and styles" and "Load default content" checkboxes
- **New hosted chart** (`app/src/pages/New.tsx`): template selector during creation; template content+theme baked into the chart at insert time
- **loadTemplate()** (`app/src/lib/loadTemplate.ts`): dynamically imports template module, merges theme into doc metadata, unfreezes nodePositions, unmounts/remounts graph for clean re-layout

### Key File Reference

| Component | File |
|-----------|------|
| Template names (source of truth) | `shared/src/templates.ts` |
| Template data files | `app/src/lib/templates/{name}-template.ts` |
| FFTheme type definition | `app/src/lib/FFTheme.ts` |
| Theme → Cytoscape conversion | `app/src/lib/toTheme.ts` |
| CSS preprocessing (variables, fonts, dynamic classes) | `app/src/lib/preprocessStyle.ts` |
| Utility classes (shapes, borders) | `app/src/lib/graphUtilityClasses.ts` |
| Node sizing + text size classes | `app/src/lib/getSize.ts` |
| Template loading function | `app/src/lib/loadTemplate.ts` |
| Screenshot script | `app/scripts/screenshot-templates.mjs` |
| Screenshot assets | `app/public/template-screenshots/` |
| ThemeTab UI | `app/src/components/Tabs/ThemeTab.tsx` |
| LoadTemplateDialog UI | `app/src/components/LoadTemplateDialog.tsx` |
| AI template chooser endpoint | `api/prompt/choose-template.ts` |
| AI runner (template integration) | `app/src/lib/runAi.ts` |

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

# 2. Unit tests
pnpm -F api test                           # API unit tests (~1s, @swc/jest)
pnpm -F app test -- --watchAll=false       # App unit tests (~30s)

# 3. E2E tests (~37s, requires `pnpm start` running on port 3000)
pnpm -F app e2e
```

**E2E tests require `pnpm start` (vercel dev)**, not `pnpm dev`. The tests hit `/api/*` routes that only exist via vercel dev.

### Unit Tests (app)

**Command:** `pnpm -F app test -- --watchAll=false`
**Framework:** Jest via react-scripts + React Testing Library
**Status:** 25 suites, 564 passed, 5 todo, 0 failures (verified 2026-09-03)
**Duration:** ~30s on Apple Silicon, ~90s on an older Intel Mac

Test files are in `app/src/` alongside source code (e.g., `Graph.test.tsx`, `AppContextProvider.test.tsx`, `toVisio.test.ts`).

Test utilities in `app/src/test-utils.tsx` wrap render with all providers (AppContext, Router, QueryClient). Helpers: `flushMicrotasks()`, `nextFrame()`, `sleep()`.

**Prerequisites:** `shared` and `formulaic` must be built first. No env vars needed.

**Jest config** is in `app/package.json` under `"jest"` key. Key settings:
- `transformIgnorePatterns` excludes `react-use-localstorage`, `monaco-editor`, and `monaco-editor-core` from ignore (forces Babel transform for ESM compat)
- If a new ESM-only dependency causes "Cannot use import statement outside a module" errors, add it to the negation pattern in transformIgnorePatterns

### API Type Check + Unit Tests

**Commands:** `pnpm -F api check` (`tsc --noEmit`) and `pnpm -F api test` (Jest via @swc/jest, config in `api/jest.config.js`). Test files sit next to source (e.g. `api/_lib/_pass.test.ts`, `api/prompt/_parseFlowchart.test.ts`).

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

**Current E2E Status (with `pnpm start` / vercel dev), verified 2026-09-03:**
- `not-logged-in.spec.ts`: **6/6 pass** on both Chromium and Firefox
- `logged-in.spec.ts`: **pass** (Chromium; Firefox skipped by design)
- `pro.spec.ts`: **8/8 pass** (Chromium only, serial execution)
- `sign-up.spec.ts`: entirely **skipped** (test.skip())

**Known E2E Issues:**
- The `capabilities` test in `not-logged-in.spec.ts` submits the feedback form, which sends a **real email via SendGrid**. Running the suite repeatedly in quick succession can make that one assertion ("Thank you for your feedback!") flake. Re-run before investigating.
- `sign-up.spec.ts` is entirely skipped
- **Must use `pnpm start` (vercel dev)**, not `pnpm dev` — tests that hit API routes will fail without the serverless functions

**Pro tests depend on a live Stripe test-mode subscription.** They authenticate as the pro account named by `TESTING_EMAIL_PRO` in `app/.env.e2e`; if its subscription lapses, every pro test fails with the same misleading symptom — "Create new chart" hangs on `/new` and never redirects to `/u/:id`. This is **not** a code or setup bug, so check the subscription before debugging anything else.

To diagnose and fix (all in **Stripe test mode** — `STRIPE_KEY` in `app/.env` is `sk_test_…`, so no real money is involved; verify `livemode: false` on anything you create):

```bash
SK=$(grep '^STRIPE_KEY=' app/.env | cut -d= -f2- | tr -d '"')
# 1. The API resolves the MOST RECENTLY CREATED customer for the email
#    (see getCustomerFromToken in api/_lib/_helpers.ts) — there are several
#    duplicates for this address, so subscribe the newest one or it won't count.
EMAIL=$(grep '^TESTING_EMAIL_PRO=' app/.env.e2e | cut -d= -f2- | tr -d '"')
curl -s -G https://api.stripe.com/v1/customers -u "$SK:" \
  --data-urlencode "email=$EMAIL" -d limit=10
# 2. Check its subscriptions for status active|trialing
curl -s -G https://api.stripe.com/v1/subscriptions -u "$SK:" -d "customer=$CUS" -d "status=all"
# 3. If lapsed: attach a test card, make it default, subscribe to the yearly price
curl -s -X POST https://api.stripe.com/v1/payment_methods/pm_card_visa/attach -u "$SK:" -d "customer=$CUS"
curl -s -X POST https://api.stripe.com/v1/customers/$CUS -u "$SK:" -d "invoice_settings[default_payment_method]=$PM"
curl -s -X POST https://api.stripe.com/v1/subscriptions -u "$SK:" \
  -d "customer=$CUS" -d "items[0][price]=$STRIPE_PRICE_ID_YEARLY" -d "payment_behavior=error_if_incomplete"
```

The price must be one of `validStripePrices` (`api/_lib/_validStripePrices.ts` = `STRIPE_PRICE_ID` + `STRIPE_PRICE_ID_YEARLY` + `OTHER_VALID_STRIPE_PRICE_IDS`), otherwise the sub is active in Stripe but the app still won't grant pro. Last renewed 2026-09-03 on the yearly price, paid through 2027-09-03.

### Formulaic Tests

**Command:** `pnpm -F formulaic test -- --run`
**Status:** All test cases are commented out — effectively no tests exist.

### Shared Tests

No test files exist in the `shared` package.

> **Maintainer note:** E2E test coverage is between "bad and moderate" — roughly 50% of happy paths, with no edge case or error coverage. They've been problematic over the years. Unit tests are well-maintained and passing. If we ever migrate off CRA, E2E tests will become much more important and we'll need to write more.

### Visual Regression (templates)

Pixel-diffs all 10 templates' rendered graphs against committed golden images — the rendering half of the safety net (the logic half is the characterization tests in `app/src/lib/*.characterization.test.ts`). Runs via its own config (`app/playwright.visual.config.ts`), NOT the e2e config. See `app/e2e/visual/README.md`.

> **⚠️ RUN THIS ON ANY VISUALLY SIGNIFICANT CHANGE.** It is currently a **local, manual gate — NOT wired to CI** (goldens are macOS-specific; Linux goldens via the Playwright Docker image is a follow-up). So CI will NOT catch a rendering regression for you. If you touch anything that can change how a chart renders — `toTheme.ts`, `graphUtilityClasses.ts`, `getSize.ts`, `preprocessStyle.ts`, the Cytoscape style/layout pipeline, `FFTheme`, or any template file — you must run it yourself.

```bash
# the app must be served; if :3000 is taken by another project, use another port:
BROWSER=none PORT=3001 pnpm -F app dev
E2E_START_URL=http://localhost:3001 pnpm -F app visual          # compare against goldens
E2E_START_URL=http://localhost:3001 pnpm -F app visual:update   # regenerate after an INTENTIONAL change
```

After an intentional visual change: regenerate goldens, **eyeball the diff**, then commit the updated `*.png` goldens. The 2 force-directed templates (`ink-mindmap`, `constellation`) use frozen-position fixtures in `app/e2e/visual/fixtures/` (`pnpm -F app visual:fixtures`); regenerate those only if their content/theme changes.

**Which machines the goldens are valid on.** The goldens are **macOS-specific**, but they are *not* CPU-architecture-specific: they were generated on Apple Silicon and verified 2026-09-03 to pass 10/10 unchanged on an older **Intel** Mac (macOS 15.7.9). So it is safe to run — and to trust a failure from — `pnpm -F app visual` on any macOS machine, including a secondary/dispatch box. What still does *not* work is **Linux**, which is why this is not in CI; a Linux golden set via the Playwright Docker image remains the follow-up. Never regenerate goldens on Linux and commit them.

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
