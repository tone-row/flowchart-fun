/**
 * CHARACTERIZATION TESTS for toTheme.ts
 *
 * These tests lock down the CURRENT behavior of the FFTheme -> Cytoscape
 * conversion before a future framework/refactor migration. They are a SAFETY
 * NET, not a correctness audit. Where the current behavior looks surprising or
 * buggy, we intentionally pin it as-is and flag it with a CHARACTERIZATION
 * comment rather than fixing it.
 *
 * The module under test treats its `cytoscape` import as type-only at runtime;
 * toTheme() never instantiates a Core, so these tests are pure.
 */
import { toTheme, styleToString, getThemeEditor } from "./toTheme";
import { FFTheme } from "./FFTheme";
import { theme as defaultTheme } from "./templates/default-template";

/** Build a complete FFTheme by overriding the default-template theme. */
function makeTheme(overrides: Partial<FFTheme> = {}): FFTheme {
  return { ...defaultTheme, ...overrides };
}

describe("toTheme - default theme (canonical baseline)", () => {
  it("produces stable layout + style + postStyle for the default-template theme (dagre/DOWN)", () => {
    const result = toTheme(makeTheme());

    // Pin the full structured output. The default theme is the most common
    // real-world input, so this is the canonical baseline.
    expect(result.layout).toMatchSnapshot("default-layout");
    expect(result.style).toMatchSnapshot("default-style");
    expect(result.postStyle).toMatchSnapshot("default-postStyle");
  });

  it("dagre layout sets name='dagre', rankDir from direction, and spacingFactor", () => {
    const result = toTheme(makeTheme());
    expect(result.layout.name).toBe("dagre");
    // @ts-expect-error - rankDir is not on the typed LayoutOptions
    expect(result.layout.rankDir).toBe("TB"); // DOWN -> TB
    // @ts-expect-error - spacingFactor is written via @ts-ignore
    expect(result.layout.spacingFactor).toBe(1.1);
  });

  it("default style begins with the IBM Plex Sans @import (known font prepend)", () => {
    const result = toTheme(makeTheme());
    expect(result.style.startsWith("@import url(")).toBe(true);
    expect(result.style).toContain("IBM+Plex+Sans");
  });

  it("default style contains $width and $background variables", () => {
    const result = toTheme(makeTheme());
    // width = textMaxWidth(146) + padding(16)*2 = 178
    expect(result.style).toContain("$width: 178px;");
    expect(result.style).toContain("$background: #ffffff;");
  });

  it("default theme (fixedHeight=50, useFixedHeight=false) STILL emits $height variable", () => {
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // $height is emitted whenever fixedHeight is truthy, decoupled from useFixedHeight.
    const result = toTheme(makeTheme());
    expect(result.style).toContain("$height: 50px;");
    // ...but the node itself uses height: label since useFixedHeight is false.
    expect(result.style).toContain("height: label;");
  });
});

describe("toTheme - dagre direction mapping (RIGHT/LEFT/DOWN/UP -> LR/RL/TB/BT)", () => {
  const cases: Array<[FFTheme["direction"], string]> = [
    ["RIGHT", "LR"],
    ["LEFT", "RL"],
    ["DOWN", "TB"],
    ["UP", "BT"],
  ];
  it.each(cases)(
    "dagre + direction %s translates rankDir to %s",
    (direction, expected) => {
      const result = toTheme(makeTheme({ layoutName: "dagre", direction }));
      // @ts-expect-error - rankDir written via @ts-ignore
      expect(result.layout.rankDir).toBe(expected);
    }
  );
});

describe("toTheme - klay and layered emit RAW (untranslated) direction values", () => {
  it("klay sets layout.klay.direction to the raw Direction string", () => {
    const result = toTheme(
      makeTheme({ layoutName: "klay", direction: "RIGHT" })
    );
    expect(result.layout.name).toBe("klay");
    // CHARACTERIZATION: klay receives the raw 'RIGHT' value, NOT translated to 'LR'.
    // @ts-expect-error - klay written via @ts-ignore
    expect(result.layout.klay).toEqual({ direction: "RIGHT" });
  });

  it("layered sets name='elk', elk.algorithm='layered', raw elk.direction, and BALANCED fixedAlignment", () => {
    const result = toTheme(
      makeTheme({ layoutName: "layered", direction: "DOWN" })
    );
    expect(result.layout.name).toBe("elk");
    // @ts-expect-error - elk written via @ts-ignore
    const elk = result.layout.elk;
    expect(elk.algorithm).toBe("layered");
    // CHARACTERIZATION: layered receives raw 'DOWN', NOT translated.
    expect(elk["elk.direction"]).toBe("DOWN");
    expect(elk["elk.layered.nodePlacement.bk.fixedAlignment"]).toBe("BALANCED");
  });
});

describe("toTheme - elk layouts set name='elk' with algorithm = original layoutName", () => {
  it("mrtree -> name='elk', elk.algorithm='mrtree', no animation flags", () => {
    const result = toTheme(makeTheme({ layoutName: "mrtree" }));
    expect(result.layout.name).toBe("elk");
    // @ts-expect-error
    expect(result.layout.elk.algorithm).toBe("mrtree");
    // @ts-expect-error
    expect(result.layout.animate).toBeUndefined();
  });

  it("radial -> name='elk', elk.algorithm='radial', no animation flags", () => {
    const result = toTheme(makeTheme({ layoutName: "radial" }));
    expect(result.layout.name).toBe("elk");
    // @ts-expect-error
    expect(result.layout.elk.algorithm).toBe("radial");
    // @ts-expect-error
    expect(result.layout.animate).toBeUndefined();
  });

  it("stress -> name='elk' with interactive + animation flags", () => {
    const result = toTheme(makeTheme({ layoutName: "stress" }));
    expect(result.layout.name).toBe("elk");
    // @ts-expect-error
    expect(result.layout.elk.algorithm).toBe("stress");
    // @ts-expect-error
    expect(result.layout.elk.interactive).toBe(true);
    // @ts-expect-error
    expect(result.layout.animate).toBe(true);
    // @ts-expect-error
    expect(result.layout.animationDuration).toBe(150);
    // @ts-expect-error
    expect(result.layout.animationEasing).toBe("ease-in-out");
  });
});

describe("toTheme - cose remaps to fcose with animation flags", () => {
  it("cose -> name='fcose' + animate flags (distinct from elk path)", () => {
    const result = toTheme(makeTheme({ layoutName: "cose" }));
    expect(result.layout.name).toBe("fcose");
    // @ts-expect-error
    expect(result.layout.animate).toBe(true);
    // @ts-expect-error
    expect(result.layout.animationDuration).toBe(150);
    // @ts-expect-error
    expect(result.layout.animationEasing).toBe("ease-in-out");
    // No elk key on the fcose path.
    // @ts-expect-error
    expect(result.layout.elk).toBeUndefined();
  });
});

describe("toTheme - non-hierarchical / non-direction-aware layouts ignore direction", () => {
  // CHARACTERIZATION: direction only affects dagre/klay/layered. For these
  // layouts changing direction produces identical layout output.
  const layouts: Array<FFTheme["layoutName"]> = [
    "breadthfirst",
    "concentric",
    "circle",
  ];
  it.each(layouts)(
    "%s ignores direction (DOWN vs RIGHT identical)",
    (layoutName) => {
      const down = toTheme(makeTheme({ layoutName, direction: "DOWN" }));
      const right = toTheme(makeTheme({ layoutName, direction: "RIGHT" }));
      expect(down.layout).toEqual(right.layout);
      expect(down.layout.name).toBe(layoutName);
    }
  );

  it("radial (an elk layout) also ignores direction", () => {
    const down = toTheme(
      makeTheme({ layoutName: "radial", direction: "DOWN" })
    );
    const right = toTheme(
      makeTheme({ layoutName: "radial", direction: "RIGHT" })
    );
    expect(down.layout).toEqual(right.layout);
  });
});

describe("toTheme - taxi-direction narrow conjunction", () => {
  it("curveStyle 'taxi' + mrtree -> taxi-direction 'downward' regardless of direction", () => {
    const result = toTheme(
      makeTheme({ curveStyle: "taxi", layoutName: "mrtree", direction: "UP" })
    );
    expect(result.style).toContain("taxi-direction: downward;");
  });

  it("curveStyle 'taxi' + dagre + RIGHT -> 'horizontal'", () => {
    const result = toTheme(
      makeTheme({ curveStyle: "taxi", layoutName: "dagre", direction: "RIGHT" })
    );
    expect(result.style).toContain("taxi-direction: horizontal;");
  });

  it("curveStyle 'taxi' + dagre + LEFT -> 'horizontal'", () => {
    const result = toTheme(
      makeTheme({ curveStyle: "taxi", layoutName: "dagre", direction: "LEFT" })
    );
    expect(result.style).toContain("taxi-direction: horizontal;");
  });

  it("curveStyle 'taxi' + dagre + DOWN -> 'vertical'", () => {
    const result = toTheme(
      makeTheme({ curveStyle: "taxi", layoutName: "dagre", direction: "DOWN" })
    );
    expect(result.style).toContain("taxi-direction: vertical;");
  });

  it("curveStyle 'taxi' + klay (hierarchical) gets taxi-direction", () => {
    const result = toTheme(
      makeTheme({ curveStyle: "taxi", layoutName: "klay", direction: "DOWN" })
    );
    expect(result.style).toContain("taxi-direction: vertical;");
  });

  it("curveStyle 'round-taxi' does NOT trigger taxi-direction", () => {
    // CHARACTERIZATION: only literal 'taxi' triggers the branch; 'round-taxi' does not.
    const result = toTheme(
      makeTheme({
        curveStyle: "round-taxi",
        layoutName: "dagre",
        direction: "DOWN",
      })
    );
    expect(result.style).not.toContain("taxi-direction");
  });

  it("curveStyle 'taxi' + non-hierarchical layout (cose) gets NO taxi-direction", () => {
    const result = toTheme(
      makeTheme({ curveStyle: "taxi", layoutName: "cose", direction: "DOWN" })
    );
    expect(result.style).not.toContain("taxi-direction");
  });
});

describe("toTheme - useFixedHeight controls node height (number vs 'label')", () => {
  it("useFixedHeight=false -> node height is the string 'label'", () => {
    const result = toTheme(makeTheme({ useFixedHeight: false }));
    expect(result.style).toContain("height: label;");
  });

  it("useFixedHeight=true -> node height is the numeric fixedHeight", () => {
    const result = toTheme(
      makeTheme({ useFixedHeight: true, fixedHeight: 120 })
    );
    expect(result.style).toContain("height: 120;");
    expect(result.style).not.toContain("height: label;");
    // And $height variable is also present (fixedHeight truthy).
    expect(result.style).toContain("$height: 120px;");
  });
});

describe("toTheme - $height variable decoupled from useFixedHeight", () => {
  it("fixedHeight truthy but useFixedHeight=false STILL emits $height variable", () => {
    // CHARACTERIZATION: documents current behavior, may be a bug.
    const result = toTheme(
      makeTheme({ useFixedHeight: false, fixedHeight: 99 })
    );
    expect(result.style).toContain("$height: 99px;");
    expect(result.style).toContain("height: label;"); // node still uses label
  });

  it("fixedHeight=0 omits the $height variable entirely", () => {
    const result = toTheme(
      makeTheme({ useFixedHeight: false, fixedHeight: 0 })
    );
    expect(result.style).not.toContain("$height:");
  });
});

describe("toTheme - smart border classes use || (truthiness) fallback", () => {
  it("borderWidth=0 (default) falls through to edgeWidth in .border_* classes", () => {
    // CHARACTERIZATION / LANDMINE: `theme.borderWidth || theme.edgeWidth`.
    // When borderWidth is 0, the border utility classes use edgeWidth (2), NOT 0.
    // A migration replacing || with ?? would change default-theme borders for ALL customers.
    const result = toTheme(makeTheme({ borderWidth: 0, edgeWidth: 2 }));
    // border_solid etc. live in postStyle.
    expect(result.postStyle).toContain(
      ":childless.border_solid { border-width: 2;"
    );
    // sanity: there is no border-width: 0 in those smart classes
    expect(result.postStyle).not.toContain(
      ":childless.border_solid { border-width: 0;"
    );
  });

  it("borderWidth=3 (truthy) is used directly in .border_* classes", () => {
    const result = toTheme(makeTheme({ borderWidth: 3, edgeWidth: 2 }));
    expect(result.postStyle).toContain(
      ":childless.border_solid { border-width: 3;"
    );
  });
});

describe("toTheme - font @import behavior", () => {
  it("known font (REM) prepends its @import snippet at the front of the style", () => {
    const result = toTheme(makeTheme({ fontFamily: "REM" }));
    expect(result.style.startsWith("@import url(")).toBe(true);
    expect(result.style).toContain("family=REM");
  });

  it("unknown/custom font produces NO @import; style starts with the variables block", () => {
    // CHARACTERIZATION: exact-match, case-sensitive lookup. Unknown fonts get no import.
    const result = toTheme(makeTheme({ fontFamily: "My Custom Font" }));
    expect(result.style.includes("@import")).toBe(false);
    expect(result.style.startsWith("$width:")).toBe(true);
  });

  it("font lookup is case-sensitive: 'ibm plex sans' is treated as unknown", () => {
    const result = toTheme(makeTheme({ fontFamily: "ibm plex sans" }));
    expect(result.style.includes("@import")).toBe(false);
  });
});

describe("toTheme - fontFamily is JSON.stringify-quoted across node/edge/parent", () => {
  it("multi-word font name is emitted quoted in all three selectors", () => {
    const result = toTheme(makeTheme({ fontFamily: "Space Grotesk" }));
    // CHARACTERIZATION: font-family values are JSON.stringify'd (quoted).
    const matches = result.style.match(/font-family: "Space Grotesk";/g) || [];
    // node, edge, parent => 3 occurrences
    expect(matches.length).toBe(3);
  });
});

describe("toTheme - magic-number scaling for label/border sizes", () => {
  it("edge font-size = edgeTextSize*16, node font-size=16, parent=24, text-background-padding=edgeWidth", () => {
    const result = toTheme(makeTheme({ edgeTextSize: 0.875, edgeWidth: 2 }));
    // edge font-size: 0.875 * 16 = 14
    expect(result.style).toContain("font-size: 14;");
    // node font-size hardcoded 16
    expect(result.style).toContain("font-size: 16;");
    // parent font-size hardcoded 24
    expect(result.style).toContain("font-size: 24;");
    // text-background-padding reuses edgeWidth
    expect(result.style).toContain("text-background-padding: 2;");
  });
});

describe("toTheme - rotateEdgeLabel toggles text-rotation", () => {
  it("true -> autorotate", () => {
    const result = toTheme(makeTheme({ rotateEdgeLabel: true }));
    expect(result.style).toContain("text-rotation: autorotate;");
  });
  it("false -> none", () => {
    const result = toTheme(makeTheme({ rotateEdgeLabel: false }));
    expect(result.style).toContain("text-rotation: none;");
  });
});

describe("styleToString (exported serializer)", () => {
  it("serializes camelCase->kebab, preserves pre-kebab keys, trailing-space format", () => {
    const out = styleToString([
      {
        selector: ":childless",
        css: {
          backgroundColor: "#fff",
          "text-valign": "center",
          textMarginY: 0,
          fontSize: 16,
          "border-width": 2,
        } as any,
      },
    ]);
    // CHARACTERIZATION: exact serialized format including the space before `}`.
    expect(out).toBe(
      ":childless { background-color: #fff; text-valign: center; text-margin-y: 0; font-size: 16; border-width: 2; }"
    );
  });

  it("joins multiple stylesheet entries with newlines", () => {
    const out = styleToString([
      { selector: "edge", css: { width: 2 } as any },
      { selector: ":parent", css: { padding: 10 } as any },
    ]);
    expect(out).toBe("edge { width: 2; }\n:parent { padding: 10; }");
  });

  it("camelToKebab is idempotent on already-kebab keys", () => {
    const out = styleToString([
      { selector: "x", css: { "source-arrow-shape": "none" } as any },
    ]);
    expect(out).toBe("x { source-arrow-shape: none; }");
  });
});

describe("getThemeEditor", () => {
  it("returns doc.meta.themeEditor when present", () => {
    const custom = makeTheme({ layoutName: "klay", background: "#123456" });
    const result = getThemeEditor({ meta: { themeEditor: custom } } as any);
    expect(result).toBe(custom);
  });

  it("falls back to the default-template theme when themeEditor is absent", () => {
    // CHARACTERIZATION: backward-compat for legacy charts lacking themeEditor metadata.
    expect(getThemeEditor({ meta: {} } as any)).toBe(defaultTheme);
    expect(getThemeEditor({} as any)).toBe(defaultTheme);
    expect(getThemeEditor({ meta: { themeEditor: null } } as any)).toBe(
      defaultTheme
    );
  });
});
