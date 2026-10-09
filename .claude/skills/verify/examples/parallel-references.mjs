const DOC = [
  "Start",
  "  Check",
  "    no: (Start)",
  "    yes: Validate",
  "      Error page",
  "      bad input: (Error page)",
  "      timeout: (Error page)",
].join("\n");

const MIN_GAP_PX = 8;

const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export default async ({ page, ff, step, expect }) => {
  step("type a chart with three Validate -> Error page edges and a Check <-> Start pair");
  await ff.open("/");
  await ff.typeDoc(DOC);
  expect(await ff.editorText()).toBe(DOC);
  const g = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Error page"));
  const edges = g.edges.map((e) => `${e.source} -> ${e.target} [${e.label}]`).sort();
  expect(edges).toEqual([
    "Check -> Start [no]",
    "Check -> Validate [yes]",
    "Start -> Check []",
    "Validate -> Error page []",
    "Validate -> Error page [bad input]",
    "Validate -> Error page [timeout]",
  ]);
  await ff.shot("graph", ff.canvas());

  step("read every edge's midpoint from the rendered graph");
  const mids = await page.evaluate(() =>
    window.__cy.edges().map((e) => ({
      source: e.source().data("label"),
      target: e.target().data("label"),
      label: e.data("label") ?? "",
      mid: e.midpoint(),
    }))
  );
  ff.note(mids);

  step("the three parallel Validate -> Error page edges are drawn apart");
  const parallel = mids.filter((e) => e.source === "Validate" && e.target === "Error page");
  expect(parallel).toHaveLength(3);
  for (let i = 0; i < parallel.length; i++) {
    for (let j = i + 1; j < parallel.length; j++) {
      const d = gap(parallel[i].mid, parallel[j].mid);
      expect(d, `${parallel[i].label || "(unlabeled)"} vs ${parallel[j].label} midpoint gap`).toBeGreaterThan(MIN_GAP_PX);
    }
  }

  step("the Start -> Check and Check -> Start edges are drawn apart");
  const forward = mids.find((e) => e.source === "Start" && e.target === "Check");
  const back = mids.find((e) => e.source === "Check" && e.target === "Start");
  expect(gap(forward.mid, back.mid), "Start <-> Check midpoint gap").toBeGreaterThan(MIN_GAP_PX);
};
