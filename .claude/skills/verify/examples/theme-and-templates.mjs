// Theme editor + Examples dialog: changing a theme control re-lays-out the graph and is
// saved in the doc's metadata; loading a template restyles without touching the text.
const DOC = "Root\n  A\n    A1\n  B\n    B1";

const meta = async (ff) => JSON.parse((await ff.storage("flowcharts.fun.sandbox")).split("=====")[1]);
const pos = (g, label) => g.nodes.find((n) => n.label === label).position;
// Each generation (Root -> A -> A1) sits further along the flow axis.
const flowsAlong = (g, axis) =>
  g.nodes.length === 5 && pos(g, "Root")[axis] < pos(g, "A")[axis] && pos(g, "A")[axis] < pos(g, "A1")[axis];

export default async ({ page, ff, step, expect }) => {
  await ff.open("/");
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => flowsAlong(g, "x")); // default theme flows RIGHT

  step("Theme tab: set Direction to DOWN");
  await page.getByTestId("Editor Tab: Theme").click();
  await page.getByLabel("Direction").selectOption("DOWN");
  await ff.waitForGraph((g) => flowsAlong(g, "y"));
  await ff.shot("direction-down", ff.canvas());
  await expect.poll(async () => (await meta(ff)).themeEditor?.direction).toBe("DOWN");

  step("Theme tab: switch Layout to Circle");
  await page.getByLabel("Layout", { exact: true }).selectOption("circle");
  await expect.poll(async () => (await meta(ff)).themeEditor?.layoutName).toBe("circle");
  await ff.waitForGraph((g) => g.nodes.length === 5);
  await ff.shot("layout-circle", ff.canvas());

  step("Examples: load org-chart layout + styles, keep my content");
  await page.getByTestId("Editor Tab: Document").click();
  await page.getByRole("button", { name: "Examples" }).click();
  await page.getByRole("button", { name: "org-chart" }).click();
  // "Load default content" starts unchecked because the doc is no longer the default text.
  await expect(page.getByLabel("Load default content")).not.toBeChecked();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect.poll(async () => (await meta(ff)).themeEditor?.layoutName).toBe("dagre");
  expect((await ff.editorText()).trimEnd()).toBe(DOC);
  await ff.waitForGraph((g) => flowsAlong(g, "y")); // org-chart is dagre, DOWN
  await ff.shot("org-chart-template", ff.canvas());
};
