const NAME_OUTSIDE_VERIFY_SWEEP = `undo-scope ${Date.now()}`;
const SOURCE = "Alpha\n  Beta\n  Gamma";
const TARGET_TEXT = "Plan\n  Build\n    Review";
const TARGET_LAYOUT = {
  Plan: { x: 0, y: 0 },
  Build: { x: 220, y: 140 },
  Review: { x: 440, y: 280 },
};
const TARGET_MAP = Object.fromEntries(
  Object.entries(TARGET_LAYOUT).map(([label, p], i) => [`n${i + 1}`, { ...p, label }])
);
const TARGET_DOC = `${TARGET_TEXT}\n=====\n${JSON.stringify({ nodePositions: TARGET_MAP })}\n=====`;
const CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS = 250;

const storedMap = (chart) => JSON.parse(chart.split("=====")[1] ?? "{}").nodePositions;

const positions = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy.nodes().map((n) => [n.data("label"), { x: n.position().x, y: n.position().y }])
    )
  );

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
  if (!hit) throw new Error(`node ${label} is covered or off the canvas at ${JSON.stringify(pt)}`);
  return pt;
}

async function clickBackground(page, ff) {
  const box = await ff.canvas().boundingBox();
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.click(box.x + box.width - 5, box.y + box.height - 5);
}

async function drag(page, ff, label, dx, dy) {
  await clickBackground(page, ff);
  const from = await nodePoint(page, ff, label);
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(from.x + (dx * i) / 8, from.y + (dy * i) / 8);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await page.waitForTimeout(600);
}

async function alignHorizontally(page, ff, a, b) {
  await clickBackground(page, ff);
  await page.keyboard.down("Shift");
  for (const label of [a, b]) {
    await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
    const p = await nodePoint(page, ff, label);
    await page.mouse.click(p.x, p.y);
  }
  await page.keyboard.up("Shift");
  await page.getByRole("button", { name: "Align Horizontally" }).click();
  await page.waitForTimeout(600);
}

export default async ({ page, ff, step, expect }) => {
  const failures = [];
  const check = async (name, fn) => {
    step(name);
    try {
      await fn();
    } catch (e) {
      failures.push(name);
      ff.note({ failed: name, error: String(e.message).split("\n").slice(0, 4).join(" | ") });
    }
  };

  await ff.login("pro");
  const patches = [];
  page.on("request", (r) => {
    if (r.url().includes("/rest/v1/user_charts") && r.method() === "PATCH") patches.push(r.url());
  });
  const patchesTo = (id) => patches.filter((u) => u.includes(`id=eq.${id}`)).length;
  const row = async (id) =>
    (await ff.supabase(`user_charts?id=eq.${id}&select=chart,updated_at`)).body[0];

  const userId = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
    return JSON.parse(localStorage.getItem(k)).user.id;
  });
  const created = [];
  const createChart = async (suffix, chart) => {
    const name = `${NAME_OUTSIDE_VERIFY_SWEEP} ${suffix}`;
    const res = await ff.supabase("user_charts", {
      method: "POST",
      body: JSON.stringify({ name, chart, user_id: userId }),
    });
    if (res.status !== 201) throw new Error(`create ${name}: ${res.status} ${JSON.stringify(res.body)}`);
    created.push(res.body[0].id);
    return { id: res.body[0].id, name };
  };

  const openFromChartsPage = async (target) => {
    await page.getByRole("link", { name: "Charts", exact: true }).first().click();
    await page.waitForURL(/\/charts$/);
    await page.getByRole("link", { name: target.name }).click();
    await page.waitForURL(new RegExp(`/u/${target.id}$`));
    await ff.waitForEditor();
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Review"));
    await page.waitForTimeout(1500);
  };

  const undoOutsideEditorLeavesTargetAlone = async (target) => {
    expect(await positions(page), "target opens as stored").toEqual(TARGET_LAYOUT);
    const frozen = page.getByRole("button", { name: "Layout Frozen" });
    await expect(frozen).toHaveAttribute("aria-pressed", "true");
    const before = await row(target.id);
    const n = patchesTo(target.id);
    await clickBackground(page, ff);
    expect(
      await page.evaluate(() => !!document.activeElement?.closest(".monaco-editor")),
      "focus is outside the editor"
    ).toBe(false);
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(3000);
    await ff.shot(`after-undo-${target.name.split(" ").pop()}`, ff.canvas());
    const after = await positions(page);
    const afterRow = await row(target.id);
    ff.note({ target: target.name, after, patches: patchesTo(target.id) - n });
    expect(after, "target positions after Cmd+Z").toEqual(TARGET_LAYOUT);
    await expect(frozen, "target still frozen").toHaveAttribute("aria-pressed", "true");
    expect(patchesTo(target.id) - n, "PATCHes to the target").toBe(0);
    expect(afterRow.chart, "stored target row").toBe(before.chart);
    expect(afterRow.updated_at).toBe(before.updated_at);
  };

  try {
    step("create a source chart and four frozen target charts");
    const source = await createChart("source", SOURCE);
    const targets = {};
    for (const t of ["drag", "align", "sandbox", "own"]) targets[t] = await createChart(t, TARGET_DOC);
    ff.note({ source, targets });

    const openSource = async () => {
      await page.goto(`/u/${source.id}`);
      await ff.waitForEditor();
      await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Gamma"));
      await page.waitForTimeout(800);
    };

    await check("drag in hosted A, open hosted B from Charts, Cmd+Z: B is untouched", async () => {
      await openSource();
      const n = patchesTo(source.id);
      await drag(page, ff, "Beta", 60, 40);
      await expect.poll(() => patchesTo(source.id), { message: "the drag saved A", timeout: 15000 }).toBeGreaterThan(n);
      await openFromChartsPage(targets.drag);
      await undoOutsideEditorLeavesTargetAlone(targets.drag);
    });

    await check("align in hosted A, open hosted B from Charts, Cmd+Z: B is untouched", async () => {
      await openSource();
      const n = patchesTo(source.id);
      await alignHorizontally(page, ff, "Alpha", "Gamma");
      await expect.poll(() => patchesTo(source.id), { message: "the align saved A", timeout: 15000 }).toBeGreaterThan(n);
      await openFromChartsPage(targets.align);
      await undoOutsideEditorLeavesTargetAlone(targets.align);
    });

    await check("drag in the sandbox, open hosted B from Charts, Cmd+Z: B is untouched", async () => {
      await ff.open("/");
      await ff.waitForGraph((g) => g.nodes.length > 1);
      await page.waitForTimeout(800);
      const label = (await ff.graph()).nodes[0].label;
      await drag(page, ff, label, 60, 40);
      await expect
        .poll(async () => (await ff.storage("flowcharts.fun.sandbox"))?.includes("nodePositions"), { message: "the drag froze the sandbox" })
        .toBe(true);
      await openFromChartsPage(targets.sandbox);
      await undoOutsideEditorLeavesTargetAlone(targets.sandbox);
    });

    await check("after switching, B's own drag undoes in one step and a second Cmd+Z changes nothing", async () => {
      await openSource();
      await drag(page, ff, "Beta", -60, 40);
      await openFromChartsPage(targets.own);
      expect(await positions(page)).toEqual(TARGET_LAYOUT);
      await drag(page, ff, "Build", 0, 90);
      const dragged = await positions(page);
      expect(dragged.Build, "Build moved").not.toEqual(TARGET_LAYOUT.Build);
      await clickBackground(page, ff);
      await page.keyboard.press("Meta+z");
      await expect.poll(() => positions(page), { message: "first Cmd+Z undoes B's drag" }).toEqual(TARGET_LAYOUT);
      await expect
        .poll(async () => storedMap((await row(targets.own.id)).chart), { message: "stored map back", timeout: 10000 })
        .toEqual(TARGET_MAP);
      await undoOutsideEditorLeavesTargetAlone(targets.own);
    });
  } finally {
    step("cleanup: delete the charts this drive created, by id");
    if (created.length) {
      const del = await ff.supabase(`user_charts?id=in.(${created.join(",")})&select=id`, { method: "DELETE" });
      ff.note({ deleted: del.body?.map((c) => c.id) ?? del });
      expect(del.body?.length).toBe(created.length);
    }
  }

  if (failures.length) throw new Error(`${failures.length} check(s) failed: ${failures.join("; ")}`);
};
