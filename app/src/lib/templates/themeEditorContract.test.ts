/**
 * THEME EDITOR CONTRACT
 *
 * Every template ships a cytoscapeStyle that is concatenated AFTER the style
 * generated from the FFTheme object (see getStyleStringFromMeta). Cytoscape
 * resolves ties by ORDER, not specificity — so any template rule that sets an
 * FFTheme-controlled property on a broad selector (node, :childless, edge,
 * :parent) permanently pins that property and silently breaks the matching
 * knob in the Theme tab.
 *
 * This suite loads every template, composes the full pipeline style exactly
 * like the app does, applies it to a headless cytoscape instance, and asserts
 * that changing each FFTheme property still changes the computed style of a
 * PLAIN element (no classes, unremarkable degrees). Template rules scoped to
 * classes (.color_*, .icon_*) or special selectors ([out_degree > 1],
 * [label = 'Yes'], [in_degree < 1]) are exempt by construction — overriding
 * special elements is what templates are for.
 *
 * If you add a template or a template starts failing here: move the offending
 * property out of the broad rule — express it through the theme object, a
 * class, or a narrower selector.
 */
import cytoscape from "cytoscape";
import { templates } from "shared";
import { FFTheme } from "../FFTheme";
import { toTheme } from "../toTheme";
import { processScss } from "../preprocessStyle";

type TemplateModule = {
  content: string;
  theme: FFTheme;
  cytoscapeStyle: string;
};

/** Compose the final stylesheet the way Graph.tsx / getStyleStringFromMeta does. */
function composeStyle(theme: FFTheme, cytoscapeStyle: string): string {
  const { style, postStyle } = toTheme(theme);
  const full = [style, cytoscapeStyle, postStyle].join("\n");
  // preprocessStyle: strip @import lines, then substitute $variables
  const noImports = full.replace(/@import\s+url\(['"][^'"]+['"]\);/g, "");
  return processScss(noImports).updatedScss;
}

/**
 * A minimal graph shaped so the assertion targets stay PLAIN:
 * - node "plain" has in_degree 1 / out_degree 1, no classes, childless
 * - edge "plainEdge" has no label, no classes
 * - parent "P" is a bare compound node
 * Roots/terminals/branching nodes exist separately so templates' degree-based
 * rules latch onto them instead of the plain targets.
 */
function makeCy(styleString: string) {
  const cy = cytoscape({
    headless: true,
    styleEnabled: true,
    elements: [
      { data: { id: "root", label: "Root", in_degree: 0, out_degree: 1 } },
      { data: { id: "plain", label: "Plain", in_degree: 1, out_degree: 1 } },
      { data: { id: "term", label: "Term", in_degree: 1, out_degree: 0 } },
      { data: { id: "P", label: "Lane" } },
      {
        data: {
          id: "kid",
          label: "Kid",
          parent: "P",
          in_degree: 0,
          out_degree: 0,
        },
      },
      { data: { id: "e1", source: "root", target: "plain", label: "" } },
      { data: { id: "plainEdge", source: "plain", target: "term", label: "" } },
    ],
  });
  cy.style(styleString as any);
  return cy;
}

/** Each knob: patch applied to the theme + the pstyle assertions it must move. */
const KNOBS: {
  knob: string;
  patch: Partial<FFTheme>;
  expect: {
    ele: "plain" | "plainEdge" | "P";
    prop: string;
    value: string | RegExp;
  }[];
}[] = [
  {
    knob: "fontFamily",
    patch: { fontFamily: "Knob Test Font" },
    expect: [{ ele: "plain", prop: "font-family", value: /Knob Test Font/ }],
  },
  {
    knob: "lineHeight",
    patch: { lineHeight: 1.77 },
    expect: [{ ele: "plain", prop: "line-height", value: "1.77" }],
  },
  {
    knob: "background",
    patch: { background: "#123456" },
    expect: [
      {
        ele: "plainEdge",
        prop: "text-background-color",
        value: /#123456|rgb\(18,\s*52,\s*86\)/i,
      },
      {
        ele: "P",
        prop: "background-color",
        value: /#123456|rgb\(18,\s*52,\s*86\)/i,
      },
    ],
  },
  {
    knob: "shape",
    patch: { shape: "ellipse" },
    expect: [{ ele: "plain", prop: "shape", value: "ellipse" }],
  },
  {
    knob: "textMaxWidth",
    patch: { textMaxWidth: 333 },
    expect: [{ ele: "plain", prop: "text-max-width", value: "333px" }],
  },
  {
    knob: "padding",
    patch: { padding: 47 },
    expect: [{ ele: "plain", prop: "padding", value: "47px" }],
  },
  {
    knob: "borderWidth",
    patch: { borderWidth: 9 },
    expect: [{ ele: "plain", prop: "border-width", value: "9px" }],
  },
  {
    knob: "borderColor",
    patch: { borderWidth: 2, borderColor: "#654321" },
    expect: [
      {
        ele: "plain",
        prop: "border-color",
        value: /#654321|rgb\(101,\s*67,\s*33\)/i,
      },
    ],
  },
  {
    knob: "nodeBackground",
    patch: { nodeBackground: "#ABCDEF" },
    expect: [
      {
        ele: "plain",
        prop: "background-color",
        value: /#ABCDEF|rgb\(171,\s*205,\s*239\)/i,
      },
    ],
  },
  {
    knob: "nodeForeground",
    patch: { nodeForeground: "#FEDCBA" },
    expect: [
      {
        ele: "plain",
        prop: "color",
        value: /#FEDCBA|rgb\(254,\s*220,\s*186\)/i,
      },
    ],
  },
  {
    knob: "textMarginY",
    patch: { textMarginY: 13 },
    expect: [{ ele: "plain", prop: "text-margin-y", value: "13px" }],
  },
  {
    knob: "useFixedHeight",
    patch: { useFixedHeight: true, fixedHeight: 123 },
    expect: [{ ele: "plain", prop: "height", value: "123px" }],
  },
  {
    knob: "curveStyle",
    patch: { curveStyle: "taxi" },
    expect: [{ ele: "plainEdge", prop: "curve-style", value: "taxi" }],
  },
  {
    knob: "edgeWidth",
    patch: { edgeWidth: 11 },
    expect: [{ ele: "plainEdge", prop: "width", value: "11px" }],
  },
  {
    knob: "edgeColor",
    patch: { edgeColor: "#0F1E2D" },
    expect: [
      {
        ele: "plainEdge",
        prop: "line-color",
        value: /#0F1E2D|rgb\(15,\s*30,\s*45\)/i,
      },
      {
        ele: "plainEdge",
        prop: "target-arrow-color",
        value: /#0F1E2D|rgb\(15,\s*30,\s*45\)/i,
      },
    ],
  },
  {
    knob: "sourceArrowShape",
    patch: { sourceArrowShape: "circle" },
    expect: [{ ele: "plainEdge", prop: "source-arrow-shape", value: "circle" }],
  },
  {
    knob: "targetArrowShape",
    patch: { targetArrowShape: "triangle-backcurve" },
    expect: [
      {
        ele: "plainEdge",
        prop: "target-arrow-shape",
        value: "triangle-backcurve",
      },
    ],
  },
  {
    knob: "arrowScale",
    patch: { arrowScale: 2.5 },
    expect: [{ ele: "plainEdge", prop: "arrow-scale", value: "2.5" }],
  },
  {
    knob: "sourceDistanceFromNode",
    patch: { sourceDistanceFromNode: 17 },
    expect: [
      { ele: "plainEdge", prop: "source-distance-from-node", value: "17px" },
    ],
  },
  {
    knob: "targetDistanceFromNode",
    patch: { targetDistanceFromNode: 19 },
    expect: [
      { ele: "plainEdge", prop: "target-distance-from-node", value: "19px" },
    ],
  },
  {
    knob: "edgeTextSize",
    patch: { edgeTextSize: 2 },
    expect: [{ ele: "plainEdge", prop: "font-size", value: "32px" }],
  },
  {
    knob: "rotateEdgeLabel",
    patch: { rotateEdgeLabel: true },
    expect: [{ ele: "plainEdge", prop: "text-rotation", value: "autorotate" }],
  },
];

describe.each(templates)("theme editor contract: %s", (name) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod: TemplateModule = require(`./${name}-template`);

  test.each(KNOBS)(
    "$knob knob reaches the graph",
    ({ patch, expect: expects }) => {
      const theme: FFTheme = { ...mod.theme, ...patch };
      const cy = makeCy(composeStyle(theme, mod.cytoscapeStyle));
      try {
        for (const { ele, prop, value } of expects) {
          // pstyle is internal (returns the parsed property); not in the typings
          const el = cy.getElementById(ele) as any;
          const actual = el.pstyle(prop)?.strValue ?? "";
          if (value instanceof RegExp) {
            expect(`${prop}=${actual}`).toMatch(value);
          } else {
            expect(`${prop}=${actual}`).toBe(`${prop}=${value}`);
          }
        }
      } finally {
        cy.destroy();
      }
    }
  );
});
