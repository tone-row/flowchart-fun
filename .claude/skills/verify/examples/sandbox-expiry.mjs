const KEY = "flowcharts.fun.sandbox";
const DOC = ["James test", "  Step one .color_blue", "    Step two", "  Step three"].join("\n");
const TTL_MS = 6000;

export default async ({ page, ff, step, expect }) => {
  await page.route("**/api/mail", (r) =>
    r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) })
  );
  const storedMeta = async () => JSON.parse((await ff.storage(KEY)).split("=====")[1]);
  const storedText = async () => (await ff.storage(KEY)).split("=====")[0].trim();
  const hoursAhead = (iso) => (new Date(iso) - Date.now()) / 36e5;
  const expectFreshStamp = async () => {
    const { expires } = await storedMeta();
    expect(hoursAhead(expires)).toBeGreaterThan(23);
    expect(hoursAhead(expires)).toBeLessThanOrEqual(24);
    return expires;
  };
  const feedbackAndBack = async (returnLink) => {
    await page.getByTestId("email").fill("james@example.com");
    await page.getByTestId("message").fill("verify sandbox-expiry");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Thank you for your feedback!")).toBeVisible();
    ff.note({ storageAfterSubmit: (await storedText()).includes("James test") ? "user chart" : "CHANGED" });
    await page.getByRole("link", { name: returnLink }).click();
    await expect(page).toHaveURL(/\/$/);
    await ff.waitForEditor();
  };

  step("scenario 1: type a chart, then age its stored stamp to seconds away and reload");
  await ff.open("/");
  await ff.waitForGraph();
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Step three"));
  await expect.poll(storedText).toBe(DOC);
  const stamp = new Date(Date.now() + TTL_MS).toISOString();
  await page.evaluate(
    ([k, s]) => {
      const [text, meta] = localStorage.getItem(k).split("=====");
      const m = JSON.parse(meta);
      m.expires = s;
      localStorage.setItem(k, [text.trimEnd(), "=====", JSON.stringify(m), "====="].join("\n"));
    },
    [KEY, stamp]
  );
  const t0 = Date.now();
  await page.reload();
  await ff.waitForEditor();
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Step three"));
  expect((await ff.editorText()).trimEnd()).toBe(DOC);

  step("edit after the old stamp has passed: the save re-stamps expires to 23-24h ahead");
  await page.waitForTimeout(Math.max(0, TTL_MS - (Date.now() - t0) + 1000));
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Shift+Home");
  await page.keyboard.type("  Step four");
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Step four"));
  await expect.poll(storedText).toContain("Step four");
  const restamped = await expectFreshStamp();
  ff.note({ agedStamp: stamp, restamped });
  await ff.shot("edited-past-old-stamp", ff.canvas());

  step("Feedback (mail stubbed), Back To Editor: the user's chart is still there");
  await page.getByRole("link", { name: "Feedback" }).first().click();
  await expect(page).toHaveURL(/\/o$/);
  await feedbackAndBack("Back To Editor");
  const g1 = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Step four"));
  expect((await ff.editorText())).toContain("James test");
  expect(g1.nodes.map((n) => n.label)).toEqual(
    expect.arrayContaining(["James test", "Step one", "Step two", "Step three", "Step four"])
  );
  await ff.shot("after-return", ff.canvas());

  step("scenario 2: phone viewport, trash -> Clear, type a chart");
  await page.evaluate(() => localStorage.clear());
  await page.setViewportSize({ width: 390, height: 844 });
  await ff.open("/");
  await ff.waitForGraph();
  await page.locator("button.\\!absolute.bottom-1.right-1").click();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect.poll(storedText).toBe("");
  await ff.shot("mobile-cleared");
  await page.locator(".monaco-editor textarea").first().focus();
  for (const [i, line] of DOC.split("\n").entries()) {
    if (i > 0) {
      await page.keyboard.press("Enter");
      await page.keyboard.press("Shift+Home");
    }
    await page.keyboard.type(line);
  }
  await expect.poll(storedText).toBe(DOC);

  step("the cleared-then-typed chart carries a fresh stamp and survives Feedback and back");
  ff.note({ metaAfterClearAndType: await storedMeta() });
  await expectFreshStamp();
  await page.goto("/o");
  await feedbackAndBack("Back To Editor");
  const g2 = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Step three"));
  expect((await ff.editorText()).trimEnd()).toBe(DOC);
  expect(g2.nodes.length).toBe(4);
  await ff.shot("mobile-after-return");
};
