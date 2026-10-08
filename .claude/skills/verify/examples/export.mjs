// Export dialog as a free (logged-out) user: PNG download is a real watermarked image,
// SVG is gated, Mermaid code is copied to the clipboard.
import { readFileSync } from "node:fs";

const DOC = "Idea\n  Prototype\n    Launch";

function pngSize(file) {
  const b = readFileSync(file);
  if (b.toString("hex", 0, 8) !== "89504e470d0a1a0a") throw new Error(`${file} is not a PNG`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b.length };
}

export default async ({ page, ff, step, expect }) => {
  await ff.open("/");
  await ff.typeDoc(DOC);
  await ff.waitForGraph((g) => g.nodes.length === 3);

  step("open Export and download PNG");
  await page.getByLabel("Export").first().click();
  const png = await ff.download(() => page.getByLabel("Download PNG").click());
  const size = pngSize(png);
  ff.note({ png: size });
  expect(size.width).toBeGreaterThan(100);
  expect(size.bytes).toBeGreaterThan(2000);

  step("SVG is pro-only for a free user");
  await expect(page.getByLabel("Download SVG")).toBeDisabled();
  await ff.shot("export-dialog");

  step("copy Mermaid code -> clipboard holds a mermaid flowchart of the doc");
  await page.getByRole("tab", { name: "Mermaid" }).click();
  await page.getByLabel("Copy Mermaid Code").click();
  await expect(page.getByTestId("Copied Mermaid Code")).toBeVisible();
  const mermaid = await page.evaluate(() => navigator.clipboard.readText());
  ff.note({ mermaid });
  expect(mermaid).toMatch(/^flowchart/m);
  for (const label of ["Idea", "Prototype", "Launch"]) expect(mermaid).toContain(label);
  await page.getByTestId("close-button").click();
};
