import { expect, test } from "@playwright/test";

import { openExportDialog } from "./openExportDialog";
import { BASE_URL, goToPath, goToTab } from "./utils";

/*
Run single test file
pnpm playwright test e2e/unauth.spec.ts --headed --project=chromium
*/

// Run in parallel
test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page }) => {
  await goToPath(page);
});

test("Download PNG", async ({ page }) => {
  await openExportDialog(page);
  // Click [aria-label="Download PNG"]
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('[aria-label="Download PNG"]').click(),
  ]);

  expect(download.suggestedFilename()).toBe("flowchart-fun.png");
});

test("Download JPG", async ({ page }) => {
  await openExportDialog(page);
  // Click [aria-label="Download JPG"]
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('[aria-label="Download JPG"]').click(),
  ]);

  expect(download.suggestedFilename()).toBe("flowchart-fun.jpg");
});

test("Copy Fullscreen Link", async ({ page }) => {
  await openExportDialog(page);

  // Expect input to have the correct value
  await expect(
    page.locator('text=FullscreenCopy >> input[type="text"]')
  ).toHaveValue(
    `${BASE_URL}/f#EIUw5glgdgBAKgTwA7TAKBjAwgeygZwgBMQAnALhgEEijUYBDGAGQYCMQAbDTGATRD5KAeSQAXCHmo9eMAKr4QjWAEkAIjDE5seKCADGYmAGJ9ug2JkwAcjhHjJsYFcwAKU+cMBKF71sB3GDIGRU0ACyUxEAAPIwYoIk1SBBgIIwQcAFdSRU4AMwBCNDQAXjKytABvHgAifQQtfH0GJBAAZTEEThAayhqAAQgAWyQcUiNszlcAHRqwsTEkIQB6Zby8MXwAOjAcHDBulohtsyHl-Xx8ACYAfjyGIYhOBBKVYABZAGoABW7oz7a8SE-jA836ABYAAyQgDcAFZoQAyOj4JCcBgvfD+FqzLww6ZQAkAEjYDH0AGswKQsglKP4wmkQPioESzJwxpRjABmACMULhbGZRPWUDEADEHk8EJRZm93jBfjEYICCLMADQwfBAgC0ilIEDyQtIICInJAADYuQBOcHmoVjeJgECcvLghhXc08oUILjs-wunn3LmC4lUkAgKCcq4MK1EAAchuJbE4mWdJnNkPNIDyduJSGyaLTxnNRDdAHZ9EKw9KTHkriaTcyCSanTBKgTMP5iGIwpQeUhoszMPpsgA3EC6zrdSgcABeEDIQ80DFITrE2pX1P8urCLTTYn1ju6S840AnbI5MGTZPJS-wWVI+gnm5w24vFCv6IpS7EK7XG9ILdtXfGcv1vDsYHRDhOEoIgGF-VwoK4PEIKiWJtVJCkqRpIhgJwdkPxJG9sMyBIfxiddMMpalSNwnAkDJNIay9VCKIw4iaISbUGNoVBKDhJcRXXe5HmeShhQ2CVRIQQSNl1CBZzTPlmQAXwJAlyH0BlOCIbpLgAbXwXdWgAdW7MIAF02wgrsiB7WD4IYVwjL3My7LCFCoDUwlIy0p5dMEfBDOMkAAAkQAgUExCs9tYBgCJIvmByEJc1pwsSsRPO8jS-J0vSgrQsR3j-aA+Bi1j0KGEqoG1Gs4IQwritXUqsvU3ztICgzGuqgANcq4sK7UquamromSpzupGnrWp8zSOvy6y4qQmCYHqpzls8zAhO1ESpXEoSpKlcj0P8UgWjpM6kGO9cquibVbPsmAeQRJcHt7GArmhJcEqivsvog7bCEUvtcwGtjRwYU8wEjGAn1FRcKvXXcoZhuGolIE8z21H6kqerZwTvELKGNQwjyZCCqJIriQJgIlqyXGnWXwsYlzYMYSFIPCCPE99WfZsh7vMygrj50gOcnLo03vU8iFk0V7oi36YARWECWyqBlgAKk15Vf3GGBNeWHL5sC-ToAAfRIMMlAAHieiz9KyMRLfAY0lAAPhgSF+swNmxYFt7KFVuLUrTTiiBJ38oAOcm4sp8OucvOm3agBnmY-elGVUtqtZ1uAyEeKBIYNo32v8-LHcyZ2rbdmA7Z5B2LZr8MYE973Ft9-nOcDr3Cb3YmcMjsnWY4nDE8I41ZYgmnM6ibOfNzmBgDOqA-OjkvjfL02m9dlu28bqAXetuuPodp2j9rz2G47zUidWiAHjwKe49H2jx-E5NUzT7mYFn2PMBxmIYW-045d0Fu5IO10hrVVqsLeeBJF7vDIJAde2tS5zS3gZHex8r5nyrhfPeXs8HV13rbU+i11YYLyoFLY75zaTxvvHMejNJ7f0vH-eeVDOonHTubB00clCxV9q-am6dxL8KdGwjODI55q03tQy4tDeE+k4H6RhIjcKMxUX6ThuVuFKIIuba2sAhFXg0e-WmxipF0hkbHbyXD8oGLGObT+giKbmMZq46xv9bG6JNoouh+ZSCFnUVhBOjMgmFm8RwuRZcFE8MMdWUJ1FmFiMscaGSsT5H6NDvQiwZMb6h2Jvk6Ox5YkOJobk8OQ9SluJDnfapJSY5+MwdsXJvoIBLDqZgIpQRVGdMUC0+JWxckHgfrUwpd8xnD3KXoxxuTWiigYLsExEFemLN-CsoZOSQrmwiNEZZUhTG9P2Yc1Osz-FtN2REcQZzJn93iiAW5WyLmtJGbsnApMVn3NaJQT5my8DbPmbs-AesflSz1kCypuzSSAS4OCmcm4uBQsUbkugj8EgIvvhi5+9i5nQr3Obcc3Tb4POJSiq5hLSBhBwEMNmxAsXUtpfS3F2TgVUoytqJldKcAMuOQ0zl3KWUUveYSzZWLNkiqqWPGpMdGUyqaWUrybKCWtHNiOdcsruhYo1VyxVdiVWophTgBYtKuUKtJhM-lDy2amqGOat+WqDVxJ2YSswq8GDjmxjEO51rfmwzwM0L1pyXnKpdY4v2HNzZQDwCSyNAcha9wpmA0FktKDS2ICK+NpBzYZsSKY7N4DHoi2Tf7Tmqbpyanwpm15wzs2WxCBEfNpbxY9xLaAstEtK1wSMo2Wt+j61EBNVEZtHbW2JvbZ3TtFa0xDoWH2sNhqgr+B9r-RNa1XD+Bmku-Slkb6APGq4Dy8C9BECdFsU8ehc3VtHZgS9E4Z3ppvfPFsIAL1nktsOk0N971dtnV+1lp7z33obb229kEsaPtWo2hd3lX1bD1v+F8-hzbTKtahP8IB1zIZ3A8tDzTYnwcQ1hgCW5UOHlqdqKIJLiPYcAq+XD-r8PdCo+GF9Z6320dI6+dVEBHwseYzRzDdGgK9P0Hx-QAmKMEbDUR4T3GUOCeAtSS4N8uM4d6Up-QKn8DsfPep+jinpMsaoiOUg441PyY01M4zE5TNjmdXJ1cJHkNEpbqYgzom77ksIxxhDVnDOofcxh5zImGOabY75-TAWyP4AAI6ZBXEJ0LCnGNSwS0lvTnGYs8fE-x5LSHDNpcoHlyTjm-OeZ4+ioYT9LMpesw86rT8sv+fq4FrSIBRzUlWQNHL24xMRC64CqL2W2tkZjXoOrhWvMPIm+V8995shPgU+R8ZcrjkPmWw1pjtmWuLcfM+QLSnqOFM24dmbO21sCci7Jvz+2tvtYk1Jq7JL7vnfC3fUrz2Zm3YW2dlbWmdOnaW+9-rNmXvKZwJcPb-3XNKfs+Z17sOiuads+xCkZnxww5Byt4lwODupd6T537b63sA+CyHZHF39w3bg3dqnPH4uJeNPjh71P00ZeNNjgnrmvtI5x9ttMfPuds6qw-GrmKNsC5R3fJrZERsjIZyhjrQ2es9KV8V2Gg3usi9B9G2NrPQea7mye8gDFjSihvjxOg0c-qi3FlBvN9uE0QI+s7zmjNebuLCakn+REfe0SgRDFGlAtBXQBnJXaYlaYHUlM8E87AuCHo2t4pmBE5briBkpK0Ww4QDigcNFBsCYDagElkyM5uIxiCcTmv+ySqaaLSTEsNZukuihr0YjJ9fwlpOTiATJYaahoBUqUcoJQgA`
  );

  await page.locator('[aria-label="Copy Fullscreen"]').click();
  // await expect(page.locator('[data-testid="Copied Fullscreen"]')).toBeVisible();
});

test("Copy With-Editor Link", async ({ page }) => {
  await openExportDialog(page);

  // Expect input to have the correct value
  await expect(
    page.locator('text=FullscreenCopy >> input[type="text"]')
  ).toHaveValue(
    `${BASE_URL}/f#EIUw5glgdgBAKgTwA7TAKBjAwgeygZwgBMQAnALhgEEijUYBDGAGQYCMQAbDTGATRD5KAeSQAXCHmo9eMAKr4QjWAEkAIjDE5seKCADGYmAGJ9ug2JkwAcjhHjJsYFcwAKU+cMBKF71sB3GDIGRU0ACyUxEAAPIwYoIk1SBBgIIwQcAFdSRU4AMwBCNDQAXjKytABvHgAifQQtfH0GJBAAZTEEThAayhqAAQgAWyQcUiNszlcAHRqwsTEkIQB6Zby8MXwAOjAcHDBulohtsyHl-Xx8ACYAfjyGIYhOBBKVYABZAGoABW7oz7a8SE-jA836ABYAAyQgDcAFZoQAyOj4JCcBgvfD+FqzLww6ZQAkAEjYDH0AGswKQsglKP4wmkQPioESzJwxpRjABmACMULhbGZRPWUDEADEHk8EJRZm93jBfjEYICCLMADQwfBAgC0ilIEDyQtIICInJAADYuQBOcHmoVjeJgECcvLghhXc08oUILjs-wunn3LmC4lUkAgKCcq4MK1EAAchuJbE4mWdJnNkPNIDyduJSGyaLTxnNRDdAHZ9EKw9KTHkriaTcyCSanTBKgTMP5iGIwpQeUhoszMPpsgA3EC6zrdSgcABeEDIQ80DFITrE2pX1P8urCLTTYn1ju6S840AnbI5MGTZPJS-wWVI+gnm5w24vFCv6IpS7EK7XG9ILdtXfGcv1vDsYHRDhOEoIgGF-VwoK4PEIKiWJtVJCkqRpIhgJwdkPxJG9sMyBIfxiddMMpalSNwnAkDJNIay9VCKIw4iaISbUGNoVBKDhJcRXXe5HmeShhQ2CVRIQQSNl1CBZzTPlmQAXwJAlyH0BlOCIbpLgAbXwXdWgAdW7MIAF02wgrsiB7WD4IYVwjL3My7LCFCoDUwlIy0p5dMEfBDOMkAAAkQAgUExCs9tYBgCJIvmByEJc1pwsSsRPO8jS-J0vSgrQsR3j-aA+Bi1j0KGEqoG1Gs4IQwritXUqsvU3ztICgzGuqgANcq4sK7UquamromSpzupGnrWp8zSOvy6y4qQmCYHqpzls8zAhO1ESpXEoSpKlcj0P8UgWjpM6kGO9cquibVbPsmAeQRJcHt7GArmhJcEqivsvog7bCEUvtcwGtjRwYU8wEjGAn1FRcKvXXcoZhuGolIE8z21H6kqerZwTvELKGNQwjyZCCqJIriQJgIlqyXGnWXwsYlzYMYSFIPCCPE99WfZsh7vMygrj50gOcnLo03vU8iFk0V7oi36YARWECWyqBlgAKk15Vf3GGBNeWHL5sC-ToAAfRIMMlAAHieiz9KyMRLfAY0lAAPhgSF+swNmxYFt7KFVuLUrTTiiBJ38oAOcm4sp8OucvOm3agBnmY-elGVUtqtZ1uAyEeKBIYNo32v8-LHcyZ2rbdmA7Z5B2LZr8MYE973Ft9-nOcDr3Cb3YmcMjsnWY4nDE8I41ZYgmnM6ibOfNzmBgDOqA-OjkvjfL02m9dlu28bqAXetuuPodp2j9rz2G47zUidWiAHjwKe49H2jx-E5NUzT7mYFn2PMBxmIYW-045d0Fu5IO10hrVVqsLeeBJF7vDIJAde2tS5zS3gZHex8r5nyrhfPeXs8HV13rbU+i11YYLyoFLY75zaTxvvHMejNJ7f0vH-eeVDOonHTubB00clCxV9q-am6dxL8KdGwjODI55q03tQy4tDeE+k4H6RhIjcKMxUX6ThuVuFKIIuba2sAhFXg0e-WmxipF0hkbHbyXD8oGLGObT+giKbmMZq46xv9bG6JNoouh+ZSCFnUVhBOjMgmFm8RwuRZcFE8MMdWUJ1FmFiMscaGSsT5H6NDvQiwZMb6h2Jvk6Ox5YkOJobk8OQ9SluJDnfapJSY5+MwdsXJvoIBLDqZgIpQRVGdMUC0+JWxckHgfrUwpd8xnD3KXoxxuTWiigYLsExEFemLN-CsoZOSQrmwiNEZZUhTG9P2Yc1Osz-FtN2REcQZzJn93iiAW5WyLmtJGbsnApMVn3NaJQT5my8DbPmbs-AesflSz1kCypuzSSAS4OCmcm4uBQsUbkugj8EgIvvhi5+9i5nQr3Obcc3Tb4POJSiq5hLSBhBwEMNmxAsXUtpfS3F2TgVUoytqJldKcAMuOQ0zl3KWUUveYSzZWLNkiqqWPGpMdGUyqaWUrybKCWtHNiOdcsruhYo1VyxVdiVWophTgBYtKuUKtJhM-lDy2amqGOat+WqDVxJ2YSswq8GDjmxjEO51rfmwzwM0L1pyXnKpdY4v2HNzZQDwCSyNAcha9wpmA0FktKDS2ICK+NpBzYZsSKY7N4DHoi2Tf7Tmqbpyanwpm15wzs2WxCBEfNpbxY9xLaAstEtK1wSMo2Wt+j61EBNVEZtHbW2JvbZ3TtFa0xDoWH2sNhqgr+B9r-RNa1XD+Bmku-Slkb6APGq4Dy8C9BECdFsU8ehc3VtHZgS9E4Z3ppvfPFsIAL1nktsOk0N971dtnV+1lp7z33obb229kEsaPtWo2hd3lX1bD1v+F8-hzbTKtahP8IB1zIZ3A8tDzTYnwcQ1hgCW5UOHlqdqKIJLiPYcAq+XD-r8PdCo+GF9Z6320dI6+dVEBHwseYzRzDdGgK9P0Hx-QAmKMEbDUR4T3GUOCeAtSS4N8uM4d6Up-QKn8DsfPep+jinpMsaoiOUg441PyY01M4zE5TNjmdXJ1cJHkNEpbqYgzom77ksIxxhDVnDOofcxh5zImGOabY75-TAWyP4AAI6ZBXEJ0LCnGNSwS0lvTnGYs8fE-x5LSHDNpcoHlyTjm-OeZ4+ioYT9LMpesw86rT8sv+fq4FrSIBRzUlWQNHL24xMRC64CqL2W2tkZjXoOrhWvMPIm+V8995shPgU+R8ZcrjkPmWw1pjtmWuLcfM+QLSnqOFM24dmbO21sCci7Jvz+2tvtYk1Jq7JL7vnfC3fUrz2Zm3YW2dlbWmdOnaW+9-rNmXvKZwJcPb-3XNKfs+Z17sOiuads+xCkZnxww5Byt4lwODupd6T537b63sA+CyHZHF39w3bg3dqnPH4uJeNPjh71P00ZeNNjgnrmvtI5x9ttMfPuds6qw-GrmKNsC5R3fJrZERsjIZyhjrQ2es9KV8V2Gg3usi9B9G2NrPQea7mye8gDFjSihvjxOg0c-qi3FlBvN9uE0QI+s7zmjNebuLCakn+REfe0SgRDFGlAtBXQBnJXaYlaYHUlM8E87AuCHo2t4pmBE5briBkpK0Ww4QDigcNFBsCYDagElkyM5uIxiCcTmv+ySqaaLSTEsNZukuihr0YjJ9fwlpOTiATJYaahoBUqUcoJQgA`
  );
});

test("Open mermaid.live link", async ({ page }) => {
  await openExportDialog(page);

  const page1Promise = page.waitForEvent("popup");
  await page.getByTestId("Mermaid Live").click();
  const page1 = await page1Promise;
  await expect(page1.getByText('["Begin Typing"]')).toBeVisible({
    timeout: 15 * 1000,
  });
});

test("Change Language", async ({ page }) => {
  await goToTab(page, "Settings");
  // Click [aria-label="Select Language\: Deutsch"]
  await page.locator('[aria-label="Select Language\\: Deutsch"]').click();

  // Expect to find a button with the text "Einstellungen"
  await expect(
    page.getByRole("heading", { name: "Einstellungen" })
  ).toBeVisible();
});

test("Change Appearance", async ({ page }) => {
  await goToTab(page, "Settings");
  await page.locator('[aria-label="Dark Mode"]').click();
  // get value of css custom property --color-background
  const [background, foreground] = await page.evaluate(() => {
    return [
      getComputedStyle(document.body).getPropertyValue("--color-background"),
      getComputedStyle(document.body).getPropertyValue("--color-foreground"),
    ];
  });
  expect(background.trim()).toBe("#0f0f0f");
  expect(foreground.trim()).toBe("rgb(250, 250, 250)");
});

test("Submit Feedback", async ({ page }) => {
  // click button with text "Feedback"
  await page.locator('a:has-text("Feedback")').first().click();

  // Click [data-testid="message"]
  await page.locator('[data-testid="message"]').click();

  // Fill [data-testid="message"]
  await page.locator('[data-testid="message"]').fill("This is a test");

  // Click [data-testid="email"]
  await page.locator('[data-testid="email"]').click();
  // Fill [data-testid="email"]
  await page.locator('[data-testid="email"]').fill("test@test.com");

  await page.locator('button:has-text("Submit")').click();
  // Click text=Thank you for your feedback!
  await expect(page.locator("text=Thank you for your feedback!")).toBeVisible();
});

test("Manipulate Editor Code", async ({ page }) => {
  // Type in editor

  // Click text=This app works by typing >> nth=0
  await page.locator("text=Begin Typing").first().click();
  // Press a with modifiers
  await page
    .locator(
      '[aria-label="Editor content\\;Press Alt\\+F1 for Accessibility Options\\."]'
    )
    .press("Meta+a");
  await page
    .locator(
      '[aria-label="Editor content\\;Press Alt\\+F1 for Accessibility Options\\."]'
    )
    .type("hello world");

  await expect(
    page.locator('div[role="code"] >> text=hello world')
  ).toBeVisible();

  // Resize Editor/Graph

  await page.getByTestId("Editor Tab: Layout").click();

  // Contract Graph

  // Expand Graph

  // Change Graph Options Layout Direction
  await page
    .locator('button[role="combobox"]:has-text("Top to Bottom")')
    .click();
  await page.locator('div[role="option"]:has-text("Left to Right")').click();

  // Change Graph Options Layout
  await page.locator('button[role="combobox"]:has-text("Dagre")').click();
  await page.locator('div[role="option"]:has-text("Klay")').click();

  // Right Click on Graph & Download PNG
  await page
    .locator("#cy canvas")
    .first()
    .click({
      button: "right",
      position: {
        x: 440,
        y: 74,
      },
    });
  // Click text=Download PNG
  const [png] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("text=Download PNG").click(),
  ]);

  expect(png.suggestedFilename()).toBe("flowchart-fun.png");

  // Right Click on Graph & Download JPG
  await page
    .locator("#cy canvas")
    .first()
    .click({
      button: "right",
      position: {
        x: 267,
        y: 297,
      },
    });
  // Click text=Download JPG
  const [jpg] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("text=Download JPG").click(),
  ]);

  expect(jpg.suggestedFilename()).toBe("flowchart-fun.jpg");
});

test("Export to Visio CSV", async ({ page }) => {
  await openExportDialog(page);
  await page.getByRole("tab", { name: "Visio" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("Visio Flowchart").click(),
  ]);
  expect(download.suggestedFilename()).toBe("flowchart-fun-visio-flow.csv");
  const [download1] = await Promise.all([
    page.waitForEvent("download"),
    page.getByTestId("Visio Org Chart").click(),
  ]);
  expect(download1.suggestedFilename()).toBe("flowchart-fun-visio-org.csv");
});

test("Can follow Import Data to pricing page", async ({ page }) => {
  await page.getByRole("button", { name: "Import Data" }).click();

  // Click on getByRole('button', { name: 'Learn More' })
  await page.getByRole("button", { name: "Learn More" }).click();

  // expect to be on /pricing page
  expect(new URL(page.url()).pathname).toBe("/pricing");
});
