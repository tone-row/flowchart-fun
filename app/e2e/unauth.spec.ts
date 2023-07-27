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
    `${BASE_URL}/f#CoCwlgzgBAhgDnKB3A9gJwNbQEYE8oAuucYAdgOYBQUUAkqQCYCmpBZ5UAxmkzAU9BikoTBuSbVYpfPwAeBAFxRsTAGbomsLigA2KYd179BUHTBU7JNAMI6wnDFH1QAOqQAyvNMIDKuVjCybgQopl7CALYaUAB02DoArkxx6MxoALSk+sloKAmMPJwEQuQ6TADaSAC8AIwADHUAuuUgVQDsTZIAmnlcQrA6EKFIaPCETPJQZFAARC4AFK4AlDOEoYZ8mv2i4lZQ8yrqPFqcus4bxlpmFkuUlFUPD5QA3pIznLghEJzwTD5EZRmSjmpAA9AAqcFQHoJPrCLJILgJCAhCJgABemgIICYEQEUGR7C0ADcYGgwEICE5VFBrD4fABCVykSFQgDqTAA5MStgxmAxtBE8axoCFCOBoKdmGsoDidIhcL03KyCYwmGgUUIBSAUIixZxkaiMZpFQk0OLcckoODQW43BCoe4UDABRN+N4YDooOoRdbbaQAAJgCJwdBUs06eYuGagn0ECCggDSZLMMU4EAg0aWAG47WDIVAAKoQTTfDPpFG4MpQUnk8xlUWhCAgMmaU56DVSAUobHqmuepLQG1uAAkcYAYjA0TpcEpk2gzLnSCPsDAHORcvkGEoAMSqfcHpcr1LqtlgBjYpR1GJtACscFkR+wJ7Q1jOaF3DS-dSPWWYACE1wwDc8kYXcD0PUdmFUGAEh0AgfBbOAmCUQpigoMol3tAt-irLYdC9P98S1bQAjIdUh39IioGeNwaDjCtjSUeoHyXej9AIdIYOnWcoDHDjJx4tjlCAkCt3Sdt0CUEciMA9dN0YYTnzQNIJPfaTlLSN8O2EySPygNByGweY6gAGigMyLJzOjTHMJgdCUBg+BgeZrns6zhHGeR0hGeAlF8uBhLkTiIkCHzz0vKAnOKeYkAikAPJoOAXQYdglAANlYmzgvSUk7HIUglE4Fh3SCt10hbfLCq4Er1SUl9wovEANJfM8muE5tfmk6DYPgxDfmEuxSCYCqmDAcgQEUKAahiAAmW8lwAXzzB0oFw6tTjI4bO2HQrkp4VgaJszrkNQpgihKTCbOSvk0qge9HxszT1UayLjxU094rK7y8vG6qQkC7Lysqv6itqtBvpCslyDIdJePSTLHs8nKAqULJhqWlacIBTQdnxXa8aOzy4qalqPrQNrsWEhiICY6a6iyzy9BQOB0lStCwH0K9mHIQaUBZiskCYJg4CUWa6h5yH0lXeTQIYdIWbXMAiGYqWZeAhT5b0jTRM1tXdbl9IbtSiglAAZkZmghpG7W+Oe193yC6GmE4slciQNSOzJrTHeOvI0GK9I3d1T2pLtl9tPQJ3DJdoO0HdiskJQwg6wwphhODj3vk9ZOal0s0eQrHGlBUdEwDqmy3IcqLnNcuydES7QvfD8nI4hoGfs9UGatYCvkfK1HkFGQHPIY7iwBnaSJynCfcClkGCrB3v2-77zcmKNgudgBIQnXzZo-ETjUs1UhA9UXIIkyFBmGYy2oCGM1A+P9Cz4vq+b4sxnltIbCoXWzQiKUTcAoTg4AdAMAbBAcoVcGRVGjNGRoRMaAk0itFFyJ0mCUwSsJHE41JqOVrhggAEmNCaBAPLfxAWAiBAgoHBQALLQzIF0RBtFV5Q0MrDXiaD5gMKYaQLoFDgGgInjQjM5Q+GcNIAADVYR3DhMNSDpFkAQmKkjFHSKET-QqzNEBsJoAaNAhdKxlBLkwMufdv54xASgEMcskFIiMSNExydS7lxXjQB+AcRosAYKGMgU08jxnPCNEI6RrYH1jr4-xrAlBBNpswdIYSIluEoSWMoRRRAOPVmJRgod9KGWMjUcy9RbzmVmjUNojdrb5NQkZeYxT6ZlKgBUqpHV-aB0zrUgy9TGmlPKZUxuaJ5ZeM6fHEOttCkNJKXUZprTG7FBjq7cZHtJm9JmXMwZwlhlJOdsshOayikbIGW01JwD9olQUOk86-ABT6JErLcShz5jiwACzlPmuU15ABORu9tulTMqe8lpDQPm-MxoVNcbAeQOJQDyBcMBcBGxSndFiSMaBwvVGYJFzzLJ4sbpihFSLFacGVrxa880IUxCIkQwlohTJuBiHjWl8L6VuCIlc+yNysn3K3FixFCtkqkpVhZGIecbJ8qJQC+peLzJ1EbpK7FyLbqm3ul-PMRE4hmAcNkg2Tz1I9OMrKqySk9V5JJWS1WT0Gq4rlXKxuzz5pzNvM628WjNVIHAPwXVjy8mOpdeUgNLSXV-LNfLC1IrxWeX+f611ga3W6QNVM418qIWao3MLYQ9ycma2lUclpNR0rmQABynOjWGwVStI31XJnmkydqTU2VtRZe1abr7JFwPZPQiJs0VtjeUuobQSlm1Db68NQrLXTRrapZt+LE3N2TQ21NZzSCaviEkH1GtDbPO+UO6aNRgWzR+aOrd4kI28SjTQGNSaZVLodTe4yTr43xvde2mI6ASiaF7WOutT792zXMulYtJ7cnjqrRe6dL1Z2tqbQ++tLbG2kG-pquAZo4DVm-aev1cHC3AoPUW4NCanoVvPVa6NNq4MpvvQu29CHl1IfZW+ngdziM-v9ZZM2zTOMgdzaRqd1ra3QcQwYyjd623MBiBuRFm7QN1sqZZeTJSOg8cNnxy9ygKM0aNWJ2DWn4NzpXTENCl0v3HSTmdC6acqWa2M2nBxGDUJy1s6UdOhmu1gDgCWez5mRAEQ8yWKlBBU4ue811FOFIrOGeQgEcgzh7kOagNF4osXSBUpxLIGAKXQunVlBMTL+g0si2S3FszYWcRwGK6lwzKALpZfiz5mrlWqWanNPVsLLWqWrnjvZbLri3b2SpalKc+gWOeQS0NqIilDM8lM2NnzM3rM6giM+c8vXUJLZWwwazeDOJoA2ygVbbWcvkjIekPbtjNtUtDDOOrpWcvXdwClwLmW1uEEy9Zw2zmMN3eTrmr7rmGOkDTDvM7NyTOvYNLtsHkXAcpAIKiM7n3ochaO64nsCO-vI6urDzaPxC7pfy1mn7RV9B45GgTp7hnSUB2+3NsL7nPMA5oLgshqiXIoOwSuvGMQnLNh5ZXciRc8IEL51trnYhkgMHR-zpmguXGOWl2LwH3Ohh2FG1bOXxd766HPBClXHTQnBdp54g3ccE4JaCxFlzeuJcxEWYfJJRvZs0Ht7HLpFunc2-EDEUZhurdlCScLezpv3c+ctyZwPAOrG29d5xcPadI8ONj2bkOHv-ehOFl75IvuJJgBp378H8WQ8rMTmF6nnAA-x+t+L73yfy+V6d0nvZKes4+frwXmH0fvc56rwH7gKAMzB8fiNUPYXe821yBmLPdvm-j4kpP6A9zk+j5y3P-vU+a-Z9N3P9WhiYVF+Hy30vq+nfSyAnvqPbhufJ53+fguzu3tLKP2niPu-7-T5zzNof3jn-zcz5vmfJ-L-JfZvFfZOBbAAnvIPA-H-MApQfgS-YaGPWfaA7KUAkvC3f-ZXW3HPCAAARwSFbG-zGXNx83wMIJ4Gn2T3IKIJAKfzgPvgINbA-1N3b2IJHwwLbzzwr0QOv2bzYLoIdwYPbxYMPwmxG3YN-zC3EKm2wNr2bxkPV0fyEM4OkIpEmyVy7y30P1ASYGJFyCJzG2L1ILLxxH0IKwALrzMIMKb3oNUJy10PMKqzkO0J-3RgfxzwYPcKoOb3cNsJUJMJy28JXTXQalV0OwE1Unl21zV3E2SH+V5xxCUP+WiMSNEDiJSFrSl3hxlyvTCK12yNuQyISLyHiAfxSIKNKOx2QzfX+T8OzQag5yvHVSBxyggAiAcRpjpjaBiAekC3Kh0A4HuS6MxGYj6MMxylkC9GGI4kYlGJBRaKIkqDkWJnijZ1ilfWYBaBWOZ1IXwRrhik50ByWIgADh2IeSw3lmDEy2Th4VOM4BU3ElUGVhJ3hUgwyCaM-nRS8k4l+kXg03h1sSllCikThiUHGMBxmEoEWnuEeCqCAA`
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
    `${BASE_URL}/f#CoCwlgzgBAhgDnKB3A9gJwNbQEYE8oAuucYAdgOYBQUUAkqQCYCmpBZ5UAxmkzAU9BikoTBuSbVYpfPwAeBAFxRsTAGbomsLigA2KYd179BUHTBU7JNAMI6wnDFH1QAOqQAyvNMIDKuVjCybgQopl7CALYaUAB02DoArkxx6MxoALSk+sloKAmMPJwEQuQ6TADaSAC8AIwADHUAuuUgVQDsTZIAmnlcQrA6EKFIaPCETPJQZFAARC4AFK4AlDOEoYZ8mv2i4lZQ8yrqPFqcus4bxlpmFkuUlFUPD5QA3pIznLghEJzwTD5EZRmSjmpAA9AAqcFQHoJPrCLJILgJCAhCJgABemgIICYEQEUGR7C0ADcYGgwEICE5VFBrD4fABCVykSFQgDqTAA5MStgxmAxtBE8axoCFCOBoKdmGsoDidIhcL03KyCYwmGgUUIBSAUIixZxkaiMZpFQk0OLcckoODQW43BCoe4UDABRN+N4YDooOoRdbbaQAAJgCJwdBUs06eYuGagn0ECCggDSZLMMU4EAg0aWAG47WDIVAAKoQTTfDPpFG4MpQUnk8xlUWhCAgMmaU56DVSAUobHqmuepLQG1uAAkcYAYjA0TpcEpk2gzLnSCPsDAHORcvkGEoAMSqfcHpcr1LqtlgBjYpR1GJtACscFkR+wJ7Q1jOaF3DS-dSPWWYACE1wwDc8kYXcD0PUdmFUGAEh0AgfBbOAmCUQpigoMol3tAt-irLYdC9P98S1bQAjIdUh39IioGeNwaDjCtjSUeoHyXej9AIdIYOnWcoDHDjJx4tjlCAkCt3Sdt0CUEciMA9dN0YYTnzQNIJPfaTlLSN8O2EySPygNByGweY6gAGigMyLJzOjTHMJgdCUBg+BgeZrns6zhHGeR0hGeAlF8uBhLkTiIkCHzz0vKAnOKeYkAikAPJoOAXQYdglAANlYmzgvSUk7HIUglE4Fh3SCt10hbfLCq4Er1SUl9wovEANJfM8muE5tfmk6DYPgxDfmEuxSCYCqmDAcgQEUKAahiAAmW8lwAXzzB0oFw6tTjI4bO2HQrkp4VgaJszrkNQpgihKTCbOSvk0qge9HxszT1UayLjxU094rK7y8vG6qQkC7Lysqv6itqtBvpCslyDIdJePSTLHs8nKAqULJhqWlacIBTQdnxXa8aOzy4qalqPrQNrsWEhiICY6a6iyzy9BQOB0lStCwH0K9mHIQaUBZiskCYJg4CUWa6h5yH0lXeTQIYdIWbXMAiGYqWZeAhT5b0jTRM1tXdbl9IbtSiglAAZkZmghpG7W+Oe193yC6GmE4slciQNSOzJrTHeOvI0GK9I3d1T2pLtl9tPQJ3DJdoO0HdiskJQwg6wwphhODj3vk9ZOal0s0eQrHGlBUdEwDqmy3IcqLnNcuydES7QvfD8nI4hoGfs9UGatYCvkfK1HkFGQHPIY7iwBnaSJynCfcClkGCrB3v2-77zcmKNgudgBIQnXzZo-ETjUs1UhA9UXIIkyFBmGYy2oCGM1A+P9Cz4vq+b4sxnltIbCoXWzQiKUTcAoTg4AdAMAbBAcoVcGRVGjNGRoRMaAk0itFFyJ0mCUwSsJHE41JqOVrhggAEmNCaBAPLfxAWAiBAgoHBQALLQzIF0RBtFV5Q0MrDXiaD5gMKYaQLoFDgGgInjQjM5Q+GcNIAADVYR3DhMNSDpFkAQmKkjFHSKET-QqzNEBsJoAaNAhdKxlBLkwMufdv54xASgEMcskFIiMSNExydS7lxXjQB+AcRosAYKGMgU08jxnPCNEI6RrYH1jr4-xrAlBBNpswdIYSIluEoSWMoRRRAOPVmJRgod9KGWMjUcy9RbzmVmjUNojdrb5NQkZeYxT6ZlKgBUqpHV-aB0zrUgy9TGmlPKZUxuaJ5ZeM6fHEOttCkNJKXUZprTG7FBjq7cZHtJm9JmXMwZwlhlJOdsshOayikbIGW01JwD9olQUOk86-ABT6JErLcShz5jiwACzlPmuU15ABORu9tulTMqe8lpDQPm-MxoVNcbAeQOJQDyBcMBcBGxSndFiSMaBwvVGYJFzzLJ4sbpihFSLFacGVrxa880IUxCIkQwlohTJuBiHjWl8L6VuCIlc+yNysn3K3FixFCtkqkpVhZGIecbJ8qJQC+peLzJ1EbpK7FyLbqm3ul-PMRE4hmAcNkg2Tz1I9OMrKqySk9V5JJWS1WT0Gq4rlXKxuzz5pzNvM628WjNVIHAPwXVjy8mOpdeUgNLSXV-LNfLC1IrxWeX+f611ga3W6QNVM418qIWao3MLYQ9ycma2lUclpNR0rmQABynOjWGwVStI31XJnmkydqTU2VtRZe1abr7JFwPZPQiJs0VtjeUuobQSlm1Db68NQrLXTRrapZt+LE3N2TQ21NZzSCaviEkH1GtDbPO+UO6aNRgWzR+aOrd4kI28SjTQGNSaZVLodTe4yTr43xvde2mI6ASiaF7WOutT792zXMulYtJ7cnjqrRe6dL1Z2tqbQ++tLbG2kG-pquAZo4DVm-aev1cHC3AoPUW4NCanoVvPVa6NNq4MpvvQu29CHl1IfZW+ngdziM-v9ZZM2zTOMgdzaRqd1ra3QcQwYyjd623MBiBuRFm7QN1sqZZeTJSOg8cNnxy9ygKM0aNWJ2DWn4NzpXTENCl0v3HSTmdC6acqWa2M2nBxGDUJy1s6UdOhmu1gDgCWez5mRAEQ8yWKlBBU4ue811FOFIrOGeQgEcgzh7kOagNF4osXSBUpxLIGAKXQunVlBMTL+g0si2S3FszYWcRwGK6lwzKALpZfiz5mrlWqWanNPVsLLWqWrnjvZbLri3b2SpalKc+gWOeQS0NqIilDM8lM2NnzM3rM6giM+c8vXUJLZWwwazeDOJoA2ygVbbWcvkjIekPbtjNtUtDDOOrpWcvXdwClwLmW1uEEy9Zw2zmMN3eTrmr7rmGOkDTDvM7NyTOvYNLtsHkXAcpAIKiM7n3ochaO64nsCO-vI6urDzaPxC7pfy1mn7RV9B45GgTp7hnSUB2+3NsL7nPMA5oLgshqiXIoOwSuvGMQnLNh5ZXciRc8IEL51trnYhkgMHR-zpmguXGOWl2LwH3Ohh2FG1bOXxd766HPBClXHTQnBdp54g3ccE4JaCxFlzeuJcxEWYfJJRvZs0Ht7HLpFunc2-EDEUZhurdlCScLezpv3c+ctyZwPAOrG29d5xcPadI8ONj2bkOHv-ehOFl75IvuJJgBp378H8WQ8rMTmF6nnAA-x+t+L73yfy+V6d0nvZKes4+frwXmH0fvc56rwH7gKAMzB8fiNUPYXe821yBmLPdvm-j4kpP6A9zk+j5y3P-vU+a-Z9N3P9WhiYVF+Hy30vq+nfSyAnvqPbhufJ53+fguzu3tLKP2niPu-7-T5zzNof3jn-zcz5vmfJ-L-JfZvFfZOBbAAnvIPA-H-MApQfgS-YaGPWfaA7KUAkvC3f-ZXW3HPCAAARwSFbG-zGXNx83wMIJ4Gn2T3IKIJAKfzgPvgINbA-1N3b2IJHwwLbzzwr0QOv2bzYLoIdwYPbxYMPwmxG3YN-zC3EKm2wNr2bxkPV0fyEM4OkIpEmyVy7y30P1ASYGJFyCJzG2L1ILLxxH0IKwALrzMIMKb3oNUJy10PMKqzkO0J-3RgfxzwYPcKoOb3cNsJUJMJy28JXTXQalV0OwE1Unl21zV3E2SH+V5xxCUP+WiMSNEDiJSFrSl3hxlyvTCK12yNuQyISLyHiAfxSIKNKOx2QzfX+T8OzQag5yvHVSBxyggAiAcRpjpjaBiAekC3Kh0A4HuS6MxGYj6MMxylkC9GGI4kYlGJBRaKIkqDkWJnijZ1ilfWYBaBWOZ1IXwRrhik50ByWIgADh2IeSw3lmDEy2Th4VOM4BU3ElUGVhJ3hUgwyCaM-nRS8k4l+kXg03h1sSllCikThiUHGMBxmEoEWnuEeCqCAA`
  );
});

test("Open mermaid.live link", async ({ page }) => {
  await openExportDialog(page);

  const page1Promise = page.waitForEvent("popup");
  await page.getByTestId("Mermaid Live").click();
  const page1 = await page1Promise;
  await expect(page1.getByText('["This app works by typing"]')).toBeVisible({
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
  // click button with text "Help"
  await page.locator('button:has-text("Help")').click();

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
  await page.locator("text=This app works by typing").first().click();
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
