# Hosted charts

Pro users (subscription or 30-day pass) keep unlimited charts in the cloud. A hosted chart lives at `/u/:id`, saves edits automatically about a second after typing, can be renamed from the header, listed in `/charts`, published to a public `/p/:public_id` link, and cloned. Without pro access a hosted chart opens read-only.

## Sub-features

- `hosted-create` — `/new` → name → Create lands on `/u/:id`. Driven by `examples/hosted-chart.mjs`.
- `hosted-autosave` — edits PATCH `user_charts` (1s debounce) and come back after a reload. Driven by `examples/hosted-chart.mjs`.
- `hosted-rename` — header rename updates the title and the stored `name`. Driven by `examples/hosted-chart.mjs`.
- `hosted-save-sandbox` — sandbox Save → Save to Cloud → name → lands on `/u/:id`. _Not yet driven_ (covered by `app/e2e/pro.spec.ts`).
- `hosted-list` — `/charts` lists charts and folders with rename/move/clone/delete. _Not yet driven_; see Gotchas for why it is broken for the test account.
- `hosted-publish` — Export → "Make publicly accessible" yields a `/p/…` link that renders read-only with a Clone button. _Not yet driven_ (covered by `app/e2e/pro.spec.ts`).
- `hosted-open-no-write` — opening a chart without editing sends no PATCH and leaves `updated_at` alone, including in-app reopens (Editor link) where autosave is already live while the chart loads; an edit afterwards still saves. Driven by `examples/hosted-open-no-write.mjs`.
- `hosted-read-only` — a lapsed or free user opening `/u/:id` sees `data-testid="read-only-notice"` and no saves are sent. _Not yet driven._

## How to get to it (user POV)

- **New** in the top nav (`data-testid="new-chart-link"`) → `/new`.
- **Save** on the sandbox → "Save to Cloud".
- **Charts** in the top nav → `/charts` → a row.
- A `/u/:id` URL directly.

## Driving it with drive.mjs

Preconditions:

- Full mode (`launch.sh 3001`): login and customer-info go through `/api`.
- `app/.env.e2e` present and the pro test subscription active (doctor checks the file; a lapsed sub shows up as `/new` never redirecting).
- No other hosted drive running against the same account (cleanup sweeps all `verify *` charts).

- **Log in.** `await ff.login("pro")`. The Account link is visible and the `pro-link` Upgrade link is gone.
- **Create.** `page.getByTestId("new-chart-link").click()`, `page.getByLabel("Name Chart").fill("verify <ts>")`, `page.getByRole("button", { name: "Create" }).click()`. URL matches `/u/\d+$`.
- **Autosave.** Arm `page.waitForResponse(r => r.url().includes("/rest/v1/user_charts") && r.request().method() === "PATCH" && r.ok())`, then `ff.typeDoc("Plan\n  Build\n    Review")`. The PATCH resolves; `ff.supabase("user_charts?id=eq.<id>&select=name,chart")` returns a `chart` starting with the doc.
- **Reload.** `page.reload()`; editor text (trimmed) equals the doc and the graph is `Plan, Build, Review`.
- **Rename.** `page.getByTestId("rename-button").click()`, `page.getByRole("textbox").fill("<name> renamed")`, `page.getByRole("button", { name: "Rename" }).click()`. The button text and the stored `name` both change.
- **Cleanup (always, in `finally`).** `ff.supabase("user_charts?name=like.verify%20*&select=id,name", { method: "DELETE" })` returns 200 and the deleted rows.

## Gotchas

- **The pro test account has 1000+ charts** (e2e runs never delete theirs), and the `/charts` list fetch caps at 1000 rows without the newest ones (observed 2026-10-08: 1000 rows, none created that day). A chart created now does **not** appear in `/charts` for that account. Assert creation through the URL and `ff.supabase`, not the list, until the account is purged or the query is fixed. (This is also a real bug for any user with over 1000 charts.)
- How you open a chart changes what happens: `page.goto("/u/:id")` is a full load (customer-info not yet cached, no autosave on load); clicking **Editor** reopens the last chart in-app (customer-info cached, autosave fires). The Editor link target lives in memory, so a `page.goto` resets it to `/`. In-app navigations need `waitForURL(..., { waitUntil: "commit" })`.
- Saves are debounced 1s and skipped entirely while `canEdit` is still loading; arm the PATCH wait before typing or you race it.
- The `/charts` row "…" menu button has no accessible name; locate it as the last `button` inside the row.
