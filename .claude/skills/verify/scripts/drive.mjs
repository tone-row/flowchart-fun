#!/usr/bin/env node
// Drive a running flowchart-fun instance with a steps file and capture evidence.
//
//   node .claude/skills/verify/scripts/drive.mjs <steps.mjs> [--port 3001] [--label name] [--headed]
//
// A steps file default-exports an async function that receives
//   { page, context, ff, step, expect }
// and throws on failure. Evidence is written to .verify/evidence/<stamp>-<label>/:
//   steps.log       timestamped step names + anything ff.note() records
//   trace.zip       Playwright trace: every action with before/after DOM + screenshots
//                   (open with: npx -y playwright@1.45.2 show-trace <path>)
//   *.png           ff.shot() captures, plus final.png (or failure.png)
//   console.json    console errors/warnings and uncaught page errors
//   network.json    every failed request and every non-2xx/3xx /api/* response
//   downloads/      files saved by ff.download()
//   result.json     { ok, error, url, steps, evidence }
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, appendFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const appRequire = createRequire(path.join(ROOT, "app/package.json"));
const { chromium } = appRequire("playwright");
const { expect } = appRequire("@playwright/test");

const args = process.argv.slice(2);
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const stepsFile = args.find((a, i) => !a.startsWith("--") && !["--port", "--label"].includes(args[i - 1]));
if (!stepsFile) {
  console.error("usage: drive.mjs <steps.mjs> [--port 3001] [--label name] [--headed]");
  process.exit(2);
}
const PORT = argValue("--port") ?? "3001";
const BASE = `http://localhost:${PORT}`;
const label = (argValue("--label") ?? path.basename(stepsFile, ".mjs")).replace(/[^\w.-]+/g, "-");
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const OUT = path.join(ROOT, ".verify/evidence", `${stamp}-${label}`);
mkdirSync(path.join(OUT, "downloads"), { recursive: true });

const steps = [];
const consoleEntries = [];
const networkEntries = [];
const log = (line) => appendFileSync(path.join(OUT, "steps.log"), `${new Date().toISOString()}  ${line}\n`);

function readEnvFile(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => /^[A-Z0-9_]+=/.test(l))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

const browser = await chromium.launch({ headless: !args.includes("--headed") });
// A fresh context = empty localStorage and no cookies, so the sandbox starts from
// its default chart and nothing touches the user's real browser session.
const context = await browser.newContext({
  baseURL: BASE,
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
  permissions: ["clipboard-read", "clipboard-write"],
});
await context.tracing.start({ screenshots: true, snapshots: true, sources: false });
const page = await context.newPage();

const watch = (p) => {
  p.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning")
      consoleEntries.push({ type: m.type(), text: m.text(), url: p.url() });
  });
  p.on("pageerror", (e) => consoleEntries.push({ type: "pageerror", text: String(e), url: p.url() }));
  // ERR_ABORTED is a request cancelled by navigation or media preload — noise, not a failure.
  p.on("requestfailed", (r) => {
    const failure = r.failure()?.errorText;
    if (failure !== "net::ERR_ABORTED") networkEntries.push({ url: r.url(), method: r.method(), failure });
  });
  p.on("response", (r) => {
    if (r.url().includes("/api/") && r.status() >= 400)
      networkEntries.push({ url: r.url(), method: r.request().method(), status: r.status() });
  });
};
watch(page);
context.on("page", watch);

const step = (name) => {
  steps.push(name);
  log(`STEP ${name}`);
  console.log(`· ${name}`);
};

const ff = {
  base: BASE,
  out: OUT,
  note: (msg) => log(`NOTE ${typeof msg === "string" ? msg : JSON.stringify(msg)}`),

  /** Navigate to an app path ("/", "/u/12", "/pricing"). Pass {e2e:true} to add ?isE2E=true
   *  (shortens the sandbox upsell modal to 20s — only useful when testing that modal). */
  async open(p = "/", { e2e = false } = {}) {
    const url = e2e ? `${p}${p.includes("?") ? "&" : "?"}isE2E=true` : p;
    await page.goto(url);
    if (p === "/" || p.startsWith("/u/") || p.startsWith("/?")) await ff.waitForEditor();
  },

  async waitForEditor() {
    await page.locator(".monaco-editor .view-lines").first().waitFor({ state: "visible", timeout: 60000 });
  },

  /** Replace the document by typing it key by key. Each new line is typed after
   *  Shift+Home so Monaco's auto-indent is overwritten — the result matches `text` exactly. */
  async typeDoc(text) {
    await ff.clearDoc();
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) {
        await page.keyboard.press("Enter");
        await page.keyboard.press("Shift+Home");
      }
      await page.keyboard.type(lines[i]);
    }
  },

  /** Replace the document via a real clipboard paste (Cmd/Ctrl+V). Pastes of 3+ lines
   *  also raise the "Convert to Flowchart Fun syntax?" overlay — that is expected. */
  async pasteDoc(text) {
    await ff.clearDoc();
    await page.evaluate((t) => navigator.clipboard.writeText(t), text);
    await page.keyboard.press("ControlOrMeta+v");
  },

  async clearDoc() {
    await ff.waitForEditor();
    await page.locator(".monaco-editor .view-lines").first().click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Backspace");
  },

  /** Full text of the Monaco model (falls back to the visible lines if monaco is not global). */
  async editorText() {
    return page.evaluate(() => {
      const m = window.monaco?.editor?.getModels?.()[0];
      if (m) return m.getValue();
      return [...document.querySelectorAll(".monaco-editor .view-line")]
        .map((l) => l.textContent.replace(/ /g, " "))
        .join("\n");
    });
  },

  /** Snapshot of the rendered Cytoscape graph (observation only — never drive through it). */
  async graph() {
    return page.evaluate(() => {
      const cy = window.__cy;
      if (!cy || cy.destroyed()) return null;
      return {
        nodes: cy.nodes().map((n) => ({
          id: n.id(),
          label: n.data("label"),
          classes: n.classes(),
          parent: n.data("parent") ?? null,
          position: n.position(),
          width: n.width(),
          height: n.height(),
          visible: n.visible(),
        })),
        edges: cy.edges().map((e) => ({
          id: e.id(),
          source: e.source().data("label"),
          target: e.target().data("label"),
          label: e.data("label") ?? "",
          classes: e.classes(),
        })),
        bg: cy.container()?.style.backgroundColor ?? null,
        zoom: cy.zoom(),
      };
    });
  },

  /** Poll until the graph satisfies `pred` and node positions stop moving. */
  async waitForGraph(pred = (g) => g.nodes.length > 0, { timeout = 30000 } = {}) {
    const start = Date.now();
    let prev = "";
    let last = null;
    while (Date.now() - start < timeout) {
      last = await ff.graph();
      if (last && pred(last)) {
        const sig = JSON.stringify(last.nodes.map((n) => [n.label, Math.round(n.position.x), Math.round(n.position.y)]));
        if (sig === prev) return last;
        prev = sig;
      }
      await page.waitForTimeout(400);
    }
    throw new Error(`graph never matched predicate within ${timeout}ms; last graph: ${JSON.stringify(last)?.slice(0, 800)}`);
  },

  /** Screenshot into the evidence dir. Pass a locator to capture just that element. */
  async shot(name, locator) {
    const file = path.join(OUT, `${String(steps.length).padStart(2, "0")}-${name}.png`);
    await (locator ?? page).screenshot({ path: file });
    log(`SHOT ${path.basename(file)}`);
    return file;
  },

  /** The graph canvas element (sandbox, hosted editor, read-only and fullscreen views). */
  canvas: () => page.locator('[data-flowchart-fun-canvas="true"]'),

  /** Click something that triggers a download; saves it into evidence/downloads. */
  async download(trigger) {
    const [dl] = await Promise.all([page.waitForEvent("download"), trigger()]);
    const file = path.join(OUT, "downloads", dl.suggestedFilename());
    await dl.saveAs(file);
    log(`DOWNLOAD ${path.basename(file)}`);
    return file;
  },

  /** Parsed localStorage value (e.g. "flowcharts.fun.sandbox"). */
  async storage(key) {
    const raw = await page.evaluate((k) => localStorage.getItem(k), key);
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },

  /** Log in through the real Sign In form with an app/.env.e2e test account. kind: "basic" | "pro". */
  async login(kind = "basic") {
    const env = readEnvFile(path.join(ROOT, "app/.env.e2e"));
    const email = kind === "pro" ? env.TESTING_EMAIL_PRO : env.TESTING_EMAIL;
    const pass = kind === "pro" ? env.TESTING_PASS_PRO : env.TESTING_PASS;
    if (!email || !pass) throw new Error(`app/.env.e2e lacks credentials for "${kind}"`);
    await page.goto("/l");
    await page.getByTestId("sign-in-email").fill(email);
    await page.getByTestId("sign-in-password").fill(pass);
    await page.getByTestId("sign-in-email-pass").click();
    await expect(page.getByRole("link", { name: "Account" })).toBeVisible({ timeout: 30000 });
    if (kind === "pro") await page.getByTestId("pro-link").waitFor({ state: "detached", timeout: 30000 });
    log(`LOGIN ${kind}`);
  },

  /** Call the dev Supabase REST API as the logged-in user (their own JWT + anon key, so RLS
   *  applies exactly as in the app). For reading side effects and cleaning up — never as a
   *  substitute for driving the UI.  e.g. ff.supabase("user_charts?id=eq.12", { method: "DELETE" }) */
  async supabase(pathAndQuery, init = {}) {
    const env = readEnvFile(path.join(ROOT, "app/.env"));
    return page.evaluate(
      async ({ url, key, pathAndQuery, init }) => {
        const tokenKey = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
        const token = tokenKey && JSON.parse(localStorage.getItem(tokenKey)).access_token;
        if (!token) throw new Error("not logged in: no sb-*-auth-token in localStorage");
        const r = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
          ...init,
          headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation", ...init.headers },
        });
        const text = await r.text();
        return { status: r.status, body: text ? JSON.parse(text) : null };
      },
      { url: env.REACT_APP_SUPABASE_URL, key: env.REACT_APP_SUPABASE_ANON_KEY, pathAndQuery, init }
    );
  },
};

// A page frozen by a synchronous loop never answers a screenshot or a trace stop.
const TEARDOWN_MS = 5000;
const teardown = (promise) => {
  let timer;
  return Promise.race([promise, new Promise((r) => (timer = setTimeout(r, TEARDOWN_MS)))])
    .catch(() => {})
    .finally(() => clearTimeout(timer));
};

const result = { ok: false, label, url: null, steps, evidence: OUT };
try {
  const mod = await import(pathToFileURL(path.resolve(stepsFile)).href);
  await mod.default({ page, context, ff, step, expect });
  result.ok = true;
  await teardown(page.screenshot({ path: path.join(OUT, "final.png") }));
} catch (err) {
  result.error = String(err?.stack ?? err);
  log(`ERROR ${String(err?.message ?? err)}`);
  await teardown(page.screenshot({ path: path.join(OUT, "failure.png") }));
} finally {
  result.url = page.url();
  await teardown(context.tracing.stop({ path: path.join(OUT, "trace.zip") }));
  writeFileSync(path.join(OUT, "console.json"), JSON.stringify(consoleEntries, null, 2));
  writeFileSync(path.join(OUT, "network.json"), JSON.stringify(networkEntries, null, 2));
  writeFileSync(path.join(OUT, "result.json"), JSON.stringify(result, null, 2));
  await teardown(browser.close());
}

// React dev-mode "Warning: …" messages arrive as console.error but are not failures.
const pageErrors = consoleEntries.filter((e) => e.type === "pageerror").length;
const consoleErrors = consoleEntries.filter((e) => e.type === "error" && !/^Warning: |DialogTitle|aria-describedby/.test(e.text)).length;
console.log(
  `${result.ok ? "PASS" : "FAIL"} ${label} — ${steps.length} steps, ${pageErrors} uncaught page errors, ` +
    `${consoleErrors} console errors (React dev warnings excluded), ${networkEntries.length} network problems`
);
console.log(`evidence: ${path.relative(ROOT, OUT)}`);
if (!result.ok) {
  console.log(result.error);
  process.exit(1);
}
