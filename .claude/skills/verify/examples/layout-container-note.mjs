// Theme tab: a muted one-line note under the Layout select appears only while a layout that
// cannot draw containers is selected; every layout stays selectable and applies as before.
const DOC = "Start\n  Steps {\n    One\n    Two\n    Three\n    Four\n    Five\n    Six\n  }\n  End\n  Other";
const WITHOUT_CONTAINERS = ["breadthfirst", "concentric", "circle", "radial"];
const LAYOUTS = ["dagre", "klay", "layered", "mrtree", "stress", "radial", "cose", "breadthfirst", "concentric", "circle"];
const NOTE = "This layout doesn't support containers.";

const meta = async (ff) => JSON.parse((await ff.storage("flowcharts.fun.sandbox")).split("=====")[1]);
const color = (locator) => locator.evaluate((el) => getComputedStyle(el).color);

export default async ({ page, ff, step, expect }) => {
  await ff.open("/");
  await ff.pasteDoc(DOC);
  const dismiss = page.getByRole("button", { name: "Dismiss" });
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  const g = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Other"));
  const steps = g.nodes.find((n) => n.label === "Steps");
  expect(g.nodes.filter((n) => n.parent === steps.id)).toHaveLength(6);

  await page.getByTestId("Editor Tab: Theme").click();
  const select = page.getByLabel("Layout", { exact: true });
  const note = page.getByText(NOTE, { exact: true });
  const helper = page.getByText("Choose how nodes are automatically arranged in your flowchart");

  step("every layout is still offered and enabled");
  const options = await select.locator("option").evaluateAll((os) => os.map((o) => [o.value, o.disabled]));
  expect(options).toEqual(LAYOUTS.map((l) => [l, false]));

  for (const layout of LAYOUTS) {
    const unsupported = WITHOUT_CONTAINERS.includes(layout);
    step(`${layout}: note ${unsupported ? "shown" : "absent"}`);
    await select.selectOption(layout);
    await expect.poll(async () => (await meta(ff)).themeEditor?.layoutName).toBe(layout);
    if (unsupported) {
      await expect(note).toBeVisible();
      expect(await color(note)).toBe(await color(helper));
      const s = await select.boundingBox();
      const n = await note.boundingBox();
      expect(n.y).toBeGreaterThan(s.y + s.height);
      expect(n.y - (s.y + s.height)).toBeLessThan(16);
    } else {
      await expect(note).toHaveCount(0);
    }
  }

  for (const mode of ["light", "dark"]) {
    step(`${mode} mode: circle shows the note, dagre does not`);
    await page.evaluate((m) => localStorage.setItem("flowcharts.fun.user.settings", JSON.stringify({ mode: m })), mode);
    await ff.open("/");
    await page.getByTestId("Editor Tab: Theme").click();
    await select.selectOption("circle");
    await expect(note).toBeVisible();
    expect(await color(note)).toBe(await color(helper));
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Other"));
    await page.waitForTimeout(1000);
    await ff.shot(`${mode}-circle`);
    await select.selectOption("dagre");
    await expect(note).toHaveCount(0);
    await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Other"));
    await page.waitForTimeout(1000);
    await ff.shot(`${mode}-dagre`);
  }
};
