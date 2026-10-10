// David's chart, one drag, then 30 seeded random keyboard edits (insert, delete, rename,
// reorder, undo) with a reload after every 5, for seeds 1 to 3 (SEED=n runs one seed).
// After every edit: every leaf whose label is in the map saved at the drag is drawn at
// its stored position, the stored map is byte-identical to the one the drag wrote, and
// every container wraps its children. At every reload: positions by id equal the ones
// drawn just before the reload. Then Align Horizontally on two anchored nodes, and one
// more reload that draws the aligned picture.
const KEY = "flowcharts.fun.sandbox";
const SEEDS = process.env.SEED ? [Number(process.env.SEED)] : [1, 2, 3];
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

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seed = async (page, ff, text) => {
  await ff.open("/");
  const meta = { expires: new Date(Date.now() + 36e5).toISOString() };
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, `${text}\n\n=====\n${JSON.stringify(meta)}\n=====`]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length > 0);
  await page.waitForTimeout(1500);
};

const snap = (page) =>
  page.evaluate(() =>
    window.__cy.nodes().map((n) => {
      const b = n.boundingBox();
      return {
        id: n.id(),
        label: n.data("label"),
        parent: n.isChild() ? n.parent().first().id() : null,
        isParent: n.isParent(),
        x: +n.position().x.toFixed(2),
        y: +n.position().y.toFixed(2),
        box: { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2 },
      };
    })
  );
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const editorText = (page) => page.evaluate(() => window.monaco.editor.getModels()[0].getValue());
const storedMeta = async (ff) => {
  const s = await ff.storage(KEY);
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]) : null;
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
  const deadline = Date.now() + 8000;
  const want = (await editorText(page)).trim();
  while (Date.now() < deadline) {
    const s = await ff.storage(KEY);
    if (s && s.split("=====")[0].trim() === want) return true;
    await page.waitForTimeout(100);
  }
  return false;
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
const backgroundPoint = async (page, ff) => {
  const box = await ff.canvas().boundingBox();
  const bb = await page.evaluate(() => window.__cy.nodes().renderedBoundingBox());
  return { x: box.x + box.width - 5, y: box.y + Math.min(box.height - 5, bb.y2 + 20) };
};
const clickWait = async (page, pt) => {
  await page.waitForTimeout(400);
  await page.mouse.click(pt.x, pt.y);
};
const selectPair = async (page, ff, a, b) => {
  await clickWait(page, await backgroundPoint(page, ff));
  await page.keyboard.down("Shift");
  await clickWait(page, await nodeScreenPos(page, ff, a));
  await clickWait(page, await nodeScreenPos(page, ff, b));
  await page.keyboard.up("Shift");
  const bg = await backgroundPoint(page, ff);
  await page.mouse.move(bg.x, bg.y);
  const sel = await page.evaluate(() => window.__cy.$("node:selected").map((n) => n.data("label")).sort());
  if (JSON.stringify(sel) !== JSON.stringify([a, b].sort())) throw new Error(`expected ${a},${b} selected, got ${sel}`);
};
const lineAt = async (page, idx) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Home");
  for (let i = 0; i < idx; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
};
const isRef = (l) => /^\s*([^:]*:\s*)?\(/.test(l);
const protectedLine = (l) => /[{}]/.test(l) || /\bnull\b/.test(l) || /Apply test-loader header/.test(l) || l.trim() === "";

const reloadSame = async (page, ff, before) => {
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length > 0);
  await page.waitForTimeout(1200);
  await settle(page, ff);
  const after = await snap(page);
  const byId = Object.fromEntries(before.map((n) => [n.id, n]));
  const diffs = after
    .filter((n) => !byId[n.id] || dist(n, byId[n.id]) > 0.5 || byId[n.id].label !== n.label)
    .map((n) => ({ id: n.id, label: n.label, after: [n.x, n.y], before: byId[n.id] ? [byId[n.id].x, byId[n.id].y, byId[n.id].label] : null }));
  const missing = Object.keys(byId).filter((id) => !after.some((n) => n.id === id));
  return { after, diffs, missing };
};

async function runSeed(SEED, { page, ff, step, expect }) {
  const rnd = mulberry32(SEED);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  step(`seed ${SEED}: David's chart, drag 'Detect role'`);
  await seed(page, ff, DOC);
  await dragNode(page, ff, "Detect role", 140, 50);
  await expect.poll(async () => (await storedMeta(ff))?.nodePositions).toBeDefined();
  await settle(page, ff);
  const storedRaw = JSON.stringify((await storedMeta(ff)).nodePositions);
  const storedByLabel = Object.fromEntries(Object.values(JSON.parse(storedRaw)).map((v) => [v.label, v]));
  const draggedAt = storedByLabel["Detect role"];
  await fitShot(page, ff, `s${SEED}-00-after-drag`);

  const violations = [];
  let prev = await snap(page);
  let newCounter = 0;

  for (let k = 1; k <= 30; k++) {
    const lines = (await editorText(page)).split("\n");
    const editable = lines.map((l, i) => [l, i]).filter(([l]) => !protectedLine(l));
    const op = pick(["insert", "insert", "insert", "delete", "delete", "rename", "rename", "reorder", "undo"]);
    let detail;
    if (op === "insert") {
      const [l, i] = pick(lines.map((l, i) => [l, i]).filter(([l]) => l.trim() && !/[{]/.test(l)));
      const indent = l.match(/^\s*/)[0] + (rnd() < 0.5 && !isRef(l) ? "  " : "");
      const label = `New ${++newCounter}`;
      await lineAt(page, i);
      await page.keyboard.press("Enter");
      await page.keyboard.press("Shift+Home");
      await page.keyboard.press("Shift+Home");
      await page.keyboard.type(indent + label);
      detail = { after: l.trim(), label };
    } else if (op === "delete") {
      const [l, i] = pick(editable.filter(([, i]) => i > 0));
      await lineAt(page, i);
      await page.keyboard.press("Shift+Home");
      await page.keyboard.press("Shift+Home");
      await page.keyboard.press("Backspace");
      await page.keyboard.press("Backspace");
      detail = { line: l.trim() };
    } else if (op === "rename") {
      const [l, i] = pick(editable.filter(([l]) => !isRef(l)));
      await lineAt(page, i);
      await page.keyboard.type(` r${k}`);
      detail = { line: l.trim() };
    } else if (op === "reorder") {
      const [l, i] = pick(editable.filter(([, i]) => i > 0 && !/[{}]/.test(lines[i - 1])));
      await lineAt(page, i);
      await page.keyboard.press("Alt+ArrowUp");
      detail = { line: l.trim(), above: lines[i - 1].trim() };
    } else {
      await page.locator(".monaco-editor .view-lines").first().click();
      await page.keyboard.press("Meta+z");
      detail = {};
    }
    await page.waitForTimeout(400);
    await settle(page, ff);
    await settle(page, ff);
    const saved = await textSaved(page, ff);
    const cur = await snap(page);

    const counts = {};
    for (const n of cur) counts[n.label] = (counts[n.label] ?? 0) + 1;
    const anchoredOff = cur
      .filter((n) => !n.isParent && storedByLabel[n.label] && counts[n.label] === 1 && dist(n, storedByLabel[n.label]) > 0.5)
      .map((n) => ({ label: n.label, at: [n.x, n.y], stored: [storedByLabel[n.label].x, storedByLabel[n.label].y] }));
    const mapUnchanged = JSON.stringify((await storedMeta(ff))?.nodePositions) === storedRaw;
    const byId = Object.fromEntries(cur.map((n) => [n.id, n]));
    const unwrapped = cur
      .filter((n) => n.parent && byId[n.parent])
      .filter((n) => {
        const p = byId[n.parent].box;
        const c = n.box;
        return c.x1 < p.x1 - 1 || c.y1 < p.y1 - 1 || c.x2 > p.x2 + 1 || c.y2 > p.y2 + 1;
      })
      .map((n) => `${n.label} outside ${byId[n.parent].label}`);
    const prevBy = Object.fromEntries(prev.filter((n) => !n.isParent).map((n) => [n.label, n]));
    const unanchoredMoved = cur
      .filter((n) => !n.isParent && !storedByLabel[n.label] && prevBy[n.label] && dist(n, prevBy[n.label]) > 0.5)
      .map((n) => n.label);
    const draggedNode = cur.find((n) => n.label.startsWith("Detect role"));
    const draggedOk = !draggedNode || dist(draggedNode, draggedAt) <= 0.5;

    ff.note({ seed: SEED, k, op, detail, text: await editorText(page), saved, anchoredOff, mapUnchanged, unwrapped, unanchoredMoved, draggedOk, nodes: cur.length });
    if (anchoredOff.length) violations.push(`edit ${k} ${op}: anchored moved ${JSON.stringify(anchoredOff)}`);
    if (!mapUnchanged) violations.push(`edit ${k} ${op}: stored map rewritten`);
    if (unwrapped.length) violations.push(`edit ${k} ${op}: ${unwrapped.join(", ")}`);
    if (!draggedOk) violations.push(`edit ${k} ${op}: dragged node moved`);
    prev = cur;

    if (k % 5 === 0) {
      step(`seed ${SEED}: reload after edit ${k}`);
      if (!saved) violations.push(`edit ${k}: storage text never matched editor before reload`);
      const { after, diffs, missing } = await reloadSame(page, ff, cur);
      ff.note({ seed: SEED, reload: k, diffs, missing });
      if (diffs.length || missing.length) violations.push(`reload after ${k}: ${JSON.stringify({ diffs, missing })}`);
      await fitShot(page, ff, `s${SEED}-reload-${String(k).padStart(2, "0")}`);
      prev = after;
    }
  }
  ff.note({ seed: SEED, violations });

  step(`seed ${SEED}: Align Horizontally on two anchored nodes, then reload`);
  const anchored = (await snap(page)).filter((n) => !n.isParent && storedByLabel[n.label] && n.label !== "Request");
  const a = anchored[0].label;
  const b = anchored.find((n) => Math.abs(n.x - anchored[0].x) > 0.5)?.label;
  if (!b) throw new Error(`seed ${SEED}: every anchored node already shares x with ${a}`);
  await selectPair(page, ff, a, b);
  const pre = await snap(page);
  await page.getByRole("button", { name: "Align Horizontally" }).click();
  await expect.poll(async () => JSON.stringify((await storedMeta(ff)).nodePositions) !== storedRaw).toBe(true);
  await settle(page, ff);
  const post = await snap(page);
  const pa = post.find((n) => n.label === a);
  const pb = post.find((n) => n.label === b);
  const preById = Object.fromEntries(pre.map((n) => [n.id, n]));
  const othersMoved = post.filter((n) => !n.isParent && n.label !== a && n.label !== b && dist(n, preById[n.id]) > 0.5).map((n) => n.label);
  const newMap = (await storedMeta(ff)).nodePositions;
  const mapMatchesDrawn = post.every(
    (n) => !newMap[n.id] || n.isParent || (Math.abs(newMap[n.id].x - n.x) < 0.01 && Math.abs(newMap[n.id].y - n.y) < 0.01 && newMap[n.id].label === n.label)
  );
  ff.note({ seed: SEED, align: { a, b, ax: pa.x, bx: pb.x, othersMoved, mapMatchesDrawn } });
  await fitShot(page, ff, `s${SEED}-after-align`);
  expect(Math.abs(pa.x - pb.x)).toBeLessThan(0.5);
  expect(othersMoved).toEqual([]);
  expect(mapMatchesDrawn).toBe(true);

  const { diffs, missing } = await reloadSame(page, ff, post);
  ff.note({ seed: SEED, alignReload: { diffs, missing } });
  expect({ diffs, missing }).toEqual({ diffs: [], missing: [] });

  expect(violations).toEqual([]);
}

export default async (ctx) => {
  await ctx.page.setViewportSize({ width: 1600, height: 1000 });
  for (const SEED of SEEDS) await runSeed(SEED, ctx);
};
