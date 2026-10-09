const MARGIN = 48;
const MIN_HEIGHT = 300;

export default async ({ page, ff, step, expect }) => {
  await page.addInitScript(() => {
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
  });

  const editor = page.getByLabel("Custom CSS", { exact: true });
  const measure = () =>
    editor.evaluate((el) => {
      let panel = el.parentElement;
      while (!/(auto|scroll)/.test(getComputedStyle(panel).overflowY)) panel = panel.parentElement;
      const p = panel.getBoundingClientRect();
      const top = Math.max(p.top, 0);
      const bottom = Math.min(p.bottom, window.innerHeight);
      const onScreen = (node) => {
        const r = node?.getBoundingClientRect();
        return Boolean(r && r.height > 0 && r.top >= top - 1 && r.bottom <= bottom + 1);
      };
      const css = window.__editors.filter((e) => e.getModel()?.getLanguageId() === "scss").pop();
      const box = el.getBoundingClientRect();
      return {
        panelVisible: Math.round(bottom - top),
        panelScrollTop: Math.round(panel.scrollTop),
        editorH: Math.round(box.height),
        editorW: Math.round(box.width),
        editorFullyVisible: box.top >= top - 1 && box.bottom <= bottom + 1,
        caretOnScreen: onScreen(el.querySelector(".cursors-layer .cursor")),
        matchOnScreen: onScreen(el.querySelector(".currentFindMatch")),
        caretLine: css.getPosition().lineNumber,
        selectionEnd: css.getSelection().endLineNumber,
        lineCount: css.getModel().getLineCount(),
        editorScrollTop: Math.round(css.getScrollTop()),
        editorScrollMax: Math.round(css.getScrollHeight() - css.getLayoutInfo().height),
      };
    });

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
  const fillsPanel = async (label) => {
    await editor.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await expect
      .poll(async () => {
        const m = await measure();
        return m.editorH >= Math.max(MIN_HEIGHT, m.panelVisible - MARGIN);
      })
      .toBe(true);
    const m = await measure();
    ff.note({ [label]: m });
    expect(m.editorH, "editor fits within the visible panel").toBeLessThanOrEqual(Math.max(MIN_HEIGHT, m.panelVisible));
    expect(m.editorFullyVisible, "whole editor on screen after scrolling it into view").toBe(true);
  };
  const caretToFirstLine = async () => {
    await editor.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await editor.click({ position: { x: 20, y: 20 } });
    await page.keyboard.press("Meta+ArrowUp");
    await expect.poll(async () => (await measure()).caretLine).toBe(1);
  };

  await page.setViewportSize({ width: 1366, height: 768 });
  await ff.open("/");
  await page.getByTestId("Editor Tab: Theme").click();
  await editor.locator(".view-line").first().waitFor();
  const { lineCount } = await measure();
  expect(lineCount, "default stylesheet is longer than one screen").toBeGreaterThan(60);

  await check("1366x768: editor fills the Theme panel's visible height", async () => {
    await fillsPanel("desktop");
    await ff.shot("desktop-editor");
  });

  await check("ArrowDown from line 1 to the last line keeps the caret on screen", async () => {
    await caretToFirstLine();
    for (let i = 0; i < lineCount + 20; i++) await page.keyboard.press("ArrowDown");
    await expect.poll(async () => (await measure()).caretLine).toBe(lineCount);
    const m = await measure();
    ff.note({ arrowDown: m });
    await ff.shot("arrowdown-last-line");
    expect(m.caretOnScreen, "caret visible").toBe(true);
  });

  await check("Cmd+F for a string on the last lines shows the match on screen", async () => {
    await caretToFirstLine();
    await page.keyboard.press("Meta+f");
    await page.keyboard.type(":parent.color_grey");
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await measure()).caretLine).toBeGreaterThan(lineCount - 5);
    const m = await measure();
    ff.note({ find: m });
    await ff.shot("find-last-lines");
    await page.keyboard.press("Escape");
    expect(m.matchOnScreen, "current find match visible").toBe(true);
  });

  await check("drag-select past the editor's bottom edge reaches the last line", async () => {
    await caretToFirstLine();
    const box = await editor.boundingBox();
    const visibleLines = await editor.locator(".view-line").count();
    await page.mouse.move(box.x + 20, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, page.viewportSize().height - 1, { steps: 8 });
    await expect.poll(async () => (await measure()).selectionEnd).toBe(lineCount);
    await page.mouse.up();
    ff.note({ dragSelect: { visibleLines, selectionEnd: (await measure()).selectionEnd } });
  });

  await check("wheel scrolls the editor, then hands off to the panel at its bottom", async () => {
    await caretToFirstLine();
    const box = await editor.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const start = await measure();
    await page.mouse.wheel(0, 200);
    await expect.poll(async () => (await measure()).editorScrollTop).toBeGreaterThan(start.editorScrollTop);
    expect((await measure()).panelScrollTop, "panel holds still while the editor scrolls").toBe(start.panelScrollTop);
    for (let i = 0; i < 20 && (await measure()).editorScrollTop < start.editorScrollMax; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(100);
    }
    const atBottom = await measure();
    expect(atBottom.editorScrollTop, "editor reached its bottom").toBe(atBottom.editorScrollMax);
    await page.mouse.wheel(0, 200);
    await expect.poll(async () => (await measure()).panelScrollTop).toBeGreaterThan(atBottom.panelScrollTop);
    ff.note({ wheel: { start, atBottom, after: await measure() } });
  });

  await check("narrowing the pane via the divider narrows the editor", async () => {
    await editor.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const before = await measure();
    const handle = page.locator("[data-dragging] button");
    const hb = await handle.boundingBox();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb.x - 300, hb.y + hb.height / 2, { steps: 10 });
    await page.mouse.up();
    await expect.poll(async () => (await measure()).editorW).toBeLessThan(before.editorW - 200);
    ff.note({ narrowed: { before: before.editorW, after: (await measure()).editorW } });
    await ff.shot("narrowed");
  });

  await check("resizing the window to 390x844 refits the editor to the panel", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await fillsPanel("phone");
    await ff.shot("phone-editor");
  });

  if (failures.length) throw new Error(`failed checks: ${failures.join("; ")}`);
};
