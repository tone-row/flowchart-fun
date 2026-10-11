// A node added after the last drag that hangs off a container is placed from the
// container's box. That box must come from the children's resolved positions, not from
// the size cytoscape held before this render's layout ran, or reloading the chart draws
// the node somewhere else than the session did.
const KEY = "flowcharts.fun.sandbox";

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
      window.__cy.nodes().map((n) => [n.data("label"), { id: n.id(), x: +n.position().x.toFixed(1), y: +n.position().y.toFixed(1) }])
    )
  );

const storedMeta = async (ff) => {
  const s = await ff.storage(KEY);
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]) : null;
};

const editorText = (page) => page.evaluate(() => window.monaco.editor.getModels()[0].getValue());

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

const gotoLine = async (page, substring) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Meta+ArrowUp");
  const lines = (await editorText(page)).split("\n");
  const idx = lines.findIndex((l) => l.includes(substring));
  if (idx < 0) throw new Error(`no line containing ${substring}`);
  for (let i = 0; i < idx; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
};

const insertLineAfter = async (page, substring, line) => {
  await gotoLine(page, substring);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.type(line);
};

const settle = async (page, ff) => {
  await page.waitForTimeout(700);
  await ff.waitForGraph();
};

const fitShot = async (page, ff, name) => {
  await page.evaluate(() => window.__cy.fit(undefined, 20));
  await page.waitForTimeout(300);
  await ff.shot(name, ff.canvas());
};

const textSaved = async (page, ff) => {
  const want = (await editorText(page)).trim();
  for (let i = 0; i < 80; i++) {
    const s = await ff.storage(KEY);
    if (s && s.split("=====")[0].trim() === want) return;
    await page.waitForTimeout(100);
  }
  throw new Error("text not saved");
};

export default async ({ page, ff, step, expect }) => {
  step("seed Start -> Box { One }, drag Start to freeze");
  await seed(page, ff, ["Start", "  Box {", "    One", "  }"].join("\n"));
  await dragNode(page, ff, "Start", 120, 0);
  await expect.poll(async () => (await storedMeta(ff))?.nodePositions).toBeDefined();
  await settle(page, ff);

  step("add After hanging off the container, then grow the container with Two and Three");
  await insertLineAfter(page, "  }", "    After");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "After"));
  await settle(page, ff);
  await insertLineAfter(page, "    One", "    Two");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Two"));
  await settle(page, ff);
  await insertLineAfter(page, "    Two", "    Three");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Three"));
  await settle(page, ff);
  await textSaved(page, ff);
  const session = await byLabel(page);
  await fitShot(page, ff, "session");

  step("reload: every node is where the session drew it");
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Three"));
  await page.waitForTimeout(1200);
  await settle(page, ff);
  const reloaded = await byLabel(page);
  await fitShot(page, ff, "reloaded");
  ff.note({ session, reloaded });
  expect(reloaded).toEqual(session);
};
