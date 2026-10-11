import { copyFileSync, readFileSync } from "node:fs";
import path from "node:path";

const PAD = 30;
const chain = (n) => Array.from({ length: n }, (_, i) => `${"  ".repeat(i)}Step ${i + 1}`).join("\n");

const CASES = [
  { name: "wide-chain-8", doc: chain(8), n: 8 },
  { name: "single-node", doc: "Hello", n: 1 },
];

async function measure(page, file, type) {
  const mime = type === "png" ? "image/png" : "image/jpeg";
  const dataUrl = `data:${mime};base64,${readFileSync(file).toString("base64")}`;
  return page.evaluate(
    async ({ dataUrl, type, PAD }) => {
      const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
      const draw = (img) => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, c.width, c.height).data;
      };
      const dl = await load(dataUrl);
      const W = dl.naturalWidth, H = dl.naturalHeight;
      const d = draw(dl);
      const bg = [d[(2 * W + W - 2) * 4], d[(2 * W + W - 2) * 4 + 1], d[(2 * W + W - 2) * 4 + 2]];
      const blob = await window.__cy[type]({ full: true, scale: 1.5, output: "blob-promise", bg: `rgb(${bg.join(",")})` });
      const chart = await load(URL.createObjectURL(blob));
      const cw = chart.naturalWidth, ch = chart.naturalHeight;
      // Rebuild the download without a mark, through the same canvas size and encoder,
      // so JPEG block noise cancels and only the mark can differ.
      const rebuilt = document.createElement("canvas");
      rebuilt.width = W; rebuilt.height = H;
      const rctx = rebuilt.getContext("2d");
      rctx.fillStyle = `rgb(${bg.join(",")})`; rctx.fillRect(0, 0, W, H);
      rctx.drawImage(chart, PAD, PAD);
      const c = draw(await load(rebuilt.toDataURL(type === "png" ? "image/png" : "image/jpeg")));
      const tol = type === "jpg" ? 40 : 8;
      const far = (a, i, b, j) => Math.abs(a[i] - b[j]) + Math.abs(a[i + 1] - b[j + 1]) + Math.abs(a[i + 2] - b[j + 2]) > tol;
      let chartPixels = 0, chartPixelsChanged = 0, markPixels = 0;
      let markTop = Infinity, markLeft = Infinity, markBottom = -1, markRight = -1;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const di = (y * W + x) * 4;
          const inContent = x >= PAD && x < PAD + cw && y >= PAD && y < PAD + ch;
          if (inContent) {
            if (far(c, di, bg, 0)) {
              chartPixels++;
              if (far(d, di, c, di)) chartPixelsChanged++;
            }
          } else if (far(d, di, bg, 0)) {
            markPixels++;
            markTop = Math.min(markTop, y); markBottom = Math.max(markBottom, y);
            markLeft = Math.min(markLeft, x); markRight = Math.max(markRight, x);
          }
        }
      }
      return {
        image: { W, H }, chart: { w: cw, h: ch }, contentBottom: PAD + ch,
        chartPixels, chartPixelsChanged, markPixels,
        markBox: { top: markTop, left: markLeft, bottom: markBottom, right: markRight },
      };
    },
    { dataUrl, type, PAD }
  );
}

export default async ({ page, ff, step, expect }) => {
  await ff.open("/");
  for (const c of CASES) {
    await ff.typeDoc(c.doc);
    await ff.waitForGraph((g) => g.nodes.length === c.n);
    for (const type of ["png", "jpg"]) {
      step(`${c.name}: download ${type.toUpperCase()} and count chart pixels the watermark covers`);
      await page.getByLabel("Export").first().click();
      const file = await ff.download(() => page.getByLabel(`Download ${type.toUpperCase()}`).click());
      const kept = path.join(path.dirname(file), `${c.name}.${type}`);
      copyFileSync(file, kept);
      await page.getByTestId("close-button").click();
      const m = await measure(page, kept, type);
      ff.note({ name: c.name, type, file: kept, ...m });
      expect(m.image.W).toBe(m.chart.w + 2 * PAD);
      expect(m.image.H).toBeGreaterThanOrEqual(m.chart.h + 2 * PAD);
      expect(m.chartPixels).toBeGreaterThan(0);
      expect(m.chartPixelsChanged).toBe(0);
      expect(m.markPixels).toBeGreaterThan(0);
      expect(m.markBox.top).toBeGreaterThanOrEqual(m.contentBottom);
      expect(m.markBox.bottom).toBeLessThan(m.image.H);
      expect(m.markBox.left).toBeGreaterThanOrEqual(PAD);
    }
  }
};
