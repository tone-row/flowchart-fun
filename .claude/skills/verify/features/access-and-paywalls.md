# Access and paywalls

Logged-out visitors can use the sandbox, theme editor and free exports, but are asked to log in for saving, new charts and the charts list, and are sent to pricing for pro features. Logged-in free users hit the "Create Unlimited Flowcharts" upgrade dialog instead. Pro access is a Stripe subscription (`active`/`trialing`) or an active 30-day pass.

## Sub-features

- `gate-logged-out-routes` — `/new` and `/charts` show "You need to log in to access this page." Driven by `examples/paywalls.mjs`.
- `gate-save-login` — logged-out **Log in to Save** routes to `/l` (Sign In). Driven by `examples/paywalls.mjs`.
- `gate-load-file` — logged-out **Load File** opens a paywall whose Learn More goes to `/pricing`. Driven by `examples/paywalls.mjs`.
- `gate-free-save-create` — a free account's **Save** and `/new` **Create** open "Create Unlimited Flowcharts" and create nothing. Driven by `examples/paywalls.mjs`.
- `gate-pro-unlocked` — the pro account sees no Upgrade link (`pro-link`) and can create charts. Driven indirectly by `examples/hosted-chart.mjs`.
- `pricing-checkout` — `/pricing` plan buttons start Stripe Checkout (test mode). _Not yet driven._ Stop at the redirect to `checkout.stripe.com`.
- `pass-access` — a 30-day pass grants pro without a subscription. _Not yet driven_ (`app/e2e/pass.spec.ts` covers parts).

## How to get to it (user POV)

- Top nav **New**, **Charts**, **Log In** / **Account**; sandbox header **Log in to Save** / **Save**; **Load File** button (`data-testid="load-file-button"`).
- Any **Upgrade** / **Learn More** button → `/pricing`.

## Driving it with drive.mjs

Preconditions:

- Full mode: the gates depend on `/api/customer-info`.
- `app/.env.e2e` for the free-account half.

- **Logged-out routes.** `page.goto("/new")`, then `/charts`; each shows `getByText("You need to log in to access this page.")`.
- **Save → login.** `ff.open("/")`, `page.getByRole("button", { name: "Log in to Save" }).click()`; heading `Sign In` visible and path is `/l`.
- **Load File paywall.** `ff.open("/")`, `page.getByTestId("load-file-button").click()`, `page.getByRole("button", { name: "Learn More" }).click()`; URL ends `/pricing` and heading "Turn your ideas into professional diagrams in seconds" is visible.
- **Free account.** `ff.login("basic")`, `ff.open("/")`, `page.getByRole("button", { name: "Save" }).click()` → heading "Create Unlimited Flowcharts"; `page.getByTestId("close-dialog").click()`; **New** → **Create** → same heading; path stays `/new`.

## Gotchas

- `/pricing` renders `Pricing2`; the `pricing-page-title` test id belongs to the old `Pricing.tsx` and is not on the page.
- Pro status comes from `/api/customer-info`; judge gates only in full mode.
- The pricing page aborts video and logo requests on navigation; `drive.mjs` drops those `ERR_ABORTED` entries, so a non-empty `network.json` here is real.
