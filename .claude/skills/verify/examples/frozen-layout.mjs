// Frozen layout: after a drag freezes the chart, text edits elsewhere must not move
// existing nodes, a new node must get a real position, align tools must still work on the
// edited chart, and the frozen positions must survive a reload.
//
// The chart is a user's real one (the "every change redraws my flowchart" report): deep
// nesting, edge labels, and (reference) links, so inserting one line re-keys many nodes.
const DOC = [
  "Request",
  "  Detect test-load header",
  "    true: (Apply test-loader header)",
  "    false: Check for fallback",
  "      true: Run fallback \\(flag is off)",
  "      false: Throw auth error",
  '    "without bypass": getProducerCodeAccessCandidate {',
  "      Extract token",
  "        fail: (null)",
  "        Decode token",
  "          fail: (null)",
  "          Get OU",
  "            fail: (null)",
  "            Detect role",
  "              fail: (null)",
  "              Get flag \\(by Auth0 user ID)",
  "                fail: (null)",
  "      null",
  "    }",
  "      null: Apply test-loader header",
  "      candidate: Populate producer user code access cache & context",
].join("\n");

/** Positions by label. Containers are skipped: cytoscape derives their position from their children. */
const positions = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy
        .nodes()
        .filter((n) => !n.isParent())
        .map((n) => [n.data("label"), { id: n.id(), x: +n.position().x.toFixed(1), y: +n.position().y.toFixed(1) }])
    )
  );

/** Labels of leaf nodes whose box intersects the box of the node with this label. */
const overlapping = (page, label) =>
  page.evaluate((label) => {
    const me = window.__cy.nodes().filter((n) => n.data("label") === label)[0];
    const a = me.boundingBox({ includeLabels: false });
    return window.__cy
      .nodes()
      .filter((n) => n !== me && !n.isParent())
      .filter((n) => {
        const b = n.boundingBox({ includeLabels: false });
        return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
      })
      .map((n) => n.data("label"));
  }, label);

const containerWraps = (page, label) =>
  page.evaluate((label) => {
    const c = window.__cy.nodes().filter((n) => n.data("label") === label)[0];
    if (!c || !c.isParent()) return false;
    const bb = c.boundingBox();
    return c.children().every((ch) => {
      const p = ch.position();
      return p.x > bb.x1 && p.x < bb.x2 && p.y > bb.y1 && p.y < bb.y2;
    });
  }, label);

/** Labels whose position changed between two snapshots (new and removed labels are ignored). */
const moved = (a, b) =>
  Object.keys(a).filter((k) => b[k] && Math.hypot(a[k].x - b[k].x, a[k].y - b[k].y) > 0.5);

const storedMeta = async (ff) => {
  const s = await ff.storage("flowcharts.fun.sandbox");
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]) : null;
};

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
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Meta+ArrowUp");
  const lines = (await page.evaluate(() => window.monaco.editor.getModels()[0].getValue())).split("\n");
  const idx = lines.findIndex((l) => l.includes(substring));
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

const deleteLine = async (page, substring) => {
  await gotoLine(page, substring);
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
};

const appendLine = async (page, line) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+End");
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.type(line);
};

export default async ({ page, ff, step, expect }) => {
  step("open the sandbox and type the chart; auto layout places every node");
  await ff.open("/");
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Detect role"));
  expect((await storedMeta(ff))?.nodePositions).toBeUndefined();
  await ff.shot("auto-layout", ff.canvas());

  step("drag 'Get OU' 60px left: this freezes the whole layout into meta.nodePositions");
  const p0 = await positions(page);
  await dragNode(page, ff, "Get OU", -60, 0);
  const p1 = await positions(page);
  expect(moved(p0, p1)).toEqual(["Get OU"]);
  await expect.poll(async () => (await storedMeta(ff))?.nodePositions).toBeDefined();
  const frozenMeta = await storedMeta(ff);
  expect(Object.keys(frozenMeta.nodePositions)).toHaveLength(Object.keys(p1).length + 1);
  await expect(page.getByRole("button", { name: "Layout Frozen" })).toHaveAttribute("aria-pressed", "true");
  await ff.shot("frozen-after-drag", ff.canvas());

  step("frozen: rename a node in place (Get OU -> Get the OU); the node stays put");
  await replaceLabel(page, "Get OU", "Get the OU");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Get the OU"));
  const p2 = await positions(page);
  p2["Get OU"] = p2["Get the OU"];
  expect(moved(p1, p2)).toEqual([]);
  expect(p2["Get the OU"]).toMatchObject({ x: p1["Get OU"].x, y: p1["Get OU"].y });

  step("frozen: insert a child line under 'Detect role' (re-keys every node below it)");
  await insertLineAfter(page, "Detect role", "              Inserted child");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Inserted child"));
  const p3 = await positions(page);
  ff.note({ movedByInsert: moved(p2, p3), insertedAt: p3["Inserted child"], parentAt: p3["Detect role"] });
  expect(moved(p2, p3)).toEqual([]);
  const inserted = p3["Inserted child"];
  expect(inserted).not.toMatchObject({ x: 0, y: 0 });
  const distToParent = Math.hypot(inserted.x - p3["Detect role"].x, inserted.y - p3["Detect role"].y);
  expect(distToParent).toBeLessThan(300);
  expect(await overlapping(page, "Inserted child")).toEqual([]);
  expect(await containerWraps(page, "getProducerCodeAccessCandidate")).toBe(true);
  await page.evaluate(() => window.__cy.fit(undefined, 20));
  await page.waitForTimeout(300);
  await ff.shot("frozen-after-insert", ff.canvas());

  step("frozen: append a top-level node at the end; nothing else moves and it is placed");
  await appendLine(page, "Another new node");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Another new node"));
  const p4 = await positions(page);
  expect(moved(p3, p4)).toEqual([]);
  expect(p4["Another new node"]).not.toMatchObject({ x: 0, y: 0 });
  expect(await overlapping(page, "Another new node")).toEqual([]);
  await page.evaluate(() => window.__cy.fit(undefined, 20));
  await page.waitForTimeout(300);
  await ff.shot("frozen-after-append", ff.canvas());

  step("frozen: delete the inserted line; the nodes below it keep their positions");
  await deleteLine(page, "Inserted child");
  await ff.waitForGraph((g) => !g.nodes.some((n) => n.label === "Inserted child"));
  const p5 = await positions(page);
  expect(moved(p4, p5)).toEqual([]);

  step("align tools still work on the edited chart: select two nodes, Align Vertically");
  const a = await nodeScreenPos(page, ff, "Get the OU");
  const b = await nodeScreenPos(page, ff, "Throw auth error");
  await page.mouse.click(a.x, a.y);
  await page.keyboard.down("Shift");
  await page.mouse.click(b.x, b.y);
  await page.keyboard.up("Shift");
  await expect(page.getByRole("button", { name: "Align Vertically" })).toBeEnabled();
  await page.getByRole("button", { name: "Align Vertically" }).click();
  const p6 = await ff.waitForGraph((g) => {
    const ya = g.nodes.find((n) => n.label === "Get the OU")?.position.y;
    const yb = g.nodes.find((n) => n.label === "Throw auth error")?.position.y;
    return ya !== undefined && Math.abs(ya - yb) < 0.5;
  });
  const p6p = await positions(page);
  expect(moved(p5, p6p).sort()).toEqual(["Get the OU", "Throw auth error"]);
  ff.note({ alignedY: p6.nodes.filter((n) => ["Get the OU", "Throw auth error"].includes(n.label)).map((n) => n.position.y) });
  await page.mouse.click(a.x + 400, a.y + 400);
  await ff.shot("after-align", ff.canvas());

  step("reload: the frozen positions persist");
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Another new node"));
  const p7 = await positions(page);
  expect(moved(p6p, p7)).toEqual([]);
  expect((await storedMeta(ff))?.nodePositions).toBeDefined();

  step("unfreeze via the snowflake: the auto layout runs again and nodePositions is cleared");
  await page.getByRole("button", { name: "Layout Frozen" }).click();
  await expect.poll(async () => (await storedMeta(ff))?.nodePositions).toBeUndefined();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Another new node"));
  await ff.shot("after-unfreeze", ff.canvas());
};
