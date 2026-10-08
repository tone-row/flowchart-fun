// Sandbox editor: typed text becomes a graph, and the chart survives a reload.
const DOC = [
  "Ship it?",
  "  yes: Deploy .color_green",
  "    Celebrate",
  "  no: Fix bugs .color_red",
  "    (Ship it?)",
].join("\n");

export default async ({ page, ff, step, expect }) => {
  step("open the sandbox (fresh browser context = default welcome chart)");
  await ff.open("/");
  const before = await ff.waitForGraph();
  ff.note({ defaultNodeCount: before.nodes.length });

  step("type a new document into the editor");
  await ff.typeDoc(DOC);
  expect(await ff.editorText()).toBe(DOC);

  step("graph re-renders with the typed nodes, edges, labels and classes");
  const g = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Fix bugs"));
  const labels = g.nodes.map((n) => n.label).sort();
  expect(labels).toEqual(["Celebrate", "Deploy", "Fix bugs", "Ship it?"]);
  const edges = g.edges.map((e) => `${e.source} -> ${e.target} [${e.label}]`).sort();
  expect(edges).toEqual([
    "Deploy -> Celebrate []",
    "Fix bugs -> Ship it? []",
    "Ship it? -> Deploy [yes]",
    "Ship it? -> Fix bugs [no]",
  ]);
  expect(g.nodes.find((n) => n.label === "Deploy").classes).toContain("color_green");
  ff.note({ edges });
  await ff.shot("typed-graph", ff.canvas());

  step("side effect: the sandbox is persisted to localStorage, with a 24h expiry in its metadata");
  await expect.poll(async () => (await ff.storage("flowcharts.fun.sandbox"))?.startsWith?.(DOC)).toBe(true);
  const stored = await ff.storage("flowcharts.fun.sandbox");
  const meta = JSON.parse(stored.split("=====")[1]);
  const hoursLeft = (new Date(meta.expires) - Date.now()) / 36e5;
  expect(hoursLeft).toBeGreaterThan(23);
  expect(hoursLeft).toBeLessThanOrEqual(24);

  step("reload: the same chart comes back");
  await page.reload();
  await ff.waitForEditor();
  // The doc round-trips through docToString on load, which appends one trailing newline.
  expect((await ff.editorText()).trimEnd()).toBe(DOC);
  const after = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Fix bugs"));
  expect(after.nodes.length).toBe(4);
  await ff.shot("after-reload", ff.canvas());
};
