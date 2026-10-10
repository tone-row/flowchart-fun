import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRequire = createRequire(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../app/package.json")
);
const { compressToEncodedURIComponent } = appRequire("lz-string");

const KEY = "flowcharts.fun.sandbox";
const CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS = 250;
const DOC = ["Start", "  Left", "  Right", "    End", "Lone"].join("\n");
const LAYOUT = {
  Start: { x: 0, y: 0 },
  Left: { x: 250, y: -100 },
  Right: { x: 250, y: 100 },
  End: { x: 500, y: 140 },
  Lone: { x: 0, y: 250 },
};
const AI_TEXT = ["Plan", "  Build", "    Ship"].join("\n");
const AI_TEMPLATE = "org-chart";
const IMPORTED = ["North", "  South", "  East", "    West"].join("\n");
const ONLY = process.env.UNDO_ONLY;

const storedMeta = async (ff) => {
  const s = await ff.storage(KEY);
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]) : null;
};
const storedMap = async (ff) => (await storedMeta(ff))?.nodePositions;
const storedText = async (ff) => (await ff.storage(KEY))?.split("=====")[0].trim();

const positions = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy
        .nodes()
        .filter((n) => !n.isParent())
        .map((n) => [n.data("label"), { x: n.position().x, y: n.position().y }])
    )
  );

let theme = {};

async function seed(page, ff) {
  const meta = { ...theme, expires: new Date(Date.now() + 36e5).toISOString() };
  const docWith = (m) => `${DOC}\n\n=====\n${JSON.stringify(m)}\n=====`;
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, docWith(meta)]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length === 5);
  const ids = await page.evaluate(() =>
    Object.fromEntries(window.__cy.nodes().map((n) => [n.data("label"), n.id()]))
  );
  meta.nodePositions = Object.fromEntries(
    Object.entries(LAYOUT).map(([label, p]) => [ids[label], { ...p, label }])
  );
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, docWith(meta)]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length === 5);
  await page.waitForTimeout(800);
  return meta;
}

async function nodePoint(page, ff, label) {
  const box = await ff.canvas().boundingBox();
  const p = await page.evaluate(
    (l) => window.__cy.nodes().filter((n) => n.data("label") === l)[0]?.renderedPosition(),
    label
  );
  if (!p) throw new Error(`no node ${label}`);
  const pt = { x: box.x + p.x, y: box.y + p.y };
  const hit = await page.evaluate(
    ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-flowchart-fun-canvas="true"]'),
    pt
  );
  if (!hit) throw new Error(`node ${label} covered/off canvas`);
  return pt;
}

async function backgroundClick(page, ff) {
  const box = await ff.canvas().boundingBox();
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.click(box.x + box.width - 5, box.y + box.height - 5);
}

async function drag(page, ff, label, dxModel, dyModel) {
  await backgroundClick(page, ff);
  const zoom = await page.evaluate(() => window.__cy.zoom());
  const from = await nodePoint(page, ff, label);
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(from.x + (dxModel * zoom * i) / 8, from.y + (dyModel * zoom * i) / 8);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await page.waitForTimeout(700);
}

async function alignHorizontally(page, ff, a, b) {
  await backgroundClick(page, ff);
  await page.keyboard.down("Shift");
  for (const label of [a, b]) {
    await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
    const p = await nodePoint(page, ff, label);
    await page.mouse.click(p.x, p.y);
  }
  await page.keyboard.up("Shift");
  await page.getByRole("button", { name: "Align Horizontally" }).click();
  await page.waitForTimeout(700);
}

async function graphKey(page, ff, key) {
  await backgroundClick(page, ff);
  await page.keyboard.press(key);
  await page.waitForTimeout(1200);
}

async function loadTemplate(page, ff, withContent) {
  await page.getByTestId("Editor Tab: Document").click();
  await page.getByRole("button", { name: "Examples" }).click();
  await page.getByRole("button", { name: "org-chart" }).click();
  const content = page.getByLabel("Load default content");
  if ((await content.isChecked()) !== withContent) await content.click();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  if (withContent) await page.getByRole("button", { name: "Yes, Replace Content" }).click();
  await page.waitForTimeout(1500);
}

async function runStubbedAi(page, ff) {
  await page.getByRole("button", { name: "Prompt", exact: true }).click();
  await page
    .locator("div", { has: page.getByRole("button", { name: "Submit" }) })
    .locator("textarea:not(.monaco-editor textarea)")
    .last()
    .fill("a three step plan");
  await page.getByRole("button", { name: "Submit" }).click();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Ship"));
  await page.waitForTimeout(800);
}

const aiUndoButton = (page) => page.getByRole("button", { name: "Undo", exact: true });

export default async ({ page, ff, step, expect }) => {
  const failures = [];
  const check = async (name, fn) => {
    if (ONLY && !name.includes(ONLY)) return;
    step(name);
    try {
      await fn();
    } catch (e) {
      failures.push(name);
      ff.note({ failed: name, error: String(e.message).split("\n").slice(0, 14).join(" | ") });
      await ff.shot(`failed-${failures.length}`, page.locator("body")).catch(() => {});
    }
  };

  const promptCalls = [];
  await page.route("**/api/prompt/**", async (route) => {
    const url = route.request().url();
    promptCalls.push(url.replace(/^.*\/api\/prompt\//, ""));
    if (url.endsWith("/choose-template")) {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ template: AI_TEMPLATE }) });
    } else if (url.endsWith("/prompt")) {
      await route.fulfill({ contentType: "text/plain", body: AI_TEXT });
    } else {
      await route.fulfill({ status: 500, body: "unexpected AI endpoint in drive" });
    }
  });

  step("open the sandbox and capture the default theme");
  await ff.open("/");
  await ff.typeDoc("Start");
  await expect.poll(async () => (await storedMeta(ff))?.themeEditor?.curveStyle).toBe("round-taxi");
  const { themeEditor, cytoscapeStyle } = await storedMeta(ff);
  theme = { themeEditor, cytoscapeStyle };

  for (const [what, act] of [
    ["drag", (page, ff) => drag(page, ff, "End", 40, 30)],
    ["align", (page, ff) => alignHorizontally(page, ff, "Start", "Right")],
  ]) {
    await check(`no AI run: ${what}, Cmd+Z, Cmd+Shift+Z never shows the AI Undo button`, async () => {
      await seed(page, ff);
      await act(page, ff);
      const done = await positions(page);
      await graphKey(page, ff, "Meta+z");
      expect(await positions(page), "Cmd+Z undid it").toEqual(LAYOUT);
      await graphKey(page, ff, "Meta+Shift+z");
      expect(await positions(page), "Cmd+Shift+Z redid it").toEqual(done);
      const shown = await aiUndoButton(page).count();
      ff.note({ what, aiUndoShownAfterRedo: shown });
      expect(shown, "AI Undo button after a redo of a non-AI action").toBe(0);
    });
  }

  for (const withContent of [true, false]) {
    await check(`drag, load org-chart ${withContent ? "with" : "without"} content: Cmd+Z and Cmd+Shift+Z leave the template alone`, async () => {
      await seed(page, ff);
      await drag(page, ff, "End", 40, 30);
      await loadTemplate(page, ff, withContent);
      await expect.poll(async () => (await storedMeta(ff))?.themeEditor?.layoutName).toBe("dagre");
      await ff.waitForGraph();
      const loaded = await positions(page);
      expect(await storedMap(ff), "template load unfreezes").toBeUndefined();
      await graphKey(page, ff, "Meta+z");
      await ff.waitForGraph();
      const undone = await positions(page);
      const undoneMap = await storedMap(ff);
      await graphKey(page, ff, "Meta+Shift+z");
      await ff.waitForGraph();
      const redone = await positions(page);
      ff.note({ withContent, loadedLabels: Object.keys(loaded).length, undoneFrozenLabels: undoneMap && Object.values(undoneMap).map((p) => p.label) });
      await ff.shot(`template-${withContent ? "content" : "styles"}-after-undo-redo`, ff.canvas());
      expect(undoneMap, "Cmd+Z does not freeze the template to the old chart's map").toBeUndefined();
      expect(undone, "Cmd+Z leaves the template picture").toEqual(loaded);
      expect(redone, "Cmd+Shift+Z leaves the template picture").toEqual(loaded);
    });
  }

  await check("drag, import a chart from a #load: link: Cmd+Z leaves the imported chart alone", async () => {
    await seed(page, ff);
    await drag(page, ff, "End", 40, 30);
    const doc = `${IMPORTED}\n=====\n${JSON.stringify(theme)}\n=====`;
    await page.evaluate((h) => (window.location.hash = h), `#load:${compressToEncodedURIComponent(doc)}`);
    await page.getByRole("button", { name: "Load", exact: true }).click();
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "West"));
    const imported = await positions(page);
    await graphKey(page, ff, "Meta+z");
    await ff.waitForGraph();
    const undoneMap = await storedMap(ff);
    ff.note({ hashImportUndoneFrozen: undoneMap && Object.values(undoneMap).map((p) => p.label) });
    expect(undoneMap, "Cmd+Z does not freeze the import to the old chart's map").toBeUndefined();
    expect(await positions(page), "Cmd+Z leaves the imported picture").toEqual(imported);
  });

  await check("drag, load a .txt file into the sandbox: Cmd+Z leaves the loaded chart alone", async () => {
    await seed(page, ff);
    await drag(page, ff, "End", 40, 30);
    await page.getByTestId("Editor Tab: Document").click();
    await page.getByTestId("load-file-input").setInputFiles({
      name: "chart.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(`${IMPORTED}\n=====\n${JSON.stringify(theme)}\n=====`),
    });
    await page.getByTestId("load-file-confirm").click();
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "West"));
    const loaded = await positions(page);
    await graphKey(page, ff, "Meta+z");
    await ff.waitForGraph();
    const undoneMap = await storedMap(ff);
    ff.note({ fileLoadUndoneFrozen: undoneMap && Object.values(undoneMap).map((p) => p.label) });
    expect(undoneMap, "Cmd+Z does not freeze the file to the old chart's map").toBeUndefined();
    expect(await positions(page), "Cmd+Z leaves the loaded picture").toEqual(loaded);
  });

  await check("AI run: toolbar Undo restores the pre-AI text and meta and then hides", async () => {
    const before = await seed(page, ff);
    await runStubbedAi(page, ff);
    await expect(aiUndoButton(page), "AI Undo shows after an AI run").toBeVisible();
    expect((await ff.editorText()).trim()).toBe(AI_TEXT);
    await aiUndoButton(page).click();
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Lone"));
    await expect.poll(() => storedText(ff), { message: "text back" }).toBe(DOC);
    expect((await ff.editorText()).trim(), "editor back").toBe(DOC);
    const meta = await storedMeta(ff);
    expect(meta.themeEditor, "theme back").toEqual(before.themeEditor);
    expect(meta.nodePositions, "frozen map back").toEqual(before.nodePositions);
    await expect(aiUndoButton(page), "AI Undo hides once the AI edit is undone").toHaveCount(0);
  });

  await check("AI run, Cmd+Z from the graph restores the pre-AI text and meta; Cmd+Shift+Z re-applies it and shows AI Undo", async () => {
    const before = await seed(page, ff);
    await runStubbedAi(page, ff);
    await graphKey(page, ff, "Meta+z");
    await expect.poll(() => storedText(ff), { message: "text back" }).toBe(DOC);
    expect((await storedMeta(ff)).nodePositions, "frozen map back").toEqual(before.nodePositions);
    await expect(aiUndoButton(page)).toHaveCount(0);
    await graphKey(page, ff, "Meta+Shift+z");
    await expect.poll(() => storedText(ff), { message: "AI text re-applied" }).toBe(AI_TEXT);
    await expect(aiUndoButton(page), "AI Undo shows when the AI edit is newest again").toBeVisible();
  });

  await check("AI run, then drag: AI Undo hides while the drag is newest and returns once Cmd+Z undoes the drag", async () => {
    await seed(page, ff);
    await runStubbedAi(page, ff);
    await ff.waitForGraph();
    const aiLayout = await positions(page);
    await drag(page, ff, "Ship", 60, 40);
    await expect(aiUndoButton(page), "drag is newest").toHaveCount(0);
    await graphKey(page, ff, "Meta+z");
    expect(await positions(page), "drag undone").toEqual(aiLayout);
    await expect(aiUndoButton(page), "AI edit is newest again").toBeVisible();
  });

  await check("AI run, type in the editor, Cmd+Z in the editor undoes only the typing", async () => {
    await seed(page, ff);
    await runStubbedAi(page, ff);
    await page.locator(".monaco-editor .view-line", { hasText: "Ship" }).first().click();
    await page.keyboard.press("End");
    await page.keyboard.type("ped");
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Shipped"));
    await page.keyboard.press("Meta+z");
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Ship"));
    await page.waitForTimeout(800);
    expect((await ff.editorText()).trim(), "only the typing undone").toBe(AI_TEXT);
  });

  ff.note({ promptCalls });
  if (failures.length) throw new Error(`${failures.length} check(s) failed: ${failures.join("; ")}`);
};
