// Opening a hosted chart without editing must not write it back (no PATCH, updated_at
// unchanged). Reopens in-app via the Editor link, where customer-info is already cached
// and autosave is live while the chart loads. An edit afterwards must still save.
const NAME = `verify ${Date.now()}`;
const DOC = "Plan\n  Build\n    Review";

export default async ({ page, ff, step, expect }) => {
  await ff.login("pro");
  const patches = [];
  page.on("request", (r) => {
    if (r.url().includes("/rest/v1/user_charts") && r.method() === "PATCH") patches.push(r.postData());
  });

  try {
    step("create a chart and let the typed doc save");
    await page.getByTestId("new-chart-link").click();
    await page.getByLabel("Name Chart").fill(NAME);
    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForURL(/\/u\/\d+$/);
    const id = new URL(page.url()).pathname.split("/").pop();
    await ff.waitForEditor();
    await ff.typeDoc(DOC);
    await expect.poll(() => patches.length, { timeout: 15000 }).toBeGreaterThan(0);
    await page.waitForTimeout(2500);
    const row = async () => (await ff.supabase(`user_charts?id=eq.${id}&select=chart,updated_at`)).body[0];

    for (let i = 1; i <= 2; i++) {
      step(`in-app reopen #${i}: Account, then Editor, touch nothing`);
      await page.getByRole("link", { name: "Account", exact: true }).click();
      await page.waitForTimeout(2000);
      const before = await row();
      const n = patches.length;
      await page.getByRole("link", { name: "Editor" }).click();
      await page.waitForURL(new RegExp(`/u/${id}$`), { waitUntil: "commit" });
      await ff.waitForEditor();
      await page.waitForTimeout(4000);
      const after = await row();
      ff.note({ reopen: i, patches: patches.length - n, before: before.updated_at, after: after.updated_at });
      expect(patches.length - n, "PATCHes sent by merely opening the chart").toBe(0);
      expect(after.updated_at).toBe(before.updated_at);
      expect(after.chart).toBe(before.chart);
    }

    step("an edit after reopening still saves");
    const n = patches.length;
    await ff.typeDoc(`${DOC}\n      Ship`);
    await expect.poll(() => patches.length, { timeout: 15000 }).toBe(n + 1);
    await expect.poll(async () => (await row()).chart).toContain("Ship");
  } finally {
    await ff.supabase(`user_charts?name=like.verify%20*&select=id`, { method: "DELETE" });
  }
};
