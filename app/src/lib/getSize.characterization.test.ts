/**
 * CHARACTERIZATION TESTS for getSize.ts
 *
 * Goal: lock down CURRENT behavior of node-sizing math + text-size classes
 * before a future framework migration. These tests assert ACTUAL output
 * (possibly buggy), not ideal output.
 *
 * Environment note: these run under jsdom (CRA default test env). jsdom does
 * NOT implement real text layout — Range.getClientRects() returns an empty
 * list (=> measured width 0) and element.clientHeight returns 0. So in the
 * "normal" measured path the returned width/height are 0 and shape multipliers
 * multiply 0 (=> 0). We therefore pin:
 *   - the exact RETURN SHAPE (keys present) for each branch,
 *   - the resizer's written `style` string, which faithfully captures the
 *     observable math (getWidth max-width, MAGIC_SCALAR, fontSize parsing,
 *     text-size scalar precedence, and preventCyRenderingBugs substitution).
 * The genuine pixel measurement (getClientRects) needs a real layout engine
 * and is out of scope for jsdom; documented in notes.
 */

import { getSize, fontSizeScalars } from "./getSize";
import { useProcessStyleStore } from "./preprocessStyle";

// Save/restore the zustand store's fontData around each test.
const ORIGINAL_FONT_DATA = useProcessStyleStore.getState().fontData;

function setFontData(fontData: Record<string, unknown>) {
  useProcessStyleStore.setState({ fontData: fontData as any });
}

function ensureResizer(): HTMLElement {
  let el = document.getElementById("resizer");
  if (!el) {
    el = document.createElement("div");
    el.id = "resizer";
    document.body.appendChild(el);
  }
  return el;
}

function removeResizer() {
  const el = document.getElementById("resizer");
  if (el) el.remove();
}

// jsdom's Range does NOT implement getClientRects (it is not even a function),
// so the measured path of getSize() THROWS for any non-empty label unless we
// stub measurement. Default stub: a single client rect of width
// DEFAULT_STUB_WIDTH and clientHeight DEFAULT_STUB_HEIGHT. Individual tests may
// override via installMeasurementStub().
const DEFAULT_STUB_WIDTH = 100;
const DEFAULT_STUB_HEIGHT = 20;

let createRangeSpy: jest.SpyInstance | null = null;
let clientHeightSpy: jest.SpyInstance | null = null;

function installMeasurementStub(width: number, height: number) {
  uninstallMeasurementStub();
  const resizer = ensureResizer();
  const realCreateRange = document.createRange.bind(document);
  createRangeSpy = jest
    .spyOn(document, "createRange")
    .mockImplementation(() => {
      const range = realCreateRange();
      range.getClientRects = () =>
        [{ width } as DOMRect] as unknown as DOMRectList;
      return range;
    });
  clientHeightSpy = jest
    .spyOn(resizer, "clientHeight", "get")
    .mockReturnValue(height);
}

function uninstallMeasurementStub() {
  createRangeSpy?.mockRestore();
  clientHeightSpy?.mockRestore();
  createRangeSpy = null;
  clientHeightSpy = null;
}

function withStubbedMeasurement<T>(
  width: number,
  height: number,
  fn: () => T
): T {
  installMeasurementStub(width, height);
  try {
    return fn();
  } finally {
    uninstallMeasurementStub();
  }
}

beforeEach(() => {
  // Most tests observe the resizer's written style/textContent or the returned
  // object; they need a non-throwing measurement. Install the default stub.
  installMeasurementStub(DEFAULT_STUB_WIDTH, DEFAULT_STUB_HEIGHT);
});

afterEach(() => {
  uninstallMeasurementStub();
  setFontData(ORIGINAL_FONT_DATA as any);
  removeResizer();
});

describe("fontSizeScalars constant", () => {
  it("pins the exact text-size multipliers", () => {
    // These scale font-size and thus node size. Guard against accidental edits.
    expect(fontSizeScalars).toEqual({
      "text-sm": 0.75,
      "text-base": 1,
      "text-lg": 1.5,
      "text-xl": 2,
    });
  });
});

describe("getSize: no #resizer in DOM (string-sentinel fallback)", () => {
  it("returns {width:'label', height:'label'} when #resizer is absent", () => {
    removeResizer();
    setFontData({ fontSize: 10 });
    const result = getSize("Hello", []);
    // Cytoscape sentinel meaning "size to label". Downstream getElements.ts
    // spreads this into node data.
    expect(result).toEqual({ width: "label", height: "label" });
  });
});

describe("getSize: empty-text path (silent undefined return)", () => {
  it("returns undefined when label is empty (resizer present but no firstChild)", () => {
    ensureResizer();
    setFontData({ fontSize: 10 });
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // textContent = "" produces no firstChild, so the function falls through
    // the if-block and returns undefined (no explicit return). getElements.ts
    // would spread undefined.
    const result = getSize("", []);
    expect(result).toBeUndefined();
  });
});

describe("getSize: resizer style string (observable math)", () => {
  it("writes max-width, the raw fontData font-size, then the computed font-size (font-size appears TWICE)", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    getSize("Hello", []); // length 5
    const style = resizer.getAttribute("style");
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // fontData is spread into the style object, so its `fontSize:10` becomes a
    // `font-size: 10` declaration; then an explicit `font-size: 12.7px` is
    // ALSO emitted. Both are written; in CSS the later one wins.
    // getWidth(5) = Math.max(64, ceil(33.8993*ln(5) - 38.614819)) = 64 (floor)
    // computed font-size = 1.27 * 10 * 1 (text-base) = 12.7
    expect(style).toBe("max-width: 64px; font-size: 10; font-size: 12.7px;");
  });

  it("getWidth grows logarithmically above the 64px floor for long labels", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    // 100-char label
    getSize("x".repeat(100), []);
    const style = resizer.getAttribute("style") || "";
    // getWidth(100) = ceil(33.8993 * ln(100) - 38.614819)
    //              = ceil(33.8993 * 4.60517 - 38.614819)
    //              = ceil(156.115... - 38.614...) = ceil(117.50) = 118
    expect(style).toContain("max-width: 118px;");
  });

  it("MAGIC_SCALAR (1.27) and text-base scalar (1) are applied to numeric fontSize", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 20 });
    getSize("Node", []);
    // 1.27 * 20 * 1 = 25.4
    expect(resizer.getAttribute("style")).toContain("font-size: 25.4px;");
  });
});

describe("getSize: fontSize resolution (triple-branch fallback)", () => {
  it("uses a numeric fontSize directly", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 12 });
    getSize("Node", []);
    // 1.27 * 12 * 1 = 15.24
    expect(resizer.getAttribute("style")).toContain("font-size: 15.24px;");
  });

  it("parseInt's a string fontSize like '14px'", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: "14px" });
    getSize("Node", []);
    // parseInt('14px',10) => 14 ; 1.27 * 14 * 1 = 17.78
    expect(resizer.getAttribute("style")).toContain("font-size: 17.78px;");
  });

  it("defaults to 10 when fontSize is absent", () => {
    const resizer = ensureResizer();
    setFontData({});
    getSize("Node", []);
    // default 10 ; 1.27 * 10 * 1 = 12.7
    expect(resizer.getAttribute("style")).toContain("font-size: 12.7px;");
  });

  it("produces font-size NaNpx for a non-numeric string fontSize", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: "abc" });
    getSize("Node", []);
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // parseInt('abc',10) => NaN ; 1.27 * NaN * 1 => NaN -> "NaNpx". No validation.
    expect(resizer.getAttribute("style")).toContain("font-size: NaNpx;");
  });
});

describe("getSize: text-size class precedence", () => {
  function fontSizeFor(classes: string[]): string {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    getSize("Node", classes);
    const style = resizer.getAttribute("style") || "";
    // font-size is emitted twice (raw fontData + computed). The COMPUTED value
    // is last; grab the last match.
    const all = Array.from(style.matchAll(/font-size: ([^;]+);/g));
    return all.length ? all[all.length - 1][1] : "";
  }

  it("text-sm (0.75x) wins over everything", () => {
    // 1.27 * 10 * 0.75 -> JS float = 9.524999999999999 (pinned exactly)
    expect(fontSizeFor(["text-sm", "text-lg", "text-xl"])).toBe(
      "9.524999999999999px"
    );
  });

  it("text-lg (1.5x) beats text-xl when both present", () => {
    // if/else chain checks isLarge (text-lg) before isXLarge (text-xl)
    // 1.27 * 10 * 1.5 -> JS float = 19.049999999999997 (pinned exactly)
    expect(fontSizeFor(["text-lg", "text-xl"])).toBe("19.049999999999997px");
  });

  it("text-xl (2x) applies when only text-xl present", () => {
    // 1.27 * 10 * 2 = 25.4
    expect(fontSizeFor(["text-xl"])).toBe("25.4px");
  });

  it("text-base (1x) is the default with no text-size class", () => {
    // 1.27 * 10 * 1 = 12.7
    expect(fontSizeFor([])).toBe("12.7px");
  });
});

describe("getSize: preventCyRenderingBugs substitution (observable via textContent)", () => {
  it("replaces hyphens with the &#x2011; non-breaking-hyphen entity literal before measuring", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    getSize("a-b", []);
    // textContent is the entity-substituted string (literal 7-char entity).
    expect(resizer.textContent).toBe("a&#x2011;b");
  });

  it("replaces the Chinese comma (，) with the same entity", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    getSize("a，b", []);
    expect(resizer.textContent).toBe("a&#x2011;b");
  });

  it("replaces ALL hyphens globally", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    getSize("a-b-c", []);
    expect(resizer.textContent).toBe("a&#x2011;b&#x2011;c");
  });

  it("leaves non-hyphen / non-CJK-comma characters untouched", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    getSize("Hello World 123", []);
    expect(resizer.textContent).toBe("Hello World 123");
  });

  it("counts the substituted entity literal toward max-width (length skew)", () => {
    const resizer = ensureResizer();
    setFontData({ fontSize: 10 });
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // "a-b-c" (5 chars) becomes "a&#x2011;b&#x2011;c" (19 chars) BEFORE
    // getWidth(text.length). So max-width is computed from 19, not 5.
    getSize("a-b-c", []);
    // getWidth(19) = ceil(33.8993 * ln(19) - 38.614819)
    //             = ceil(33.8993 * 2.9444 - 38.6148) = ceil(61.21) = 62
    // 62 < 64 floor -> 64
    expect(resizer.getAttribute("style")).toContain("max-width: 64px;");
    // sanity: a 26-char-equivalent forces growth above floor
  });
});

describe("getSize: measured path environment behavior", () => {
  it("THROWS in jsdom for a non-empty label because Range.getClientRects is unimplemented", () => {
    // Remove the default stub installed in beforeEach to observe raw jsdom.
    uninstallMeasurementStub();
    ensureResizer();
    setFontData({ fontSize: 10 });
    // CHARACTERIZATION: this documents the TEST ENVIRONMENT (jsdom), not a
    // product bug. In a real browser getClientRects returns real rects. We pin
    // it so future readers understand why the rest of the measured-path tests
    // must stub measurement.
    expect(() => getSize("Node", [])).toThrow();
  });
});

describe("getSize: return SHAPE for the measured path (stubbed measurement)", () => {
  it("default (no shape class): returns 6-key numeric object, shapeWidth==width, margins 0", () => {
    setFontData({ fontSize: 10 });
    const result = withStubbedMeasurement(100, 20, () =>
      getSize("Node", [])
    ) as any;
    expect(Object.keys(result).sort()).toEqual(
      [
        "height",
        "shapeHeight",
        "shapeWidth",
        "textMarginX",
        "textMarginY",
        "width",
      ].sort()
    );
    expect(result.width).toBe(100);
    expect(result.shapeWidth).toBe(100);
    expect(result.height).toBe(20);
    expect(result.shapeHeight).toBe(20);
    expect(result.textMarginX).toBe(0);
    expect(result.textMarginY).toBe(0);
  });

  it("unknown class produces no shape transform (same as default)", () => {
    setFontData({ fontSize: 10 });
    const result = withStubbedMeasurement(100, 20, () =>
      getSize("Node", ["color_blue", "not-a-shape"])
    ) as any;
    expect(result.shapeWidth).toBe(result.width);
    expect(result.shapeHeight).toBe(result.height);
    expect(result.textMarginX).toBe(0);
    expect(result.textMarginY).toBe(0);
  });
});

/**
 * Shape transform math.
 *
 * Because jsdom measures 0, the multipliers (e.g. 2.2 * width) all evaluate to
 * 0 and we cannot observe the FACTOR from the output alone. To pin the actual
 * multipliers, we stub getClientRects + clientHeight on the resizer so the
 * measured base width/height are known non-zero values, then assert the exact
 * transformed numbers. This locks the bespoke shape factors that determine
 * on-screen geometry for existing customer charts.
 */
describe("getSize: shape transform factors (stubbed measurement)", () => {
  const BASE_W = 100;
  const BASE_H = 20;

  // Note: JS float arithmetic makes some products inexact (e.g. 2.2 * 100 ===
  // 220.00000000000003), so multiplier assertions use toBeCloseTo.
  function stubbedGetSize(classes: string[]) {
    setFontData({ fontSize: 10 });
    return withStubbedMeasurement(BASE_W, BASE_H, () =>
      getSize("Node", classes)
    ) as any;
  }

  it("base case: width=100, height=20 with stubbed measurement", () => {
    const r = stubbedGetSize([]);
    expect(r.width).toBe(100);
    expect(r.height).toBe(20);
    expect(r.shapeWidth).toBe(100);
    expect(r.shapeHeight).toBe(20);
  });

  it("triangle: shapeWidth=2.2w, shapeHeight=1.25h, textMarginY=0.18*shapeHeight", () => {
    const r = stubbedGetSize(["triangle"]);
    expect(r.shapeWidth).toBeCloseTo(2.2 * 100, 10); // 220
    expect(r.shapeHeight).toBeCloseTo(1.25 * 20, 10); // 25
    expect(r.textMarginY).toBeCloseTo(0.18 * 25, 10); // 4.5
  });

  it("round-triangle aliases triangle", () => {
    const r = stubbedGetSize(["round-triangle"]);
    expect(r.shapeWidth).toBeCloseTo(220, 10);
    expect(r.shapeHeight).toBeCloseTo(25, 10);
  });

  it("diamond: shapeWidth=1.5w, shapeHeight=1.5h, margins 0", () => {
    const r = stubbedGetSize(["diamond"]);
    expect(r.shapeWidth).toBeCloseTo(150, 10);
    expect(r.shapeHeight).toBeCloseTo(30, 10);
    expect(r.textMarginX).toBe(0);
    expect(r.textMarginY).toBe(0);
  });

  it("pentagon: shapeWidth=1.35w, textMarginY=0.1*shapeHeight (shapeHeight unchanged=h)", () => {
    const r = stubbedGetSize(["pentagon"]);
    expect(r.shapeWidth).toBeCloseTo(1.35 * 100, 10); // 135
    expect(r.shapeHeight).toBe(20); // unchanged
    expect(r.textMarginY).toBeCloseTo(0.1 * 20, 10); // 2
  });

  it("hexagon: shapeWidth=1.5w only", () => {
    const r = stubbedGetSize(["hexagon"]);
    expect(r.shapeWidth).toBeCloseTo(150, 10);
    expect(r.shapeHeight).toBe(20);
    expect(r.textMarginY).toBe(0);
  });

  it("heptagon: shapeWidth=1.5w, textMarginY=0.05*shapeHeight", () => {
    const r = stubbedGetSize(["heptagon"]);
    expect(r.shapeWidth).toBeCloseTo(150, 10);
    expect(r.textMarginY).toBeCloseTo(0.05 * 20, 10); // 1
  });

  it("octagon: shapeWidth=1.25w only", () => {
    const r = stubbedGetSize(["octagon"]);
    expect(r.shapeWidth).toBeCloseTo(125, 10);
    expect(r.shapeHeight).toBe(20);
  });

  it("star: shapeHeight=shapeWidth=1.4*max(shapeHeight,shapeWidth), textMarginY=0.13*height", () => {
    const r = stubbedGetSize(["star"]);
    // max(20,100)=100 -> 1.4*100 = 140 for BOTH
    expect(r.shapeWidth).toBeCloseTo(140, 10);
    expect(r.shapeHeight).toBeCloseTo(140, 10);
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // textMarginY uses height (20), computed BEFORE the shapeWidth/shapeHeight
    // reassignment: 0.13 * 20 = 2.6
    expect(r.textMarginY).toBeCloseTo(0.13 * 20, 10);
  });

  it("vee: shapeWidth=2.5w, shapeHeight=2.5h, textMarginY=0.01*shapeHeight", () => {
    const r = stubbedGetSize(["vee"]);
    expect(r.shapeWidth).toBeCloseTo(250, 10);
    expect(r.shapeHeight).toBeCloseTo(50, 10);
    expect(r.textMarginY).toBeCloseTo(0.01 * 50, 10); // 0.5
  });

  it("rhomboid: shapeWidth=2w only", () => {
    const r = stubbedGetSize(["rhomboid"]);
    expect(r.shapeWidth).toBeCloseTo(200, 10);
    expect(r.shapeHeight).toBe(20);
  });

  it("right-rhomboid aliases rhomboid", () => {
    const r = stubbedGetSize(["right-rhomboid"]);
    expect(r.shapeWidth).toBeCloseTo(200, 10);
  });

  it("tag: shapeWidth=1.25w and NEGATIVE textMarginX=-0.1*shapeWidth", () => {
    const r = stubbedGetSize(["tag"]);
    expect(r.shapeWidth).toBeCloseTo(125, 10);
    // CHARACTERIZATION: negative margin is intentional; pin the sign.
    expect(r.textMarginX).toBeCloseTo(-0.1 * 125, 10); // -12.5
  });

  it("round-tag aliases tag", () => {
    const r = stubbedGetSize(["round-tag"]);
    expect(r.shapeWidth).toBeCloseTo(125, 10);
    expect(r.textMarginX).toBeCloseTo(-12.5, 10);
  });

  it("concave-hexagon: shapeWidth=1.5w only", () => {
    const r = stubbedGetSize(["concave-hexagon"]);
    expect(r.shapeWidth).toBeCloseTo(150, 10);
    expect(r.shapeHeight).toBe(20);
  });

  it("circle: when width>height, all dims become width (height promoted up)", () => {
    // BASE_W=100 > BASE_H=20 -> else branch:
    //   height = shapeWidth = shapeHeight = width(100)
    const r = stubbedGetSize(["circle"]);
    expect(r.width).toBe(100);
    expect(r.height).toBe(100);
    expect(r.shapeWidth).toBe(100);
    expect(r.shapeHeight).toBe(100);
  });

  it("circle: when height>width, all dims become height", () => {
    setFontData({ fontSize: 10 });
    const r = withStubbedMeasurement(30, 80, () =>
      getSize("Node", ["circle"])
    ) as any;
    // if branch: width = shapeWidth = shapeHeight = height(80)
    expect(r.width).toBe(80);
    expect(r.height).toBe(80);
    expect(r.shapeWidth).toBe(80);
    expect(r.shapeHeight).toBe(80);
  });
});
