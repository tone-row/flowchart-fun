const NOTES = Array.from({ length: 40 }, (_, i) => `// note ${i + 1}`);
const DOC = ["Start", "  Middle", ...NOTES, "Last node", "  End"].join("\n");
const LAST_LINE = NOTES.length + 3;

const editorState = (page) =>
  page.evaluate(() => {
    const lines = [...document.querySelectorAll(".monaco-editor .view-line")];
    const textAtTop = (top) =>
      lines.find((l) => l.style.top === top)?.textContent.replace(/\u00a0/g, " ").trim() ?? null;
    const selected = document.querySelector(".monaco-editor .node-selected");
    const cursor = document.querySelector(".monaco-editor .cursors-layer .cursor");
    return {
      rendered: lines.map((l) => l.textContent.replace(/\u00a0/g, " ").trim()),
      selectedText: selected ? textAtTop(selected.parentElement.style.top) : null,
      cursorText: cursor ? textAtTop(cursor.style.top) : null,
      editorFocused: !!document.activeElement?.closest(".monaco-editor"),
    };
  });

async function canvasPoint(page, ff, what, find) {
  const box = await ff.canvas().boundingBox();
  const p = await page.evaluate(find);
  if (!p) throw new Error(`no ${what}`);
  const pt = { x: box.x + p.x, y: box.y + p.y };
  const onCanvas = await page.evaluate(
    ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-flowchart-fun-canvas="true"]'),
    pt
  );
  if (!onCanvas) throw new Error(`${what} is covered or off the canvas at ${JSON.stringify(pt)}`);
  return pt;
}

const nodePoint = (page, ff, label) =>
  canvasPoint(page, ff, `node ${label}`, `window.__cy.nodes().filter((n) => n.data("label") === ${JSON.stringify(label)})[0]?.renderedPosition()`);

const edgePoint = (page, ff, source, target) =>
  canvasPoint(
    page,
    ff,
    `edge ${source} -> ${target}`,
    `window.__cy.edges().filter((e) => e.source().data("label") === ${JSON.stringify(source)} && e.target().data("label") === ${JSON.stringify(target)})[0]?.renderedMidpoint()`
  );

async function backgroundPoint(page, ff) {
  const box = await ff.canvas().boundingBox();
  const bb = await page.evaluate(() => window.__cy.nodes().renderedBoundingBox());
  return { x: box.x + box.width - 5, y: box.y + Math.min(box.height - 5, bb.y2 + 20) };
}

// Two clicks on the same element within 250ms are a double-click.
const tap = async (page, pt) => {
  await page.waitForTimeout(400);
  await page.mouse.click(pt.x, pt.y);
};

export default async ({ page, ff, step, expect }) => {
  step("type a document longer than the editor pane");
  await ff.open("/");
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Last node"));
  const initial = await editorState(page);
  ff.note({ renderedAfterTyping: initial.rendered.length });
  expect(initial.rendered, "Start begins scrolled out of the editor").not.toContain("Start");

  step("tap the background to leave the editor");
  const bg = await backgroundPoint(page, ff);
  await tap(page, bg);
  expect((await editorState(page)).editorFocused).toBe(false);

  step("tap Start: its line scrolls into view and stays highlighted, focus stays on the graph");
  const start = await nodePoint(page, ff, "Start");
  await tap(page, start);
  expect(await page.evaluate(() => window.__cy.$(":selected").map((n) => n.data("label")))).toEqual(["Start"]);
  await page.mouse.move(bg.x, bg.y);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe("Start");
  const tapped = await editorState(page);
  ff.note({ tapped });
  expect(tapped.rendered).toContain("Start");
  expect(tapped.editorFocused, "a single tap must not focus the editor").toBe(false);
  await ff.shot("tap-start", page);

  step("tap the Start -> Middle edge: the highlight moves to the line that defines it");
  const edge = await edgePoint(page, ff, "Start", "Middle");
  await tap(page, edge);
  await page.mouse.move(bg.x, bg.y);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe("Middle");
  expect((await editorState(page)).editorFocused).toBe(false);

  step("tap the background: the highlight clears");
  await tap(page, bg);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe(null);

  step("tap Start, then Document -> Theme -> Document: the highlight survives the editor remount");
  await tap(page, start);
  await page.mouse.move(bg.x, bg.y);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe("Start");
  await page.getByTestId("Editor Tab: Theme").click();
  await page.getByTestId("Editor Tab: Document").click();
  await ff.waitForEditor();
  await expect
    .poll(async () => (await editorState(page)).selectedText, { message: "highlight after remount" })
    .toBe("Start");
  await ff.shot("after-remount", page);

  step("tap Start again: the highlight stays");
  await tap(page, start);
  await page.mouse.move(bg.x, bg.y);
  await page.waitForTimeout(400);
  expect((await editorState(page)).selectedText, "highlight after re-tapping the same node").toBe("Start");

  step("tap Start then Middle 100ms apart: not a double-click, Middle highlighted, editor unfocused");
  const middle = await nodePoint(page, ff, "Middle");
  await tap(page, start);
  await page.waitForTimeout(100);
  await page.mouse.click(middle.x, middle.y);
  await page.mouse.move(bg.x, bg.y);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe("Middle");
  const quick = await editorState(page);
  ff.note({ quick });
  expect(quick.editorFocused, "two quick taps on different nodes must not focus the editor").toBe(false);

  step("double-click Last node: editor focuses, cursor on its line, line scrolled into view");
  expect((await editorState(page)).rendered).not.toContain("Last node");
  const last = await nodePoint(page, ff, "Last node");
  await page.waitForTimeout(400);
  await page.mouse.dblclick(last.x, last.y);
  await expect.poll(async () => (await editorState(page)).cursorText).toBe("Last node");
  const dbl = await editorState(page);
  ff.note({ dbl });
  expect(dbl.editorFocused).toBe(true);
  expect(dbl.selectedText).toBe("Last node");
  await ff.shot("dblclick-last-node", page);

  step("typing lands on the revealed line and clears the highlight");
  await page.keyboard.type("!");
  await expect.poll(async () => (await ff.editorText()).split("\n")[LAST_LINE - 1]).toBe("Last node!");
  await expect.poll(async () => (await editorState(page)).selectedText).toBe(null);
};
