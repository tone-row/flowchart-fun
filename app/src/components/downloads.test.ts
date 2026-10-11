import { exportLayout, Rect } from "./downloads";

const PADDING = 60;

const intersects = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const cases: [string, number, number][] = [
  ["horizontal strip", 3288, 81],
  ["tall fan", 760, 1434],
  ["single node", 339, 81],
  ["very large", 20000, 20000],
];

describe("exportLayout", () => {
  test.each(cases)(
    "%s: the watermark never covers the chart",
    (_, contentW, contentH) => {
      const { canvasW, canvasH, contentRect, markRect } = exportLayout({
        contentW,
        contentH,
        watermark: true,
      });
      if (!markRect) throw new Error("watermark:true must place a mark");
      expect(intersects(markRect, contentRect)).toBe(false);
      expect(markRect.x).toBeGreaterThanOrEqual(0);
      expect(markRect.y).toBeGreaterThanOrEqual(0);
      expect(markRect.x + markRect.w).toBeLessThanOrEqual(canvasW);
      expect(markRect.y + markRect.h).toBeLessThanOrEqual(canvasH);
      expect(markRect.w).toBeGreaterThan(0);
      expect(markRect.h).toBeGreaterThan(0);
    }
  );

  test.each(cases)(
    "%s: the mark keeps its 15%-of-width size and the chart keeps its top-left padding",
    (_, contentW, contentH) => {
      const { canvasW, contentRect, markRect } = exportLayout({
        contentW,
        contentH,
        watermark: true,
      });
      expect(canvasW).toBe(contentW + PADDING);
      expect(contentRect).toEqual({
        x: PADDING / 2,
        y: PADDING / 2,
        w: contentW,
        h: contentH,
      });
      expect(markRect?.w).toBe(Math.floor(canvasW * 0.15));
      expect(markRect?.x).toBe(PADDING / 2);
    }
  );

  test.each(cases)(
    "%s: watermark:false is padding only, as before",
    (_, contentW, contentH) => {
      expect(exportLayout({ contentW, contentH, watermark: false })).toEqual({
        canvasW: contentW + PADDING,
        canvasH: contentH + PADDING,
        contentRect: {
          x: PADDING / 2,
          y: PADDING / 2,
          w: contentW,
          h: contentH,
        },
        markRect: null,
      });
    }
  );
});
