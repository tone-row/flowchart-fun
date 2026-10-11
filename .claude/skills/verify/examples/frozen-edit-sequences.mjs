// Multi-step edits on a frozen chart where a node leaves the text for a moment and comes
// back: delete a line and undo, backspace a label to empty and retype, cut a line and paste
// it back. The node that came back lands where it was and nothing else moves.
const KEY = "flowcharts.fun.sandbox";
const TEXT = ["Start", "  Alpha", "  Beta", "    Gamma", "  Delta", "End"].join("\n");

const seed = async (page, ff, text) => {
  await ff.open("/");
  const meta = { expires: new Date(Date.now() + 36e5).toISOString() };
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, `${text}\n\n=====\n${JSON.stringify(meta)}\n=====`]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length > 0);
  await page.waitForTimeout(1500);
};

const byLabel = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy
        .nodes()
        .map((n) => [n.data("label"), { id: n.id(), x: +n.position().x.toFixed(1), y: +n.position().y.toFixed(1) }])
    )
  );

const moved = (a, b) =>
  Object.keys(a).filter((k) => b[k] && Math.hypot(a[k].x - b[k].x, a[k].y - b[k].y) > 0.5);

const storedMap = async (ff) => {
  const s = await ff.storage(KEY);
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]).nodePositions : undefined;
};

const mapByLabel = (m) => Object.fromEntries(Object.values(m).map((v) => [v.label, [+v.x.toFixed(1), +v.y.toFixed(1)]]));

const nodeScreenPos = async (page, ff, label) => {
  const box = await ff.canvas().boundingBox();
  const rp = await page.evaluate((label) => {
    const n = window.__cy.nodes().filter((n) => n.data("label") === label)[0];
    if (!n) return null;
    const p = n.renderedPosition();
    return { x: p.x, y: p.y };
  }, label);
  if (!rp) throw new Error(`no node labelled ${label}`);
  return { x: box.x + rp.x, y: box.y + rp.y };
};

const dragNode = async (page, ff, label, dx, dy) => {
  const from = await nodeScreenPos(page, ff, label);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(from.x + (dx * i) / 8, from.y + (dy * i) / 8);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);
};

const editorText = (page) => page.evaluate(() => window.monaco.editor.getModels()[0].getValue());

const gotoLine = async (page, substring) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Meta+ArrowUp");
  const lines = (await editorText(page)).split("\n");
  const idx = lines.findIndex((l) => l.includes(substring));
  if (idx < 0) throw new Error(`no line containing ${substring}`);
  for (let i = 0; i < idx; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
};

const deleteLine = async (page, substring) => {
  await gotoLine(page, substring);
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
};

const settle = async (page, ff) => {
  await page.waitForTimeout(700);
  await ff.waitForGraph();
  await page.waitForTimeout(1200);
};

const fitShot = async (page, ff, name) => {
  await page.evaluate(() => window.__cy.fit(undefined, 20));
  await page.waitForTimeout(300);
  await ff.shot(name, ff.canvas());
};

const freshFrozen = async (page, ff, expect, label, dx, dy) => {
  await seed(page, ff, TEXT);
  await dragNode(page, ff, label, dx, dy);
  await expect.poll(() => storedMap(ff)).toBeDefined();
  await settle(page, ff);
  return byLabel(page);
};

export default async ({ page, ff, step, expect }) => {
  step("X1 drag Gamma, delete its line, then Cmd+Z until the text is back: Gamma returns to where it was dragged");
  let p0 = await freshFrozen(page, ff, expect, "Gamma", 260, 90);
  const map0 = await storedMap(ff);
  const t0 = await editorText(page);
  await deleteLine(page, "Gamma");
  await ff.waitForGraph((g) => !g.nodes.some((n) => n.label === "Gamma"));
  await settle(page, ff);
  ff.note({ mapAfterDelete: mapByLabel(await storedMap(ff)) });
  for (let i = 0; i < 6 && (await editorText(page)) !== t0; i++) {
    await page.keyboard.press("Meta+z");
    await page.waitForTimeout(250);
  }
  expect(await editorText(page)).toBe(t0);
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Gamma"));
  await settle(page, ff);
  let p1 = await byLabel(page);
  const map1 = await storedMap(ff);
  ff.note({ X1: { moved: moved(p0, p1), gammaBefore: p0.Gamma, gammaAfter: p1.Gamma, mapAfter: mapByLabel(map1) } });
  await fitShot(page, ff, "X1-after-undo");
  expect(moved(p0, p1)).toEqual([]);
  expect(mapByLabel(map1)).toEqual(mapByLabel(map0));

  step("X2 backspace the label Beta to empty, pause, type Bravo: Bravo sits where Beta was");
  p0 = await freshFrozen(page, ff, expect, "End", 120, 0);
  await gotoLine(page, "Beta");
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(600);
  await page.keyboard.type("Bravo", { delay: 120 });
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Bravo"));
  await settle(page, ff);
  p1 = await byLabel(page);
  ff.note({ X2: { betaBefore: p0.Beta, bravoAfter: p1.Bravo, movedOthers: moved(p0, p1) } });
  await fitShot(page, ff, "X2-after-retype");
  expect(moved(p0, p1)).toEqual([]);
  expect([p1.Bravo.x, p1.Bravo.y]).toEqual([p0.Beta.x, p0.Beta.y]);

  step("X3 cut the Delta line (Cmd+X) and paste it back in place (Cmd+V): nothing moves");
  p0 = await freshFrozen(page, ff, expect, "End", 120, 0);
  await gotoLine(page, "Delta");
  await page.keyboard.press("Meta+x");
  await ff.waitForGraph((g) => !g.nodes.some((n) => n.label === "Delta"));
  await settle(page, ff);
  await page.keyboard.press("Meta+v");
  await page.waitForTimeout(400);
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Delta"));
  await settle(page, ff);
  p1 = await byLabel(page);
  ff.note({ X3: { text: await editorText(page), deltaBefore: p0.Delta, deltaAfter: p1.Delta, moved: moved(p0, p1) } });
  await fitShot(page, ff, "X3-after-cut-paste");
  expect(moved(p0, p1)).toEqual([]);
};
