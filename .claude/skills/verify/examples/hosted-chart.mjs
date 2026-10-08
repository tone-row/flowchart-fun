// Hosted (cloud) chart, as the pro test account: create -> edit -> the edit lands in Supabase
// and survives a reload -> rename. Every chart named "verify <n>…" is deleted afterwards so
// dev data does not pile up (the pro account already holds 1000+ e2e leftovers).
const NAME = `verify ${Date.now()}`;
const DOC = "Plan\n  Build\n    Review";

export default async ({ page, ff, step, expect }) => {
  step("log in as the pro test account");
  await ff.login("pro");

  try {
    step("New -> name the chart -> Create lands on /u/:id");
    await page.getByTestId("new-chart-link").click();
    await page.getByLabel("Name Chart").fill(NAME);
    await page.getByRole("button", { name: "Create" }).click();
    await page.waitForURL(/\/u\/\d+$/);
    const id = new URL(page.url()).pathname.split("/").pop();
    ff.note({ id, NAME });

    step("edit the text; the debounced save PATCHes user_charts");
    await ff.waitForEditor();
    const saved = page.waitForResponse(
      (r) => r.url().includes("/rest/v1/user_charts") && r.request().method() === "PATCH" && r.ok(),
      { timeout: 20000 }
    );
    await ff.typeDoc(DOC);
    await saved;
    await ff.waitForGraph((g) => g.nodes.length === 3);

    step("side effect: the row in user_charts holds the new text");
    const row = await ff.supabase(`user_charts?id=eq.${id}&select=name,chart`);
    expect(row.status).toBe(200);
    expect(row.body[0].chart.startsWith(DOC)).toBe(true);

    step("reload: text and graph come back from the server");
    await page.reload();
    await ff.waitForEditor();
    await expect.poll(async () => (await ff.editorText()).trimEnd()).toBe(DOC);
    await ff.waitForGraph((g) => g.nodes.map((n) => n.label).join() === "Plan,Build,Review");
    await ff.shot("hosted-after-reload");

    step("rename from the header; the new name is stored");
    await page.getByTestId("rename-button").click();
    await page.getByRole("textbox").fill(`${NAME} renamed`);
    await page.getByRole("button", { name: "Rename" }).click();
    await expect(page.getByTestId("rename-button")).toHaveText(`${NAME} renamed`);
    await expect
      .poll(async () => (await ff.supabase(`user_charts?id=eq.${id}&select=name`)).body[0]?.name)
      .toBe(`${NAME} renamed`);
  } finally {
    step("cleanup: delete every 'verify <n>' chart owned by the test account");
    const del = await ff.supabase(`user_charts?name=like.verify%20*&select=id,name`, { method: "DELETE" });
    ff.note({ deleted: del.body?.map((c) => `${c.id} ${c.name}`) ?? del });
    expect(del.status).toBe(200);
  }
};
