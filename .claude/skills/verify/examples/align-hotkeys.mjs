const DOC = ["Alpha", "  Beta", "Gamma", "  Delta", "// note"].join("\n");

const hookMonaco = () => {
  let m;
  window.__editors = [];
  Object.defineProperty(window, "monaco", {
    configurable: true,
    get: () => m,
    set(v) {
      m = v;
      v.editor.onDidCreateEditor((e) => window.__editors.push(e));
    },
  });
};

const cssText = (page) =>
  page.evaluate(() =>
    window.__editors
      .filter((e) => e.getModel()?.getLanguageId() === "scss")
      .pop()
      ?.getValue()
  );

async function nodePoint(page, ff, label) {
  const box = await ff.canvas().boundingBox();
  const p = await page.evaluate(
    (l) => window.__cy.nodes().filter((n) => n.data("label") === l)[0]?.renderedPosition(),
    label
  );
  if (!p) throw new Error(`no node ${label}`);
  const pt = { x: box.x + p.x, y: box.y + p.y };
  const onCanvas = await page.evaluate(
    ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-flowchart-fun-canvas="true"]'),
    pt
  );
  if (!onCanvas) throw new Error(`node ${label} is covered or off the canvas at ${JSON.stringify(pt)}`);
  return pt;
}

async function backgroundPoint(page, ff) {
  const box = await ff.canvas().boundingBox();
  const bb = await page.evaluate(() => window.__cy.nodes().renderedBoundingBox());
  return { x: box.x + box.width - 5, y: box.y + Math.min(box.height - 5, bb.y2 + 20) };
}

const CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS = 250;
const clickOutsideDoubleClickWindow = async (page, pt) => {
  await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
  await page.mouse.click(pt.x, pt.y);
};

const positions = (page) =>
  page.evaluate(() =>
    Object.fromEntries(window.__cy.nodes().map((n) => [n.data("label"), { ...n.position() }]))
  );

const selectedLabels = (page) =>
  page.evaluate(() => window.__cy.$("node:selected").map((n) => n.data("label")).sort());

async function selectPair(page, ff, a, b) {
  await clickOutsideDoubleClickWindow(page, await backgroundPoint(page, ff));
  await page.keyboard.down("Shift");
  await clickOutsideDoubleClickWindow(page, await nodePoint(page, ff, a));
  await clickOutsideDoubleClickWindow(page, await nodePoint(page, ff, b));
  await page.keyboard.up("Shift");
  const bg = await backgroundPoint(page, ff);
  await page.mouse.move(bg.x, bg.y);
  if (JSON.stringify(await selectedLabels(page)) !== JSON.stringify([a, b].sort()))
    throw new Error(`expected ${a} and ${b} selected, got ${await selectedLabels(page)}`);
}

export default async ({ page, ff, step, expect }) => {
  await page.addInitScript(hookMonaco);

  const failures = [];
  const check = async (name, fn) => {
    step(name);
    try {
      await fn();
    } catch (e) {
      failures.push(name);
      ff.note({ failed: name, error: String(e.message).split("\n").slice(0, 3).join(" | ") });
    }
  };

  const pressWithFocusIn = async ({ focus, key, a, b, readText, expectTyped }) => {
    const axis = key === "h" ? "x" : "y";
    const before = await positions(page);
    expect(before[a][axis], `${a} and ${b} start unaligned on ${axis}`).not.toBeCloseTo(before[b][axis], 0);
    const textBefore = await readText();
    await focus();
    expect(await selectedLabels(page), "focusing the text field keeps the graph selection").toEqual([a, b].sort());
    await page.keyboard.press(key);
    await expect.poll(readText, { message: `${key} is typed into the field` }).toBe(expectTyped(textBefore));
    await page.waitForTimeout(800);
    const after = await positions(page);
    ff.note({ key, before: { [a]: before[a], [b]: before[b] }, after: { [a]: after[a], [b]: after[b] } });
    expect(after, `pressing ${key} while typing must not align nodes`).toEqual(before);
  };

  const frozenToggle = page.getByRole("button", { name: "Layout Frozen" });
  const freezeFreshLayout = async () => {
    if ((await frozenToggle.getAttribute("aria-pressed")) === "true") {
      await frozenToggle.click();
      await expect(frozenToggle).toHaveAttribute("aria-pressed", "false");
    }
    await ff.waitForGraph((g) => g.nodes.length === 4);
    const delta = await nodePoint(page, ff, "Delta");
    await page.waitForTimeout(CYTOSCAPE_DOUBLE_CLICK_WINDOW_MS + 150);
    await page.mouse.move(delta.x, delta.y);
    await page.mouse.down();
    await page.mouse.move(delta.x + 40, delta.y + 30, { steps: 6 });
    await page.mouse.up();
    await expect(frozenToggle).toHaveAttribute("aria-pressed", "true");
  };

  step("type a chart");
  await ff.open("/");
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => g.nodes.length === 4);

  await check("graph focus: select Alpha + Delta, press h, they align and the text is unchanged; Ctrl+Z undoes it", async () => {
    await freezeFreshLayout();
    await selectPair(page, ff, "Alpha", "Delta");
    const before = await positions(page);
    expect(before.Alpha.x).not.toBeCloseTo(before.Delta.x, 0);
    const textBefore = await ff.editorText();
    expect(await page.evaluate(() => !!document.activeElement?.closest(".monaco-editor"))).toBe(false);
    await page.keyboard.press("h");
    await expect.poll(async () => {
      const p = await positions(page);
      return Math.abs(p.Alpha.x - p.Delta.x);
    }).toBeLessThan(0.5);
    const after = await positions(page);
    ff.note({ graphFocusH: { before: { Alpha: before.Alpha, Delta: before.Delta }, after: { Alpha: after.Alpha, Delta: after.Delta } } });
    expect(after.Alpha.y).toBeCloseTo(before.Alpha.y, 1);
    expect(after.Delta.y).toBeCloseTo(before.Delta.y, 1);
    expect(await ff.editorText()).toBe(textBefore);
    await ff.shot("graph-focus-h", page);
    await page.keyboard.press("Control+z");
    await expect.poll(() => positions(page), { message: "Ctrl+Z from the graph undoes the align" }).toEqual(before);
  });

  await check("document editor focus: h is typed and no align happens", async () => {
    await freezeFreshLayout();
    await selectPair(page, ff, "Beta", "Gamma");
    await pressWithFocusIn({
      key: "h",
      a: "Beta",
      b: "Gamma",
      readText: () => ff.editorText(),
      expectTyped: (t) => t.replace("// note", "// noteh"),
      focus: async () => {
        await page.locator(".monaco-editor .view-line", { hasText: "// note" }).first().click();
        await page.keyboard.press("End");
      },
    });
    await ff.shot("editor-focus-h", page);
  });

  await check("Custom CSS editor focus: v is typed and no align happens", async () => {
    await page.getByTestId("Editor Tab: Theme").click();
    const css = page.getByLabel("Custom CSS", { exact: true });
    await css.scrollIntoViewIfNeeded();
    await expect.poll(() => cssText(page)).toBeTruthy();
    await freezeFreshLayout();
    await selectPair(page, ff, "Alpha", "Delta");
    await pressWithFocusIn({
      key: "v",
      a: "Alpha",
      b: "Delta",
      readText: () => cssText(page),
      expectTyped: (t) => `v${t}`,
      focus: async () => {
        await css.locator(".view-line").first().click();
        await page.keyboard.press("Home");
        await page.keyboard.press("Home");
      },
    });
    await ff.shot("css-focus-v", page);
  });

  await check("AI prompt textarea focus: v is typed and no align happens", async () => {
    await page.getByTestId("Editor Tab: Document").click();
    await page.getByRole("button", { name: "Prompt" }).click();
    const textarea = page.locator("textarea:not(.inputarea)").first();
    await expect(textarea).toBeVisible();
    await freezeFreshLayout();
    await selectPair(page, ff, "Beta", "Gamma");
    await pressWithFocusIn({
      key: "v",
      a: "Beta",
      b: "Gamma",
      readText: () => textarea.inputValue(),
      expectTyped: (t) => `${t}v`,
      focus: async () => {
        await textarea.click();
        await page.keyboard.press("End");
      },
    });
    await ff.shot("textarea-focus-v", page);
  });

  if (failures.length) throw new Error(`failed: ${failures.join("; ")}`);
};
