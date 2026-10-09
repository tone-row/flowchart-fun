// A frozen renderer also wedges the harness teardown, so on failure the browser is closed first.
const RESPONSIVE_MS = 2000;

const withDeadline = (promise, what) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`page unresponsive for ${RESPONSIVE_MS}ms after ${what}`)), RESPONSIVE_MS)
    ),
  ]);

export default async (ctx) => {
  try {
    await drive(ctx);
  } catch (err) {
    await ctx.page.context().browser().close().catch(() => {});
    throw err;
  }
};

async function drive({ page, ff, step, expect }) {
  await page.setViewportSize({ width: 1366, height: 768 });
  await ff.open("/");
  await ff.typeDoc("Start .shape_diamond\n  End");
  const before = await ff.waitForGraph((g) => g.nodes.length === 2);
  expect(await shapeOf(page, "Start")).toBe("diamond");

  step("Theme tab, caret at the end of the Custom CSS");
  await page.getByTestId("Editor Tab: Theme").click();
  const editor = page.getByLabel("Custom CSS", { exact: true });
  await editor.locator(".view-line").first().waitFor();
  await editor.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await editor.click({ position: { x: 20, y: 20 } });
  await page.keyboard.press("Meta+ArrowDown");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");

  step("type an unclosed comment one key at a time; the page answers within 2s after each key");
  for (const ch of "/* node") {
    const t0 = Date.now();
    await withDeadline(page.keyboard.type(ch), `typing ${JSON.stringify(ch)}`);
    await withDeadline(page.evaluate(() => 1), `typing ${JSON.stringify(ch)}`);
    ff.note({ typed: ch, ms: Date.now() - t0 });
  }

  step("the chart still renders and the .shape_diamond utility class still applies with the comment unclosed");
  await page.waitForTimeout(500);
  const after = await withDeadline(ff.waitForGraph(), "the typed comment");
  expect(after.nodes.length).toBe(before.nodes.length);
  expect(await shapeOf(page, "Start")).toBe("diamond");
  await ff.shot("unclosed-comment", ff.canvas());

  step("closing the comment keeps the page responsive too");
  await withDeadline(page.keyboard.type(" */"), "closing the comment");
  await withDeadline(page.evaluate(() => 1), "closing the comment");
  const closed = await withDeadline(ff.waitForGraph(), "the closed comment");
  expect(closed.nodes.length).toBe(before.nodes.length);
  expect(await shapeOf(page, "Start")).toBe("diamond");
}

function shapeOf(page, label) {
  return page.evaluate(
    (label) => window.__cy.nodes().filter((n) => n.data("label") === label)[0]?.style("shape"),
    label
  );
}
