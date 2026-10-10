const KEY = "flowcharts.fun.sandbox";
const DOC = ["Start", "  Left", "  Right", "    End", "Box {", "  Inner", "}"].join("\n");
const LAYOUT = {
  Start: { x: 0, y: 0 },
  Left: { x: 250, y: -100 },
  Right: { x: 250, y: 100 },
  End: { x: 500, y: 100 },
  Inner: { x: 0, y: 300 },
};
const CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS = 250;
const INSIDE_CONTAINER_PADDING_PX = 4;

const docWithMeta = (meta) => `${DOC}\n\n=====\n${JSON.stringify(meta)}\n=====`;

const storedMeta = async (ff) => {
  const s = await ff.storage(KEY);
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]) : null;
};

const positions = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy
        .nodes()
        .filter((n) => !n.isParent())
        .map((n) => [n.data("label"), { x: n.position().x, y: n.position().y }])
    )
  );

const storedByLabel = async (ff) => {
  const map = (await storedMeta(ff))?.nodePositions;
  if (!map) return null;
  return Object.fromEntries(Object.values(map).map((p) => [p.label, { x: p.x, y: p.y }]));
};

let theme = {};

async function seed(page, ff, layout) {
  const meta = { ...theme, expires: new Date(Date.now() + 36e5).toISOString() };
  if (layout) {
    const ids = await page.evaluate(() =>
      Object.fromEntries(window.__cy.nodes().map((n) => [n.data("label"), n.id()]))
    );
    meta.nodePositions = Object.fromEntries(
      Object.entries(layout).map(([label, p]) => [ids[label], { ...p, label }])
    );
  }
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, docWithMeta(meta)]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length === 6);
  await page.waitForTimeout(800);
}

async function onCanvas(page, ff, rendered) {
  const box = await ff.canvas().boundingBox();
  const pt = { x: box.x + rendered.x, y: box.y + rendered.y };
  const hit = await page.evaluate(
    ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-flowchart-fun-canvas="true"]'),
    pt
  );
  if (!hit) throw new Error(`point ${JSON.stringify(pt)} is covered or off the canvas`);
  return pt;
}

const nodePoint = async (page, ff, label) =>
  onCanvas(
    page,
    ff,
    await page.evaluate(
      (l) => window.__cy.nodes().filter((n) => n.data("label") === l)[0].renderedPosition(),
      label
    )
  );

const containerGrabPoint = async (page, ff, label) =>
  onCanvas(
    page,
    ff,
    await page.evaluate(
      ([l, inset]) => {
        const c = window.__cy.nodes().filter((n) => n.data("label") === l)[0];
        const bb = c.renderedBoundingBox({ includeLabels: false });
        return { x: bb.x1 + inset, y: (bb.y1 + bb.y2) / 2 };
      },
      [label, INSIDE_CONTAINER_PADDING_PX]
    )
  );

async function backgroundClick(page, ff) {
  const box = await ff.canvas().boundingBox();
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.click(box.x + box.width - 5, box.y + box.height - 5);
}

async function dragByModelOffset(page, from, dx, dy) {
  const zoom = await page.evaluate(() => window.__cy.zoom());
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(from.x + (dx * zoom * i) / 8, from.y + (dy * zoom * i) / 8);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
}

const settle = async (page, ff) => {
  await page.waitForTimeout(600);
  await ff.waitForGraph();
};

const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;

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

  step("open the sandbox and seed a frozen chart");
  await ff.open("/");
  await ff.typeDoc("Start");
  await expect.poll(async () => (await storedMeta(ff))?.themeEditor?.curveStyle).toBe("round-taxi");
  const { themeEditor, cytoscapeStyle } = await storedMeta(ff);
  theme = { themeEditor, cytoscapeStyle };
  await seed(page, ff, null);
  await seed(page, ff, LAYOUT);
  const zoom = await page.evaluate(() => window.__cy.zoom());
  ff.note({ zoom, seeded: await positions(page) });
  expect(await positions(page)).toMatchObject(LAYOUT);

  await check("row: End dropped 6px below Right's row lands on it (dy == 0), saved and reloaded", async () => {
    await seed(page, ff, LAYOUT);
    await backgroundClick(page, ff);
    await dragByModelOffset(page, await nodePoint(page, ff, "End"), 40, 6);
    await settle(page, ff);
    await ff.shot("row-drop", ff.canvas());
    const after = await positions(page);
    ff.note({ row: { End: after.End, Right: after.Right } });
    expect(after.End.y - after.Right.y, "drawn dy").toBe(0);
    expect(near(after.End.x, LAYOUT.End.x + 40), `End.x ${after.End.x} keeps the drop`).toBe(true);
    await expect.poll(async () => (await storedByLabel(ff))?.End?.y, { message: "stored End.y" }).toBe(LAYOUT.Right.y);
    const stored = (await storedMeta(ff)).nodePositions;
    expect(Object.values(stored).every((p) => typeof p.label === "string"), "every stored entry keeps its label").toBe(true);
    await page.reload();
    await ff.waitForEditor();
    await ff.waitForGraph((g) => g.nodes.length === 6);
    await page.waitForTimeout(800);
    const reloaded = await positions(page);
    expect(reloaded.End.y - reloaded.Right.y, "dy after reload").toBe(0);
    expect(reloaded.End.x, "x after reload").toBe(after.End.x);
  });

  await check("column: End dropped 5px right of Right's column lands on it (dx == 0)", async () => {
    await seed(page, ff, LAYOUT);
    await backgroundClick(page, ff);
    await dragByModelOffset(page, await nodePoint(page, ff, "End"), -245, 120);
    await settle(page, ff);
    const after = await positions(page);
    ff.note({ column: { End: after.End, Right: after.Right } });
    expect(after.End.x - after.Right.x, "drawn dx").toBe(0);
    expect(near(after.End.y, LAYOUT.End.y + 120), `End.y ${after.End.y} keeps the drop`).toBe(true);
    await expect.poll(async () => (await storedByLabel(ff))?.End?.x, { message: "stored End.x" }).toBe(LAYOUT.Right.x);
  });

  await check("far: End dropped 30px off Right's row stays where it was dropped", async () => {
    await seed(page, ff, LAYOUT);
    await backgroundClick(page, ff);
    await dragByModelOffset(page, await nodePoint(page, ff, "End"), 40, 30);
    await settle(page, ff);
    const after = await positions(page);
    ff.note({ far: { End: after.End } });
    expect(near(after.End.y, LAYOUT.End.y + 30), `End.y ${after.End.y}`).toBe(true);
    expect(near(after.End.x, LAYOUT.End.x + 40), `End.x ${after.End.x}`).toBe(true);
  });

  await check("undo: Cmd+Z after a 6px drop restores the pre-drag picture in one step; Cmd+Shift+Z redoes it", async () => {
    await seed(page, ff, LAYOUT);
    const metaBefore = await storedMeta(ff);
    await backgroundClick(page, ff);
    await dragByModelOffset(page, await nodePoint(page, ff, "End"), 40, 6);
    await settle(page, ff);
    const dropped = await positions(page);
    await page.keyboard.press("Meta+z");
    await expect.poll(() => positions(page), { message: "one undo restores every node" }).toEqual(LAYOUT);
    await expect.poll(async () => (await storedMeta(ff))?.nodePositions, { message: "stored map restored" }).toEqual(metaBefore.nodePositions);
    await page.keyboard.press("Meta+Shift+z");
    await expect.poll(() => positions(page), { message: "redo puts the snapped drop back" }).toEqual(dropped);
  });

  await check("undo from unfrozen: Cmd+Z after the first drag unfreezes and returns to the layout", async () => {
    await seed(page, ff, null);
    const layout = await positions(page);
    await backgroundClick(page, ff);
    await dragByModelOffset(page, await nodePoint(page, ff, "End"), 40, 30);
    await settle(page, ff);
    await expect.poll(async () => !!(await storedMeta(ff))?.nodePositions, { message: "drag freezes" }).toBe(true);
    await page.keyboard.press("Meta+z");
    await expect.poll(async () => (await storedMeta(ff))?.nodePositions, { message: "undo unfreezes" }).toBe(undefined);
    await expect(page.getByRole("button", { name: "Layout Frozen" })).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => positions(page), { message: "layout positions back" }).toEqual(layout);
  });

  await check("group: Left and Right selected, grabbing Right 5px below Start's row snaps both by Right's delta", async () => {
    await seed(page, ff, LAYOUT);
    await backgroundClick(page, ff);
    await page.keyboard.down("Shift");
    for (const label of ["Left", "Right"]) {
      await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
      const p = await nodePoint(page, ff, label);
      await page.mouse.click(p.x, p.y);
    }
    await page.keyboard.up("Shift");
    const selected = await page.evaluate(() => window.__cy.$("node:selected").map((n) => n.data("label")).sort());
    expect(selected).toEqual(["Left", "Right"]);
    await dragByModelOffset(page, await nodePoint(page, ff, "Right"), 60, -95);
    await settle(page, ff);
    const after = await positions(page);
    ff.note({ group: { Left: after.Left, Right: after.Right, Start: after.Start } });
    expect(after.Right.y - after.Start.y, "grabbed node on Start's row").toBe(0);
    expect(near(after.Left.y - after.Right.y, LAYOUT.Left.y - LAYOUT.Right.y, 1e-6), "group keeps its shape").toBe(true);
    expect(near(after.Left.x - after.Right.x, 0, 1e-6), "group keeps its shape on x").toBe(true);
    expect(after.End, "End did not move").toEqual(LAYOUT.End);
  });

  await check("container: dragging Box moves Inner by exactly the drop, never snapped", async () => {
    await seed(page, ff, LAYOUT);
    await backgroundClick(page, ff);
    await dragByModelOffset(page, await containerGrabPoint(page, ff, "Box"), 4, -197);
    await settle(page, ff);
    const after = await positions(page);
    ff.note({ container: { Inner: after.Inner } });
    expect(near(after.Inner.x, LAYOUT.Inner.x + 4), `Inner.x ${after.Inner.x}`).toBe(true);
    expect(near(after.Inner.y, LAYOUT.Inner.y - 197), `Inner.y ${after.Inner.y}`).toBe(true);
    expect(after.Inner.x, "not snapped to Start's column").not.toBe(LAYOUT.Start.x);
  });

  await check("text edit: a node already 5px off a row does not snap when the text changes", async () => {
    const offRow = { ...LAYOUT, End: { x: 500, y: 105 } };
    await seed(page, ff, offRow);
    await page.locator(".monaco-editor .view-line", { hasText: "Start" }).first().click();
    await page.keyboard.press("End");
    await page.keyboard.type("s");
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Starts"));
    await settle(page, ff);
    const after = await positions(page);
    expect(after.End).toEqual(offRow.End);
  });

  if (failures.length) throw new Error(`${failures.length} check(s) failed: ${failures.join("; ")}`);
};
