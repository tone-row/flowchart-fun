// Frozen layout across reloads. Positions are resolved from the map saved at the last
// drag, so reopening a chart after text edits shows the same picture the session ended
// with, and the edits never rewrite the map. Also two in-session cases the label matcher
// must get right: renaming a node onto a label another node already has, and deleting the
// first of two duplicate labels.
const KEY = "flowcharts.fun.sandbox";

const seed = async (page, ff, text, meta = {}) => {
  await ff.open("/");
  const M = { expires: new Date(Date.now() + 36e5).toISOString(), ...meta };
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, `${text}\n\n=====\n${JSON.stringify(M)}\n=====`]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length > 0);
  await page.waitForTimeout(1000);
};

/** Positions keyed by id, with the label, so duplicate labels stay distinguishable. */
const byId = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy
        .nodes()
        .map((n) => [n.id(), { label: n.data("label"), x: +n.position().x.toFixed(1), y: +n.position().y.toFixed(1) }])
    )
  );

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

const storedMap = async (ff) => JSON.parse((await ff.storage(KEY)).split("=====")[1]).nodePositions;

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

const gotoLine = async (page, substring, nth = 0) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Meta+ArrowUp");
  const lines = (await page.evaluate(() => window.monaco.editor.getModels()[0].getValue())).split("\n");
  let idx = -1;
  let seen = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(substring)) continue;
    if (seen === nth) {
      idx = i;
      break;
    }
    seen++;
  }
  if (idx < 0) throw new Error(`no line containing ${substring}`);
  for (let i = 0; i < idx; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
};

const replaceLabel = async (page, from, to) => {
  await gotoLine(page, from);
  for (let i = 0; i < from.length; i++) await page.keyboard.press("Shift+ArrowLeft");
  await page.keyboard.type(to);
};

const insertLineAfter = async (page, substring, line) => {
  await gotoLine(page, substring);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.type(line);
};

const insertLineAtTop = async (page, line) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Home");
  await page.keyboard.press("Home");
  await page.keyboard.type(line);
  await page.keyboard.press("Enter");
};

const deleteLine = async (page, substring, nth = 0) => {
  await gotoLine(page, substring, nth);
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
};

const settle = async (page, ff) => {
  await page.waitForTimeout(700);
  await ff.waitForGraph();
};

const reload = async (page, ff, label) => {
  await expect_text_saved(ff, label);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === label));
  await page.waitForTimeout(1000);
};

const expect_text_saved = async (ff, label) => {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const s = await ff.storage(KEY);
    if (s && s.split("=====")[0].includes(label)) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`stored text never recorded ${label}`);
};

const expect_saved = async (ff, label) => {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const s = await ff.storage(KEY);
    if (s && s.includes(label) && JSON.stringify((await storedMap(ff)) ?? {}).includes(`"${label}"`)) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`stored map never recorded ${label}`);
};

const freeze = async (page, ff, label) => {
  await dragNode(page, ff, label, 50, 0);
  await expect_saved(ff, label);
  await settle(page, ff);
};

export default async ({ page, ff, step, expect }) => {
  step("rename onto an existing label: type Check over A while another Check exists; nothing moves");
  await seed(page, ff, ["A", "  B", "  Check", "    D"].join("\n"));
  await freeze(page, ff, "D");
  const e0 = await byId(page);
  await replaceLabel(page, "A", "Check");
  await ff.waitForGraph((g) => g.nodes.filter((n) => n.label === "Check").length === 2);
  await settle(page, ff);
  const e1 = await byId(page);
  ff.note({ renameCollide: { before: e0, after: e1, moved: moved(e0, e1) } });
  expect(moved(e0, e1)).toEqual([]);
  await ff.shot("rename-onto-existing-label", ff.canvas());

  step("delete the first of two duplicate labels: the second Check stays where it was");
  await seed(page, ff, ["Start", "  Check", "    Yes", "  Other", "    Check", "      End"].join("\n"));
  await freeze(page, ff, "Start");
  const d0 = await byId(page);
  const survivorBefore = d0.n5;
  expect(survivorBefore).toMatchObject({ label: "Check" });
  await deleteLine(page, "Check", 0);
  await ff.waitForGraph((g) => g.nodes.filter((n) => n.label === "Check").length === 1);
  await settle(page, ff);
  const d1 = await byLabel(page);
  ff.note({ deleteFirstDuplicate: { survivorBefore, survivorAfter: d1.Check } });
  expect(d1.Check).toMatchObject({ x: survivorBefore.x, y: survivorBefore.y });
  expect(d1.End).toMatchObject({ x: d0.n6.x, y: d0.n6.y });
  await ff.shot("delete-first-duplicate", ff.canvas());

  step("rename + insert above, then RELOAD: nothing moved and the map still holds the label from the drag");
  await seed(page, ff, ["A", "  B", "  Check", "    D"].join("\n"));
  await freeze(page, ff, "D");
  await replaceLabel(page, "Check", "Checked");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Checked"));
  await settle(page, ff);
  await insertLineAfter(page, "B", "  New");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "New"));
  await settle(page, ff);
  const f0 = await byLabel(page);
  await reload(page, ff, "New");
  const f1 = await byLabel(page);
  ff.note({ renameInsertReload: { before: f0, after: f1, moved: moved(f0, f1) } });
  expect(moved(f0, f1)).toEqual([]);
  expect((await storedMap(ff)).n3).toMatchObject({ label: "Check" });
  await ff.shot("rename-insert-reload", ff.canvas());

  step("legacy chart (n<line> keys, no labels): insert at the top, RELOAD, the same picture and the map untouched");
  const LEGACY = { n1: { x: 100, y: 50 }, n2: { x: 40, y: 150 }, n3: { x: 160, y: 150 }, n4: { x: 100, y: 260 } };
  await seed(page, ff, ["Start", "  Left", "  Right", "    Finish"].join("\n"), { nodePositions: LEGACY });
  const l0 = await byLabel(page);
  expect(l0.Start).toMatchObject(LEGACY.n1);
  await insertLineAtTop(page, "Intro");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Intro"));
  await settle(page, ff);
  const l1 = await byLabel(page);
  ff.note({ legacyInsert: { before: l0, after: l1, movedByInsert: moved(l0, l1) } });
  expect(l1.Intro).toMatchObject(LEGACY.n1);
  await reload(page, ff, "Intro");
  const l2 = await byLabel(page);
  ff.note({ legacyInsertReload: { before: l1, after: l2, moved: moved(l1, l2) } });
  expect(moved(l1, l2)).toEqual([]);
  expect(await storedMap(ff)).toEqual(LEGACY);
  await ff.shot("legacy-insert-reload", ff.canvas());

  step("two new nodes added in reverse text order, RELOAD, same positions");
  await seed(page, ff, ["A", "  B", "  C"].join("\n"));
  await freeze(page, ff, "C");
  await insertLineAfter(page, "C", "    P");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "P"));
  await settle(page, ff);
  await insertLineAfter(page, "C", "    Q");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Q"));
  await settle(page, ff);
  const h0 = await byLabel(page);
  expect(h0.P).not.toEqual(expect.objectContaining({ x: h0.Q.x, y: h0.Q.y }));
  await reload(page, ff, "Q");
  const h1 = await byLabel(page);
  ff.note({ twoNewNodesReload: { before: h0, after: h1, moved: moved(h0, h1) } });
  expect(moved(h0, h1)).toEqual([]);
  await ff.shot("two-new-nodes-reload", ff.canvas());
};
