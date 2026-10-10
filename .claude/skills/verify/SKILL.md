---
name: verify
description: Drive the real flowchart-fun web app in headless Chromium and capture proof that a feature works — sandbox editor, themes/templates, export, hosted charts, paywalls. Use to verify a change in the running app, to check behavior before and after a refactor or framework migration, or when asked to run or screenshot the app.
---

# Verify flowchart-fun

Launch an isolated instance, check it with doctor, drive a feature through the UI with a Playwright steps file, keep the evidence, tear the instance down. Everything runs from the repo root.

The feature map in [`features/README.md`](features/README.md) is the recipe book: read it, then the file for the feature you are proving. A proof covers every entry point that file lists for the behavior you changed.

## Launch

```bash
.claude/skills/verify/scripts/launch.sh 3001          # vercel dev: React app + /api/*
.claude/skills/verify/scripts/launch.sh 3002 --client # React only, no /api (no pro status, AI, mail, Stripe, public links)
```

Blocks until ready (~15s warm, longer on a cold webpack cache) and prints `READY http://localhost:<port>`. Ready means `/static/js/bundle.js` serves 200 and, in full mode, `/api/version` answers. Use 3001+: `:3000` on this machine is often another project. The script refuses a port it does not own, removes the SPA `"rewrites"` line from `vercel.json` if present (the documented local working-copy state; the pre-commit hook keeps it out of commits), and builds `shared`/`formulaic` if their `dist` is missing.

Default to full mode. Use `--client` only when the feature never touches `/api` and `vercel dev` is unavailable (not logged in: `vercel whoami`).

## Doctor

```bash
.claude/skills/verify/scripts/doctor.sh 3001
```

Read-only. Prints `HEALTHY` or each `FAIL`: instance started by verify and owning the port, page is flowchart-fun, bundle compiled, `/api/version` equals `app/package.json`, client routes resolve, `app/.env` present with a **test-mode** Stripe key, `app/.env.e2e` test accounts present, Playwright resolvable. Run it first, and again whenever a drive fails in a way that smells environmental.

## Drive

Write a steps file (anywhere; the scratchpad is fine) and run it:

```bash
node .claude/skills/verify/scripts/drive.mjs path/to/steps.mjs [--port 3001] [--label name] [--headed]
```

```js
// steps.mjs — throw (or fail an expect) to fail the run
export default async ({ page, context, ff, step, expect }) => {
  step("type a chart");
  await ff.open("/");
  await ff.typeDoc("A\n  B");
  const g = await ff.waitForGraph((g) => g.nodes.length === 2);
  expect(g.edges[0]).toMatchObject({ source: "A", target: "B" });
  await ff.shot("graph", ff.canvas());
};
```

A drive that tests for a page freeze must put a deadline on every Playwright call it makes after the freeze can occur: a frozen page never answers, so a plain `await page.evaluate(...)` or `ff.waitForGraph()` waits forever and the run never reaches FAIL. Wrap each such call in a `Promise.race` against a timer (see `examples/css-unclosed-comment.mjs`). Only the harness teardown (screenshot, trace, browser close) carries its own deadline.

Each run gets a fresh browser context: empty localStorage, no login, nothing shared with the user's Chrome. `page` is Playwright 1.45 and `expect` is `@playwright/test`'s auto-retrying expect. `ff` holds the repo-specific moves:

| Helper | What it does |
|---|---|
| `ff.open(path, {e2e})` | Navigate; on editor routes wait for Monaco. `e2e:true` adds `?isE2E=true`, which shortens the sandbox upsell modal from 3 min to 20s — only for testing that modal. |
| `ff.typeDoc(text)` | Type the whole document key by key. Defeats Monaco auto-indent, so the editor ends up holding exactly `text`. |
| `ff.pasteDoc(text)` | Real clipboard paste. 3+ lines also raise the "Convert to Flowchart Fun syntax?" overlay. |
| `ff.editorText()` | Full Monaco model text. |
| `ff.graph()` / `ff.waitForGraph(pred)` | Read the rendered Cytoscape graph from `window.__cy`: nodes (label, classes, parent, position, size) and edges (source/target **labels**, label). `waitForGraph` also waits for positions to stop moving. |
| `ff.canvas()` | The graph element `[data-flowchart-fun-canvas="true"]`. |
| `ff.shot(name, locator?)` | Screenshot into the evidence dir. |
| `ff.download(() => click)` | Save a triggered download to `downloads/`. |
| `ff.storage(key)` | Parsed localStorage value; the sandbox lives in `flowcharts.fun.sandbox`. |
| `ff.login("basic" \| "pro")` | Sign in through the real `/l` form with the `app/.env.e2e` accounts. `pro` waits until the Upgrade link detaches. |
| `ff.supabase(pathAndQuery, init)` | Dev Supabase REST as the logged-in user (their JWT, RLS applies). For reading stored side effects and seeding charts. |
| `ff.chartName(suffix?)` | A hosted chart name unique to this run, `drive <run id> <suffix>`. The run id is the evidence dir name, so a chart left by a killed run traces back to its evidence. |
| `ff.note(x)` | Append a line to `steps.log`. |

Every hosted chart the run inserts, through the UI or a `ff.supabase` POST, is deleted by id when the run ends, whether the steps passed, failed or threw, and on SIGINT/SIGTERM. The harness reads each id from the insert's own response and deletes with `id=in.(...)` plus the inserting user's id, so a drive never needs a cleanup `finally` and can never delete a chart it did not create. `result.json` records `charts: { created, deleted }`; the summary line prints the counts. A chart the drive deleted itself shows as created but not deleted. Anything else a drive creates (folders, public links) it removes itself, by id.

Runnable, passing examples for every mapped feature live in [`examples/`](examples/) — copy the nearest one rather than starting blank.

Handles, in order of preference: role + accessible name (`getByRole("button", { name: "Examples" })`), `aria-label` (`getByLabel("Export")`), `data-testid` (`getByTestId("Editor Tab: Theme")`), route paths. These are user-visible or test-stable and survive a framework migration; CSS classes and DOM position do not.

## Evidence

Every run writes `.verify/evidence/<stamp>-<label>-<4 hex>/` (gitignored; the dir name is the run id) and prints its path plus a one-line `PASS`/`FAIL` summary:

- `steps.log` — timestamped steps, notes, shots, downloads, the error.
- `trace.zip` — every action with before/after DOM and screenshots. Open with `npx -y playwright@1.45.2 show-trace <path>`.
- `NN-<name>.png` from `ff.shot`, plus `final.png` or `failure.png`.
- `console.json` — console errors/warnings and uncaught page errors. The summary excludes React dev-mode `Warning:` messages and Radix a11y nags; they are baseline noise on every page.
- `network.json` — failed requests (navigation `ERR_ABORTED` dropped) and every `/api/*` response ≥ 400.
- `downloads/`, `result.json` (with `charts: { created, deleted }`).

Proof standards:

- Drive the user path: keyboard, clicks, clipboard, file inputs. `window.__set_text`, `window.__load_template__`, and `window.__get_screenshot_link__` are test setters that skip the UI; they never count as proof of a UI feature. Reading `window.__cy` is observation and fine.
- Assert the action **and** the resulting state: the graph (`ff.graph`), not only a screenshot.
- Check side effects alongside the screen: `flowcharts.fun.sandbox` for sandbox edits, the `user_charts` row via `ff.supabase` for hosted edits, the downloaded file's bytes for exports.
- Look at the screenshots you claim as proof (Read the PNG). A green run with a blank canvas is not a proof.
- Rendering changes (`toTheme`, `getSize`, `preprocessStyle`, `graphUtilityClasses`, templates, FFTheme) also need the pixel goldens: `E2E_START_URL=http://localhost:3001 pnpm -F app visual`. That suite needs only the server this skill launches.

External systems — stay inside these lines:

- `app/.env` is the **dev** Supabase project and Stripe **test** keys; doctor fails if Stripe is not `sk_test_`. Never point a drive at production.
- Submitting the Feedback form (`/o`) sends a **real email** through SendGrid. Drive up to the Submit button unless mail is the feature under test.
- AI features (`/api/prompt/*`) spend real OpenAI credit and are rate-limited (free tier: 2 requests per 30 days). Drive them only when they are the change.
- Stripe Checkout redirects to Stripe's test-mode page. Stop at the redirect unless checkout is the change.

## Cleanup

```bash
.claude/skills/verify/scripts/cleanup.sh 3001
```

Kills only the process group `launch.sh` recorded for that port, confirms the port is free, copies the server log into `.verify/evidence/server-<port>-<stamp>.log`, and removes `.verify/run/<port>/`. Evidence is never deleted. Run it after every session, including failed ones. Data a drive created lives outside the instance: drive.mjs deletes the hosted charts a run created when the run ends (see Drive). A run killed with SIGKILL cannot clean up; its charts are named `drive <run id> …`, so delete them by id once you have matched them to that run's evidence.

## Isolation

Instances on different ports are fully separate: own process group, own run dir, and localStorage is per-origin. Drives against one instance are separate browser contexts. The shared pieces are the dev Supabase project and the two test accounts. Hosted drives can run concurrently because each run deletes only the charts it created (`examples/hosted-cleanup-isolation.mjs` proves it). What is still shared: `/charts` lists every run's charts, so find yours by `ff.chartName` or by id, never by position; and account-level state (the pro subscription, the account email, folders) is one per account, so a drive that changes it runs alone. Never clean up by name pattern: another run's charts match it.

## When the framework changes

Launch is the only CRA-coupled part (`bundle.js` readiness, `react-scripts` dev command, `vercel dev`). Drive helpers, handles, and examples target what a user sees plus `window.__cy` and localStorage, so they are the before/after check for a migration: run every example on the old stack, keep the evidence, run them on the new one. Update `launch.sh`'s ready check when the dev server changes.
