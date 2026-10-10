// A node added to a frozen chart must not be drawn on a container: neither on an empty
// container (`Box {` / `}`, which renders as a plain node) nor inside the rectangle of a
// container whose children were dragged apart, where the gap between them looks free.
const KEY = "flowcharts.fun.sandbox";

const seed = async (page, ff, text, nodePositions) => {
  await ff.open("/");
  const meta = { expires: new Date(Date.now() + 36e5).toISOString(), ...(nodePositions ? { nodePositions } : {}) };
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, `${text}\n\n=====\n${JSON.stringify(meta)}\n=====`]);
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length > 0);
  await page.waitForTimeout(1500);
};

const boxes = (page) =>
  page.evaluate(() =>
    Object.fromEntries(
      window.__cy.nodes().map((n) => [n.data("label"), n.boundingBox({ includeLabels: false })])
    )
  );

const hit = (a, b) => a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;

const storedMap = async (ff) => {
  const s = await ff.storage(KEY);
  return s?.split("=====")[1] ? JSON.parse(s.split("=====")[1]).nodePositions : undefined;
};

const editorText = (page) => page.evaluate(() => window.monaco.editor.getModels()[0].getValue());

const dragNode = async (page, ff, label, dx, dy) => {
  const box = await ff.canvas().boundingBox();
  const p = await page.evaluate((label) => {
    const n = window.__cy.nodes().filter((n) => n.data("label") === label)[0];
    return n.renderedPosition();
  }, label);
  const from = { x: box.x + p.x, y: box.y + p.y };
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(from.x + (dx * i) / 8, from.y + (dy * i) / 8);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);
};

const insertAfterLastClose = async (page, text) => {
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("Meta+ArrowUp");
  const index = (await editorText(page)).split("\n").map((l) => l.trim()).lastIndexOf("}");
  for (let i = 0; i < index; i++) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.type(text);
};

const CASES = [
  {
    name: "empty-container",
    text: "Start\n  Box {\n  }",
  },
  {
    name: "container-gap",
    text: "Start\n  Box {\n    One\n    Two\n  }",
    map: {
      n1: { x: 0, y: 0, label: "Start" },
      n2: { x: 0, y: 100, label: "Box" },
      n3: { x: -320, y: 100, label: "One" },
      n4: { x: 320, y: 100, label: "Two" },
    },
  },
];

export default async ({ page, ff, step, expect }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  const onNew = {};
  for (const c of CASES) {
    step(`${c.name}: freeze`);
    await seed(page, ff, c.text, c.map);
    if (!c.map) {
      await dragNode(page, ff, "Start", 60, 0);
      await expect.poll(() => storedMap(ff)).toBeDefined();
      await page.waitForTimeout(800);
    }
    await ff.shot(`${c.name}-frozen`, ff.canvas());

    step(`${c.name}: add a child of Start after the container`);
    await insertAfterLastClose(page, "  New");
    await expect.poll(async () => (await editorText(page)).trimEnd()).toBe(`${c.text}\n  New`);
    await page.waitForTimeout(800);
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "New"));
    const now = await boxes(page);
    onNew[c.name] = Object.keys(now).filter((label) => label !== "New" && hit(now[label], now.New));
    ff.note({ case: c.name, boxes: now, onNew: onNew[c.name] });
    await page.evaluate(() => window.__cy.fit(undefined, 20));
    await ff.shot(`${c.name}-added`, ff.canvas());
  }
  expect(onNew).toEqual({ "empty-container": [], "container-gap": [] });
};
