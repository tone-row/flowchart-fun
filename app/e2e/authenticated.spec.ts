import { expect, test } from "@playwright/test";
import { BASE_URL, goToPath, goToTab } from "./utils";

/////////////////////////////////////////////////////////////////////////
// Tests things the user can do when user is logged in but not a pro user
// *and has never been a pro user*
/////////////////////////////////////////////////////////////////////////

const email = process.env.TESTING_EMAIL;
const password = process.env.TESTING_PASS;
if (!email || !password)
  throw new Error("Missing TESTING_EMAIL or TESTING_PASS");

// Log In Before Each Test
test.beforeEach(async ({ page }) => {
  await goToPath(page);
  // Runs before each test and signs in each page.
  await page.getByRole("link", { name: "Log In" }).click();
  // fill in testid "sign-in-email"
  await page.getByTestId("sign-in-email").fill(email);
  // fill in testid "sign-in-password"
  await page.getByTestId("sign-in-password").fill(password);
  // submit by clicking testid sign-in-email-pass
  await page.getByTestId("sign-in-email-pass").click();

  // wait for the word Account to be visible
  await expect(page.getByText("Account")).toBeVisible({ timeout: 10 * 1000 });
});

test("Jump to Pricing from Charts", async ({ page }) => {
  await goToTab(page, "Charts");

  // click test id "to-pricing"
  await page.getByTestId("to-pricing").click();

  // Expect test id pricing-page-title to be visible
  await expect(
    page.locator('[data-testid="pricing-page-title"]')
  ).toBeVisible();
});

// Originally skipped this, failing in CI on Firefox
test("Share Links", async ({ page }) => {
  try {
    await page.goto(`${BASE_URL}/n#FDC8-YG8F8w0Q`);
    const encodedIncludingTheme = `BYUwNmD2AEDukCcwBMBQqC8WuoN6umgCIBjATwBdIBnEgQwAcQBlCssEIgLmIB0A7APQAqYdACakAK7R6-aP0ixZU6lQC2ASwBeIaBVDqQ1aKs38A5tDrQAbnQSa6-CtEgAzaAGFmzAITQAqJiAOogAOS2enTIyCDIspDqRi4mVPrAmiYkkHH6MKBgDNBk0oH8wab8cQhqzgnASvkqakk6eqVSCBkgRgB00MKCAgIiYgAykDHQIAAeFCAI-HRg0O6QqYPD-AACmuoMiK5dYAAUvESC66mCANIOYHR9JNTUFwCUANwjQqLQAKrUPS0V4AWjU7D09kcdAARhw0jBqMAHHoclBatZqm4DIs7CspMYtgIACTXCgAMToWjAZB49yQdG+-BJsLoJAA1hYENJqjwAMTuIXC5msxA1EKaZAGHgABj6AHYAKwMWai2HixZeSAYgWy-UG0WKOIAIXZXJ5Uj50EFwqFori7joUjAFGYKKYPAQIBIFGcFg4zNGf1YkOsEAUuSJ9USLjo5kWJiGAmNelwAkI5PB7R4AEZZarmZmNhRQU6aXToGSS1SK0XoGzOdzechQejEDwSamzU3LdV6xqEDU2zqO1XBzVtRj6+2EF6LLDTrKADTQFdrr4Z6CPWHgHjIOh+0478Cb+T6Oal2AIRg8a+MesLeag9R0Wag2BSmXQA9Hz-S4Az0IBgYmQcwLB4AA2QstyfUt7DATQLH4HgSBAFxFkfS9QRRRDkNQ9CFgQAdNQQD8v2ATsJ0WSUAPrZFGBATtHWdV13UY+tEP4EAcJAJDgAoPM+gAJiVZkAF8fjGaBQw4WM-QTTFkxQkDvRcaB03PBjPWgb1fX9QMtxA2JwJ4FU1S3aiyP-b8xSHGiKKw58EKQlD8gYJzS1w1yCIw4jYOw18EAscxQUrUFoIs884I-G8GB4RRuIkqSQzYOT4gsIllIytMtxsyjx1I2iDHrLNqBzaB8xg88oEgBhQTAvSKE0DY5TiCxOMgOrwVgEAQHi6BhNldrPNBRsLRbUE6vZTQ2DzUbxubK1W1nKjzSW-sAufRa+1bYywMsHgAGZqsILieNWwr7IQKdEEfBxMtLBweVgEddSuydR38rTpAQNDQWepQ3rHOzPunWCHpAJ6EBe8EPSY-QYUsQzz0B17aBWBHcxnLoonBNKEd3bRNEwrcTzAfdDzoY84VPGcvqo0jbu+wgYpc-DZEI0nouw+8Br50qSzLalNFpTtyVrUWyFG7yObQvzRp5P1mta6wpCoJXDxAe7gqhhqsj9fh-vcHl1FBVM81O6BqF+-6wLqI2eJNpJzajOVqsk-hgzEWS9FTJNti4EhMhQBFqAAbXJvwMAuC4AF0NLyijKaPbSQGKwD61AfjBJ-KnTjTgAJPiLAEs9PaDkPkDD8O4IAWQe8xxATzTWcCxv+DClPqfrjvxHLgRK9F6vjAj3vgvMAANFuttLIKQs72Zu9OceF8ngevZQ2rilblQEDxiEOB4ImSe+z2cqDpJDmWxPzxIXGeMPwmQGJ7nCBtrp-vQ5BDnMXPpAoOVOIoIqCgnOjrR6oJv6-xcDwABQCeKgPAQICuQIOC+niLfQgO1JqXWCouXMq58xKlXMJXMCogLbgTMDOcukFynEIZVWUJDBrkMoR-P6PE0Y0PnAQohzDSFsPrFoVsHD-rcLwfQxhxDBEUIgXrCRDM6F8KYSwshcitwiJAZDaGsNJEqJkawjR-AK6qUIlwNBPoFgJF3jg5aPDlGnCGgAFlIaJUhziACclCrIOPwQwhUrjBr6jcd45KKF2TNSiFgtwURGRkFBPtUyTCraQDiY8BJ+ilyrnXLKShaTFgZKmiBEgs1KzylEuEvoqZC4FO9MgZcAg+g5VqXE+IjT+AW0sRgmxW5lqFLoAk6apS5prj6NjPp1QBmZKUf43JOTKH9PiYk0CyTzLhJTFGPo8JzQxLsdUPx9D5kbgHOtXaxSZqjImeeXxWTjl5Ppu9fxok1FKleUqDeqY+iwEyAsPZZzcGzPoS80hbzQUfNOb2SawyynzUsqRQ5i4QWDTBSiiFW47k5IWeEr53I+ryFsQC+xWTGFkMgquAAHMY7BRKDkwquSRa6iLslrmxRioFi57mfK2WQcAUBlCEqhcSjlTjUVDQVEQo6PjaWtnpZWa52CEWYtZSc9lTyjlYtVSYzZcRtlgEJP8oVBysmeIlZVXMQThJeOlUa2VJTYWVUZcOZVuTKFZORR6t53LdWIH9LlG5MrmXItzLmYSq5IIUptRNexcq4U3KVSKrljyxxzM1Q8lBOqQB9AYF0BgclBXRuNSK3MkEgkWvJWiqNG07WXPlU6xYzKk1qpTRqlV6btWdK2fUw1haVoitEuuI6LCh1VvObGx18KmUurZXfRNabvVZu5IMnt1bmXkPXOuohCp200ttRckZdbJ3OrnW2t1J7XVVKagZf1794Zeisdey9LYr3IxvdbO9uln0PtfVUvlmgGBAhiWnHgf6APawzfwPoFAkYBjfcBxGTgf0QezYROgFgNhAY-UwOM6H+BVNALMNDGHd7wYI0RvDyHQAMD9LhzDjEeBUZoxsKpkB9K0ZIx+1jTGKMdr6HUboHH6PWz9GfJpbIYbgDozpcT3owBVLAtSDYvStIfoU+oJTVSohwY-Vpy9jR1AailFJhGCB9OGeQJenOoJTNJHM8Zr0VmbMGcgFKKphxaTsa3PB9zZBcNVJo-Z-QaGn32JfbBwL5ywso09s8dW1nv3hcEzpe+pYovgd4xqCgGhrOTTS4FzL2XIsJei00nIRs6B4zI55lTQmyv0Eq3McjVTSl-XzV5j9oGgRZxLgJZe+UN45T6AeZEmDd7nXxpCSmI2LMQcG8gSAWXRtk2oU-fcC3rHhMGzbRCymzorYJjwbbrnZvIEynx22iCYNtZ+p-LhMMgbweg4h2Dm3TtZpE5Ap716YkfYUfd9GH6vtIY7Vti7ICruIL6kBsH3DHsQ5AX1V7Z3fuliB7BhHb6UcA3+3DITaOOAY6R1msRF1NCtcu896778Yc4-gy1kgBP8fpfPm9qDOi2xk4ZxT77u8sew4-fTxnEOifndu+DynF0eSvGh2L-neP4ckCl9QEXWOmdtiVz99ncudJq8VzQZXJ2zsk-F9esa5p777zgzT2GcOJdm85BbqIKv2dq-Go7zHWvaeA-h27h+IvjdaZl5w7HNudOI8N+99ngfeee9D0J3TEfRfB4WFb2XXu8fh5B6z1XUOY+610Q9wHmeWdG7B9QAAjlIVEQfxHp50hXqv3pnf5-BJX6vefIHa4Rg31E-uweC9T8HrvqFOcle4tn9nA-Nct+H7IUfzOBCg7F2ppTNe7tx50ivzaWfkfs637toLM+68I3333sXwcQC2B5ASrz1vC+1dAFf5jiescX6fzf6Ksf7-Jcf9fs-wfEpB9a8N8EZADm9IFADp9O9j8EoNgF9O1dVfEjsD8kCDtrYdRjsO0vlfFhtQAUCEVVs85pscUtkcD1slt40mVCD5tFsZssDSCEV5spB4Q31UDJsfxpAWCSDECEVIDbEEV8p3YooYsYpqB1AYkyoKoFQ+h1lkMYowArBd5JDdA8xZDeMYpZhVglChZyoVDgkPZM1w5YAZ5zxBC84-wF1w5gATDCBs5S5c5fxqZM4INUxw5qA-obCGxA19g0MT9853CSBR1Jp3BZpUI6l61rJk41wrY2YVgfIGx1skhRp55QpKw1DPYiBUBxJMBsAMAgA`;

    // wait for 2 seconds
    await page.waitForTimeout(2000);

    await page.locator(".view-line").first().click();
    await page
      .getByRole("textbox", {
        name: "Editor content;Press Alt+F1 for Accessibility Options.",
      })
      .type("hello world", { delay: 100 });

    await page.getByRole("button", { name: "Export" }).click();

    // expect the value of input with testid 'Copy Fullscreen'
    expect(
      await page
        .getByTestId("Copy Fullscreen")
        .getAttribute("value")
        .then((value) => value?.trim())
    ).toBe(`${BASE_URL}/f#${encodedIncludingTheme}`);

    // 'Copy Editable'
    expect(
      await page
        .getByTestId("Copy Editable")
        .getAttribute("value")
        .then((value) => value?.trim())
    ).toBe(`${BASE_URL}/n#${encodedIncludingTheme}`);

    // 'Copy Read-only
    expect(
      await page
        .getByTestId("Copy Read-only")
        .getAttribute("value")
        .then((value) => value?.trim())
    ).toBe(`${BASE_URL}/c#${encodedIncludingTheme}`);
  } catch (error) {
    console.log(error);
    // grab screenshot
    await page.screenshot({ path: `test-results/share-links-error.png` });
    throw error;
  }
});

test("Create New Local Chart", async ({ page }) => {
  await goToTab(page, "New");

  await page.getByRole("link", { name: "New" }).click();
  await page.getByPlaceholder("Untitled").click();
  await page.getByPlaceholder("Untitled").press("Meta+a");
  await page.getByPlaceholder("Untitled").fill("My New Chart");
  await page
    .getByRole("radio", {
      name: "Temporary Stored on this computer Deleted when browser data is cleared",
    })
    .click();
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page).toHaveURL(`${BASE_URL}/my-new-chart`);
});

test("Go to Charts Page", async ({ page }) => {
  await goToTab(page, "Charts");
  await page.click('a:has-text("/")');
  await expect(page).toHaveURL(`${BASE_URL}/`);
});

test("Clone a Chart", async ({ page }) => {
  await goToTab(page, "Charts");

  // click element with aria label "Clone"
  await page.getByRole("button", { name: "Copy flowchart: /" }).click();

  await expect(page).toHaveURL(`${BASE_URL}/-1`);

  await expect(page.locator("text=-1")).toBeVisible();
});

test("Delete a chart", async ({ page }) => {
  await goToTab(page, "New");

  await page.getByPlaceholder("Untitled").click();
  await page.getByPlaceholder("Untitled").press("Meta+a");
  await page.getByPlaceholder("Untitled").fill("to delete");

  // click the button with the role "radio" that contains the text "Temporary"
  await page
    .getByRole("radio", {
      name: "Temporary Stored on this computer Deleted when browser data is cleared",
    })
    .click();

  await page.getByRole("button", { name: "Create" }).click();

  await goToTab(page, "Charts");

  await page
    .getByRole("button", { name: "Delete flowchart: /to-delete" })
    .click();
  await page.getByRole("button", { name: "Delete" }).click();

  // expect "delete-me" NOT to be in the document
  await expect(page.locator("text=to-delete")).not.toBeVisible();
});

test("Create new chart from a template", async ({ page, browserName }) => {
  // Firefox has a weird bug, most likely due to the "#" in the URL
  test.skip(browserName === "firefox", "Firefox has a weird bug");

  // Go to url
  await page.goto(
    `${BASE_URL}/n#C4ewBARgpmCWB2ZgAsYBMQGMCuBbK8wAUALxllEDeRYYARAA4CGATgM5Qt0Bc9A5iyYNkAWg4AbKJlBciAX1LkSQA`
  );

  // expect "to be in the document" to be in the document
  await expect(
    page.locator("text=to be in the document").first()
  ).toBeVisible();

  // expect the url to contain "temp" in it
  expect(page.url()).toContain("temp");
});

test("Rename chart", async ({ page }) => {
  // Click [aria-label="Rename"]
  await page.locator('[aria-label="Rename"]').click();
  // Fill input[name="name"]
  await page.locator('input[name="name"]').fill("my new chart");
  // Click button:has-text("Rename")
  await page.locator('button:has-text("Rename")').click();
  await expect(page).toHaveURL(`${BASE_URL}/my-new-chart`);
  // Click text=my-new-chart
  await expect(page.locator("text=my-new-chart")).toBeVisible();
  // Click [aria-label="Rename"]
  await page.locator('[aria-label="Rename"]').click();
  // Press a with modifiers
  await page.locator('input[name="name"]').press("Meta+a");
  // Fill input[name="name"]
  await page.locator('input[name="name"]').fill("cool chart");
  // Click button:has-text("Rename")
  await page.locator('button:has-text("Rename")').click();
  await expect(page).toHaveURL(`${BASE_URL}/cool-chart`);
  // Click text=cool-chart
  await expect(page.locator("text=cool-chart")).toBeVisible();
});
