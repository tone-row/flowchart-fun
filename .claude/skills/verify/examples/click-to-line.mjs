// Tapping a node reveals and highlights its defining editor line without taking focus;
// double-clicking focuses the editor with the cursor on that line, scrolled into view.
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

async function nodePoint(page, ff, label) {
  const box = await ff.canvas().boundingBox();
  const p = await page.evaluate((label) => {
    const n = window.__cy.nodes().filter((n) => n.data("label") === label)[0];
    return n && n.renderedPosition();
  }, label);
  if (!p) throw new Error(`no node labelled ${label}`);
  const pt = { x: box.x + p.x, y: box.y + p.y };
  const onCanvas = await page.evaluate(
    ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('[data-flowchart-fun-canvas="true"]'),
    pt
  );
  if (!onCanvas) throw new Error(`${label} is covered or off the canvas at ${JSON.stringify(pt)}`);
  return pt;
}

async function backgroundPoint(page, ff) {
  const box = await ff.canvas().boundingBox();
  const bb = await page.evaluate(() => window.__cy.nodes().renderedBoundingBox());
  return { x: box.x + box.width - 5, y: box.y + Math.min(box.height - 5, bb.y2 + 20) };
}

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
  await page.mouse.click(bg.x, bg.y);
  expect((await editorState(page)).editorFocused).toBe(false);

  step("tap Start: its line scrolls into view and stays highlighted, focus stays on the graph");
  const start = await nodePoint(page, ff, "Start");
  await page.mouse.click(start.x, start.y);
  expect(await page.evaluate(() => window.__cy.$(":selected").map((n) => n.data("label")))).toEqual(["Start"]);
  await page.mouse.move(bg.x, bg.y);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe("Start");
  const tapped = await editorState(page);
  ff.note({ tapped });
  expect(tapped.rendered).toContain("Start");
  expect(tapped.editorFocused, "a single tap must not focus the editor").toBe(false);
  await ff.shot("tap-start", page);

  step("tap the background: the highlight clears");
  await page.mouse.click(bg.x, bg.y);
  await expect.poll(async () => (await editorState(page)).selectedText).toBe(null);

  step("double-click Last node: editor focuses, cursor on its line, line scrolled into view");
  expect((await editorState(page)).rendered).not.toContain("Last node");
  const last = await nodePoint(page, ff, "Last node");
  await page.mouse.dblclick(last.x, last.y);
  await expect.poll(async () => (await editorState(page)).cursorText).toBe("Last node");
  const dbl = await editorState(page);
  ff.note({ dbl });
  expect(dbl.editorFocused).toBe(true);
  expect(dbl.selectedText).toBe("Last node");
  await ff.shot("dblclick-last-node", page);

  step("typing lands on the revealed line");
  await page.keyboard.type("!");
  await expect.poll(async () => (await ff.editorText()).split("\n")[LAST_LINE - 1]).toBe("Last node!");
};
