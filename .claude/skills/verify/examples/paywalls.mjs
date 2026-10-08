// Access gates: what a logged-out visitor and a logged-in free (non-pro) user are stopped from.
export default async ({ page, ff, step, expect }) => {
  step("logged out: /new and /charts ask you to log in");
  for (const p of ["/new", "/charts"]) {
    await page.goto(p);
    await expect(page.getByText("You need to log in to access this page.")).toBeVisible();
  }

  step("logged out: Save in the editor routes to Sign In");
  await ff.open("/");
  await page.getByRole("button", { name: "Log in to Save" }).click();
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/l");

  step("logged out: Load File is a paywall that leads to /pricing");
  await ff.open("/");
  await page.getByTestId("load-file-button").click();
  await ff.shot("load-file-paywall");
  await page.getByRole("button", { name: "Learn More" }).click();
  await page.waitForURL("**/pricing");
  await expect(page.getByRole("heading", { name: "Turn your ideas into professional diagrams in seconds" })).toBeVisible();

  step("free account: Save and Create both open the upgrade paywall");
  await ff.login("basic");
  await ff.open("/");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Create Unlimited Flowcharts" })).toBeVisible();
  await ff.shot("save-paywall");
  await page.getByTestId("close-dialog").click();
  await page.getByRole("link", { name: "New" }).click();
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByRole("heading", { name: "Create Unlimited Flowcharts" })).toBeVisible();
  await page.getByTestId("close-dialog").click();
  // still on /new: nothing was created
  expect(new URL(page.url()).pathname).toBe("/new");
};
