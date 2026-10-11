import fs from "fs";

const DOC = "Reading list\n  Fiction\n    Novels\n  Essays\n    Letters";

const meta = async (ff) => JSON.parse((await ff.storage("flowcharts.fun.sandbox")).split("=====")[1]);
const nodeFonts = (page) =>
  page.evaluate(() => [
    ...new Set((window.__cy?.nodes() ?? []).map((n) => n.style("font-family").replace(/["']/g, ""))),
  ]);
const loadedFace = (page, family) =>
  page.evaluate(
    (family) => [...document.fonts].some((f) => f.family.replace(/["']/g, "") === family && f.status === "loaded"),
    family
  );

export default async ({ page, ff, step, expect }) => {
  await ff.open("/");
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => g.nodes.length === 5);

  step("default theme renders labels in the Satoshi sans");
  await expect.poll(() => nodeFonts(page)).toEqual(["Satoshi"]);
  await expect.poll(() => loadedFace(page, "Satoshi")).toBe(true);
  const sansShot = await ff.shot("default-sans", ff.canvas());

  step("Theme tab: open the font picker and pick Literata");
  await page.getByTestId("Editor Tab: Theme").click();
  const fontInput = page.getByLabel("Font Family");
  await fontInput.hover();
  await page.mouse.wheel(0, 400);
  await fontInput.click();
  const literata = page.getByRole("button", { name: "Literata", exact: true });
  await expect(literata).toBeVisible();
  await ff.shot("font-picker-open");
  await literata.hover();
  await literata.click();

  step("labels render in Literata and the font face is loaded");
  await expect.poll(async () => (await meta(ff)).themeEditor?.fontFamily).toBe("Literata");
  await expect.poll(() => nodeFonts(page)).toEqual(["Literata"]);
  await expect.poll(() => loadedFace(page, "Literata"), { timeout: 10000 }).toBe(true);
  expect(await page.evaluate(() => document.fonts.check("16px Literata"))).toBe(true);
  await ff.waitForGraph((g) => g.nodes.length === 5);
  const serifShot = await ff.shot("literata-serif", ff.canvas());
  expect(fs.readFileSync(sansShot).equals(fs.readFileSync(serifShot))).toBe(false);
};
