// A sandbox chart frozen before labels were stored (nodePositions keyed `n<line>`, no
// labels) must open exactly as stored and must not be written back by opening it or by
// editing the text. Until the next position action it resolves by id, as it always has;
// the first align (or drag) rewrites the map under the current ids with labels, and from
// then on text edits move nothing.
const KEY = "flowcharts.fun.sandbox";
const STORED = {
  n1: { x: 100, y: 50 },
  n2: { x: 40, y: 150 },
  n3: { x: 160, y: 150 },
  n4: { x: 100, y: 260 },
};
const TEXT = ["Start", "  Left", "  Right", "    Finish"].join("\n");
const META = {
  expires: new Date(Date.now() + 36e5).toISOString(),
  nodePositions: STORED,
};
const DOC = `${TEXT}\n\n=====\n${JSON.stringify(META)}\n=====`;

const positions = (page) =>
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

const insertLineAtTop = async (page, line) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Meta+ArrowUp");
  await page.keyboard.press("Home");
  await page.keyboard.type(line);
  await page.keyboard.press("Enter");
};

export default async ({ page, ff, step, expect }) => {
  step("seed a legacy frozen chart in localStorage and open the sandbox");
  await ff.open("/");
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, DOC]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Finish"));
  await page.waitForTimeout(3000);

  step("it renders from the stored ids, unchanged");
  const p0 = await positions(page);
  expect(p0).toMatchObject({
    Start: { id: "n1", ...STORED.n1 },
    Left: { id: "n2", ...STORED.n2 },
    Right: { id: "n3", ...STORED.n3 },
    Finish: { id: "n4", ...STORED.n4 },
  });
  await expect(page.getByRole("button", { name: "Layout Frozen" })).toHaveAttribute("aria-pressed", "true");
  await ff.shot("legacy-open", ff.canvas());

  step("opening wrote nothing: the stored value is byte-identical");
  expect(await ff.storage(KEY)).toBe(DOC);

  step("insert a line at the top: the map is not rewritten; nodes resolve by id as before and the node past the end is placed");
  await insertLineAtTop(page, "Intro");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Intro"));
  await page.waitForTimeout(700);
  const p1 = await positions(page);
  ff.note({ afterInsert: p1 });
  expect(p1.Intro).toMatchObject({ id: "n1", ...STORED.n1 });
  expect(p1.Finish).not.toMatchObject({ x: 0, y: 0 });
  await expect.poll(async () => (await ff.storage(KEY)).startsWith("Intro\n")).toBe(true);
  expect(await storedMap(ff)).toEqual(STORED);
  await ff.shot("legacy-after-insert", ff.canvas());

  step("Align Horizontally on two nodes rewrites the map under the current ids, with labels");
  const box = await ff.canvas().boundingBox();
  const at = async (label) => {
    const p = await page.evaluate((l) => {
      const n = window.__cy.nodes().filter((n) => n.data("label") === l)[0];
      const r = n.renderedPosition();
      return { x: r.x, y: r.y };
    }, label);
    return { x: box.x + p.x, y: box.y + p.y };
  };
  const a = await at("Left");
  const b = await at("Finish");
  await page.mouse.click(a.x, a.y);
  await page.keyboard.down("Shift");
  await page.mouse.click(b.x, b.y);
  await page.keyboard.up("Shift");
  await page.getByRole("button", { name: "Align Horizontally" }).click();
  await expect.poll(async () => Object.keys(await storedMap(ff)).sort()).toEqual(["n1", "n2", "n3", "n4", "n5"]);
  const map = await storedMap(ff);
  const p2 = await positions(page);
  for (const label of ["Intro", "Start", "Left", "Right", "Finish"]) {
    expect(map[p2[label].id]).toEqual({ label, x: p2[label].x, y: p2[label].y });
  }
  expect(p2.Left.x).toBe(p2.Finish.x);
  await ff.shot("legacy-after-align", ff.canvas());

  step("with labels stored, another insert at the top moves nothing and the map is not rewritten");
  await page.mouse.click(box.x + box.width - 5, box.y + 5);
  await insertLineAtTop(page, "Preface");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Preface"));
  await page.waitForTimeout(700);
  const p3 = await positions(page);
  ff.note({ movedBySecondInsert: moved(p2, p3) });
  expect(moved(p2, p3)).toEqual([]);
  await expect.poll(async () => (await ff.storage(KEY)).startsWith("Preface\n")).toBe(true);
  expect(await storedMap(ff)).toEqual(map);

  step("reload: the same picture");
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Preface"));
  await page.waitForTimeout(1000);
  expect(moved(p3, await positions(page))).toEqual([]);
  await ff.shot("legacy-after-reload", ff.canvas());
};
