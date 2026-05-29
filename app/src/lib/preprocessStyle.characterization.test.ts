/**
 * CHARACTERIZATION TESTS for preprocessStyle.ts
 *
 * These tests lock down the CURRENT behavior of the module before a future
 * framework migration. They are a safety net, NOT a correctness audit.
 *
 * The pure, characterizable surface is:
 *   - preprocessStyle(style): @import extraction, $variable substitution, and
 *     dynamic class detection (the latter only observable via the zustand store)
 *   - getStyleStringFromMeta(meta): branch on customCssOnly + concat order
 *
 * The font/CSSStyleSheet paths (findFontData / parseFontFaces / the react-query
 * hook) depend on browser APIs + a load-time polyfill; those are guarded /
 * documented rather than forced.
 */
import {
  preprocessStyle,
  getStyleStringFromMeta,
  useProcessStyleStore,
} from "./preprocessStyle";
import { theme as defaultTheme } from "./templates/default-template";

describe("preprocessStyle - @import extraction", () => {
  it("extracts a quoted @import url() with trailing semicolon and strips it from returned style", () => {
    const style = `@import url("https://fonts.example.com/font.css");
node {
  background-color: red;
}`;
    const result = preprocessStyle(style);

    expect(result.imports).toEqual(["https://fonts.example.com/font.css"]);
    // the @import line is removed from the returned style
    expect(result.style).not.toContain("@import");
    expect(result.style).toContain("background-color: red;");
  });

  it("extracts multiple @import urls in source order", () => {
    const style = `@import url('https://a.example.com/a.css');
@import url("https://b.example.com/b.css");
node { color: black; }`;
    const result = preprocessStyle(style);

    expect(result.imports).toEqual([
      "https://a.example.com/a.css",
      "https://b.example.com/b.css",
    ]);
    expect(result.style).not.toContain("@import");
  });

  it("CHARACTERIZATION: does NOT extract an @import without trailing semicolon (current limitation)", () => {
    const style = `@import url("https://nosemi.example.com/font.css")
node { color: red; }`;
    const result = preprocessStyle(style);

    expect(result.imports).toEqual([]);
    // left intact in the returned style
    expect(result.style).toContain("@import");
  });

  it("CHARACTERIZATION: does NOT extract an @import whose url() is unquoted (current limitation)", () => {
    const style = `@import url(https://noquote.example.com/font.css);
node { color: red; }`;
    const result = preprocessStyle(style);

    expect(result.imports).toEqual([]);
    expect(result.style).toContain("@import");
  });

  it("sets styleImports in the store equal to the returned imports", () => {
    const style = `@import url("https://store.example.com/font.css");
node { color: red; }`;
    const result = preprocessStyle(style);

    expect(useProcessStyleStore.getState().styleImports).toEqual(
      result.imports
    );
  });
});

describe("preprocessStyle - $variable substitution (processScss)", () => {
  it("removes a col-0 $variable declaration and substitutes its references", () => {
    const style = `$blue: #e3f2fd;
:childless.color_blue {
  background-color: $blue;
}`;
    const result = preprocessStyle(style);

    // declaration line removed
    expect(result.style).not.toContain("$blue:");
    // reference substituted
    expect(result.style).toContain("background-color: #e3f2fd;");
    // variable recorded in the returned map (and store)
    expect(result.variables.blue).toBe("#e3f2fd");
    expect(useProcessStyleStore.getState().variables.blue).toBe("#e3f2fd");
  });

  it("variable replace has a trailing boundary so a prefix does NOT collide", () => {
    // $color is a prefix of $colorDark. Insertion order: color first, then colorDark.
    // With the trailing negative lookahead, substituting $color must NOT rewrite
    // the "$color" prefix inside "$colorDark"; each variable resolves to its own value.
    const style = `$color: red;
$colorDark: blue;
node {
  color: $color;
  border-color: $colorDark;
}`;
    const result = preprocessStyle(style);

    // $color -> "red" and $colorDark -> "blue", with no prefix collision
    expect(result.style).toContain("color: red;");
    expect(result.style).toContain("border-color: blue;");
    expect(result.variables).toEqual({ color: "red", colorDark: "blue" });
  });

  it("CHARACTERIZATION: indented $variable declarations are left verbatim (not treated as variables)", () => {
    const style = `  $indented: green;
node {
  color: $other;
}`;
    const result = preprocessStyle(style);

    // indented decl is NOT captured as a variable
    expect(result.variables.indented).toBeUndefined();
    // and the indented line is left in the output verbatim
    expect(result.style).toContain("  $indented: green;");
  });

  it("CHARACTERIZATION: a declaration line must end with a semicolon to be captured", () => {
    const style = `$nosemi: green
node { color: red; }`;
    const result = preprocessStyle(style);

    expect(result.variables.nosemi).toBeUndefined();
    expect(result.style).toContain("$nosemi: green");
  });
});

describe("preprocessStyle - dynamic class detection (store side effect)", () => {
  it("detects childless / edge / parent type_name classes into the store", () => {
    const style = `:childless.color_blue {
  background-color: blue;
}
edge.color_red {
  line-color: red;
}
:parent.color_grey {
  background-color: grey;
}`;
    preprocessStyle(style);

    const state = useProcessStyleStore.getState();
    expect(state.dynamicClassesChildless).toEqual(["color_blue"]);
    expect(state.dynamicClassesEdges).toEqual(["color_red"]);
    expect(state.dynamicClassesParent).toEqual(["color_grey"]);
  });

  it("detects multiple dynamic classes of the same kind", () => {
    const style = `:childless.color_blue { background-color: blue; }
:childless.shape_diamond { shape: diamond; }`;
    preprocessStyle(style);

    expect(useProcessStyleStore.getState().dynamicClassesChildless).toEqual([
      "color_blue",
      "shape_diamond",
    ]);
  });

  it("CHARACTERIZATION: an INDENTED dynamic selector is NOT detected (requires line start)", () => {
    const style = `  :childless.color_blue {
  background-color: blue;
}`;
    preprocessStyle(style);

    expect(useProcessStyleStore.getState().dynamicClassesChildless).toEqual([]);
  });

  it("CHARACTERIZATION: a class WITHOUT an underscore is NOT detected (type_name convention required)", () => {
    const style = `:childless.highlight {
  background-color: yellow;
}`;
    preprocessStyle(style);

    expect(useProcessStyleStore.getState().dynamicClassesChildless).toEqual([]);
  });

  it("CHARACTERIZATION: a compound selector prefix (node:childless.foo_bar) is NOT detected", () => {
    const style = `node:childless.color_blue {
  background-color: blue;
}`;
    preprocessStyle(style);

    expect(useProcessStyleStore.getState().dynamicClassesChildless).toEqual([]);
  });
});

describe("getStyleStringFromMeta", () => {
  it("returns only cytoscapeStyle when customCssOnly is true", () => {
    const meta = {
      customCssOnly: true,
      cytoscapeStyle: "node { color: red; }",
      themeEditor: defaultTheme,
    };
    expect(getStyleStringFromMeta(meta)).toBe("node { color: red; }");
  });

  it("returns empty string when customCssOnly is true and cytoscapeStyle is missing", () => {
    const meta = { customCssOnly: true };
    expect(getStyleStringFromMeta(meta)).toBe("");
  });

  it("concatenates theme.style, cytoscapeStyle, theme.postStyle (in that order) when not customCssOnly", () => {
    const cytoscapeStyle = "/* USER_CSS_MARKER */";
    const meta = {
      customCssOnly: false,
      cytoscapeStyle,
      themeEditor: defaultTheme,
    };
    const result = getStyleStringFromMeta(meta);

    // user css appears, sandwiched between theme.style and theme.postStyle
    expect(result).toContain(cytoscapeStyle);

    // Verify the join order against the same toTheme output used internally.
    // We re-derive it to pin the \n separators + order.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { toTheme } = require("./toTheme");
    const theme = toTheme(defaultTheme);
    expect(result).toBe(
      `${theme.style}\n${cytoscapeStyle}\n${theme.postStyle}`
    );

    // order: theme.style index < user css index < postStyle index
    const userIdx = result.indexOf(cytoscapeStyle);
    expect(result.indexOf(theme.style)).toBeLessThan(userIdx);
    expect(userIdx).toBeLessThan(result.lastIndexOf(theme.postStyle));
  });

  it("CHARACTERIZATION: explicit customCssOnly=false falls through to concatenation (only null/undefined fall back)", () => {
    const meta = {
      customCssOnly: false,
      cytoscapeStyle: "/* X */",
      themeEditor: defaultTheme,
    };
    const result = getStyleStringFromMeta(meta);
    expect(result).toContain("/* X */");
    // not just the raw cytoscapeStyle
    expect(result).not.toBe("/* X */");
  });
});

describe("preprocessStyle - font data (browser-API dependent, guarded)", () => {
  /**
   * Probe whether constructable-CSSStyleSheet rule parsing actually works in
   * this environment. In a real browser, `replaceSync` populates `cssRules`
   * with parsed CSSStyleRule objects whose `.selectorText` / `.style` are
   * readable — which is what findFontData relies on. Under jest/jsdom this
   * frequently does NOT populate cssRules, so findFontData returns {}.
   */
  function sheetParsingWorks(): boolean {
    try {
      const s = new CSSStyleSheet();
      if (typeof (s as any).replaceSync !== "function") return false;
      (s as any).replaceSync("node { font-size: 16px; }");
      const rules = Array.from((s as any).cssRules || []) as any[];
      const nodeRule = rules.find((r) => r?.selectorText === "node");
      return !!(nodeRule && nodeRule.style && nodeRule.style.fontSize);
    } catch {
      return false;
    }
  }

  it("populates store.fontData from a 'node' rule (only when the env can parse stylesheets)", () => {
    const style = `node {
  font-family: "Arial";
  font-size: 16px;
}`;
    preprocessStyle(style);
    const fontData = useProcessStyleStore.getState().fontData as any;

    if (!sheetParsingWorks()) {
      // CHARACTERIZATION: under jest/jsdom, constructable-stylesheet rule
      // parsing does not populate cssRules, so findFontData returns {}.
      // The font path is therefore only meaningfully exercised in a real
      // browser. The variable/import/dynamic-class paths above are the safe
      // core and need none of this.
      expect(fontData).toEqual({});
      return;
    }

    // Browser-like env: fontFamily is sanitized (quotes removed) and empty
    // props are dropped.
    expect(fontData.fontFamily).toBe("Arial");
    expect(fontData.fontSize).toBe("16px");
  });
});
