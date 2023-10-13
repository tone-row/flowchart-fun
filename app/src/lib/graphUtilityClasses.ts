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

/**
 * These shapes are given the same height as width keeping a 1:1 aspect ratio.
 *
 * In some cases we change the class name because it makes more sense (square, circle)
 */
export const smartShapes: {
  coreShape: string;
  className: string;
}[] = [
  { coreShape: "rectangle", className: "square" },
  { coreShape: "roundrectangle", className: "roundsquare" },
  { coreShape: "ellipse", className: "circle" },
  { coreShape: "star", className: "star" },
  { coreShape: "diamond", className: "diamond" },
  { coreShape: "pentagon", className: "pentagon" },
  { coreShape: "hexagon", className: "hexagon" },
  { coreShape: "heptagon", className: "heptagon" },
  { coreShape: "octagon", className: "octagon" },
];

/**
 * Given the current width we can build these classes, which set a height
 * and the shape.
 */
export function createSmartShapeClasses(width: number): StylesheetCSS[] {
  return smartShapes.map(({ coreShape, className }) => ({
    selector: `:childless.shape_${className}`,
    css: {
      shape: coreShape,
      width: width,
      height: width,
    },
  }));
}

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

const borders = ["none", "solid", "dashed", "dotted", "double"];

/**
 * When default nodes have no border width, we need a given width
 * to know what to set the border width to.
 */
export function createSmartChildlessBorderClasses(
  width: number
): StylesheetCSS[] {
  return borders.map((border) => ({
    selector: `:childless.border_${border}`,
    css: {
      "border-width": width,
      "border-style": border as any,
    },
  }));
}

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
