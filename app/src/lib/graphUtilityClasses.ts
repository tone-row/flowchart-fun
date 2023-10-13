import { StylesheetCSS } from "cytoscape";

export const shapes: cytoscape.Css.Node["shape"][] = [
  "rectangle",
  "roundrectangle",
  "ellipse",
  "triangle",
  "pentagon",
  "hexagon",
  "heptagon",
  "octagon",
  "star",
  "barrel",
  "diamond",
  "vee",
  "rhomboid",
  // @ts-ignore
  "right-rhomboid",
  "polygon",
  "tag",
  "round-rectangle",
  "cut-rectangle",
  "bottom-round-rectangle",
  "concave-hexagon",
];

export const childlessShapeClasses: StylesheetCSS[] = shapes.map((shape) => ({
  selector: `:childless.shape_${shape}`,
  css: {
    shape,
  },
}));

const arrowSuffixes = [
  "triangle",
  "triangle-tee",
  "circle-triangle",
  "triangle-cross",
  "triangle-backcurve",
  "vee",
  "tee",
  "square",
  "circle",
  "diamond",
  "chevron",
  "none",
];

export const sourceArrowSuffixes = arrowSuffixes.map(
  (suffix) => `source-${suffix}` as cytoscape.Css.ArrowShape
);

export const targetArrowSuffixes = arrowSuffixes.map(
  (suffix) => `target-${suffix}` as cytoscape.Css.ArrowShape
);

export const edgeStyleClasses: StylesheetCSS[] = [
  {
    selector: "edge.border_dashed",
    css: {
      "line-style": "dashed",
    },
  },
  {
    selector: "edge.border_dotted",
    css: {
      "line-style": "dotted",
    },
  },
  {
    selector: "edge.border_solid",
    css: {
      "line-style": "solid",
    },
  },
];

export const nodeBorderClasses: StylesheetCSS[] = [
  {
    selector: ":childless.border_solid",
    css: {
      "border-style": "solid",
    },
  },
  {
    selector: ":childless.border_dashed",
    css: {
      "border-style": "dashed",
    },
  },
  {
    selector: ":childless.border_dotted",
    css: {
      "border-style": "dotted",
    },
  },
  {
    selector: ":childless.border_double",
    css: {
      "border-style": "double",
    },
  },
  {
    selector: ":childless.border_none",
    css: {
      "border-width": 0,
    },
  },
];
