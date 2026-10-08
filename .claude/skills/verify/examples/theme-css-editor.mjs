export default async ({ page, ff, step, expect }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await ff.open("/");

  step("open the Theme tab and bring the Custom CSS editor into view");
  await page.getByTestId("Editor Tab: Theme").click();
  const editor = page.getByLabel("Custom CSS", { exact: true });
  await editor.scrollIntoViewIfNeeded();
  await editor.locator(".view-line").first().waitFor();

  const cssLines = await page.evaluate(
    () => window.monaco.editor.getModels().find((m) => m.getLanguageId() === "scss").getLineCount()
  );
  ff.note({ cssLines });
  expect(cssLines, "default stylesheet is long enough to overflow 300px").toBeGreaterThan(20);

  step("every stylesheet line is rendered");
  await expect.poll(() => editor.locator(".view-line").count()).toBe(cssLines);
  await ff.shot("css-editor-top");

  step("wheel over the editor scrolls the Theme panel");
  const panelScrollTop = () =>
    editor.evaluate((el) => {
      let s = el.parentElement;
      while (s && !/(auto|scroll)/.test(getComputedStyle(s).overflowY)) s = s.parentElement;
      return s.scrollTop;
    });
  const box = await editor.boundingBox();
  const viewport = page.viewportSize();
  const top = Math.max(box.y, 0);
  const bottom = Math.min(box.y + box.height, viewport.height);
  await page.mouse.move(box.x + box.width / 2, (top + bottom) / 2);
  const before = await panelScrollTop();
  expect(before, "panel is scrolled down to reach the editor").toBeGreaterThan(200);
  await page.mouse.wheel(0, -200);
  await expect.poll(panelScrollTop).toBeLessThan(before - 100);
  ff.note({ panelScrollTopBefore: before, panelScrollTopAfter: await panelScrollTop() });
  await ff.shot("panel-scrolled-by-wheel-over-editor");

  step("narrowing the pane shrinks the editor and it still shows every wrapped line");
  const widthBefore = box.width;
  const handle = page.locator("[data-dragging] button");
  const hb = await handle.boundingBox();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x - 300, hb.y + hb.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect.poll(async () => (await editor.boundingBox()).width).toBeLessThan(widthBefore - 200);
  const fitsAllLines = () =>
    editor.evaluate((el) => {
      const lines = el.querySelectorAll(".view-line");
      const lineHeight = lines[0].getBoundingClientRect().height;
      return lines.length === Math.round(el.getBoundingClientRect().height / lineHeight);
    });
  await expect.poll(fitsAllLines).toBe(true);
  const narrowed = await editor.boundingBox();
  ff.note({ widthBefore, widthAfter: narrowed.width, heightBefore: box.height, heightAfter: narrowed.height });
  expect(narrowed.height, "rewrapped stylesheet is taller").toBeGreaterThan(box.height);
};
