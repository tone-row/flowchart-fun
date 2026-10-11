// Opening a chart never writes its frozen map, even right after an edit elsewhere whose
// render threw. A duplicate #id in chart A leaves the render in its error path; opening
// chart B (a legacy frozen map) afterwards must send no PATCH, leave the row as seeded,
// and never put a different map into the doc store.
const LEGACY = { n1: { x: 0, y: 0 }, n2: { x: -200, y: 150 }, n3: { x: 200, y: 300 } };
const B_TEXT = "Plan\n  Build\n    Review";

// zustand's devtools middleware reports every useDoc action to this hook.
const recordDocActions = () => {
  window.__docActions = [];
  window.__REDUX_DEVTOOLS_EXTENSION__ = {
    connect: ({ name }) => ({
      init() {},
      subscribe() {
        return () => {};
      },
      unsubscribe() {},
      error() {},
      send(action, state) {
        if (name === "useDoc") window.__docActions.push([action.type, state.meta?.nodePositions ?? null]);
      },
    }),
  };
};

const createChart = async (page, ff, name) => {
  await page.getByTestId("new-chart-link").click();
  await page.getByLabel("Name Chart").fill(name);
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForURL(/\/u\/\d+$/);
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.length > 0);
  await page.waitForTimeout(1000);
  return new URL(page.url()).pathname.split("/").pop();
};

export default async ({ page, ff, step, expect }) => {
  await page.addInitScript(recordDocActions);
  const nameB = ff.chartName("B");
  await ff.login("pro");
  const patches = [];
  page.on("request", (r) => {
    if (r.url().includes("/rest/v1/user_charts") && r.method() === "PATCH") patches.push(r.postData());
  });
  step("create chart B and seed a legacy frozen map into it");
  const idB = await createChart(page, ff, nameB);
  await ff.typeDoc(B_TEXT);
  await expect.poll(() => patches.length, { timeout: 15000 }).toBeGreaterThan(0);
  await page.waitForTimeout(2500);
  const seeded = `${B_TEXT}\n\n=====\n${JSON.stringify({ nodePositions: LEGACY })}\n=====`;
  await ff.supabase(`user_charts?id=eq.${idB}`, {
    method: "PATCH",
    body: JSON.stringify({ chart: seeded }),
    headers: { Prefer: "return=minimal" },
  });

  step("create chart A and type an edit whose render throws (duplicate #id)");
  await createChart(page, ff, ff.chartName("A"));
  await ff.typeDoc("X #a\nY #a");
  await page.waitForTimeout(1500);
  await expect(page.getByText("Two nodes have the same ID")).toBeVisible();

  step("Charts, then open B in-app: no write, the row stays as seeded");
  await page.getByRole("link", { name: "Charts", exact: true }).first().click();
  await page.waitForURL(/\/charts$/);
  await page.evaluate(() => (window.__docActions = []));
  const n = patches.length;
  await page.getByRole("link", { name: nameB }).first().click();
  await page.waitForURL(new RegExp(`/u/${idB}$`), { waitUntil: "commit" });
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((x) => x.label === "Review"));
  await page.waitForTimeout(3000);
  const actions = await page.evaluate(() => window.__docActions);
  const foreignMaps = actions.filter(([, map]) => map && JSON.stringify(map) !== JSON.stringify(LEGACY));
  const row = (await ff.supabase(`user_charts?id=eq.${idB}&select=chart`)).body[0].chart;
  ff.note({ actions: actions.map(([type, map]) => [type, JSON.stringify(map)]), patchesOnOpen: patches.length - n, rowStillSeeded: row === seeded });
  await ff.shot("chart-b-opened", ff.canvas());
  expect(foreignMaps, "doc actions carrying a map other than the seeded one").toEqual([]);
  expect(patches.length - n, "PATCHes sent by opening chart B").toBe(0);
  expect(row).toBe(seeded);
};
