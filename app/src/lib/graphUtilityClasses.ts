import { StylesheetCSS } from "cytoscape";
import { BuiltinStyleClass, styleClasses } from "shared";

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

childlessShapeClasses.push({
  selector: ":childless.shape_iso-trapezoid",
  css: {
    shape: "polygon",
    "shape-polygon-points": "-1 1  1 1  0.5 -1  -0.5 -1",
  },
});

export const edgeStyleClasses: StylesheetCSS[] = [
  {
    // taxi and straight edges have no offset, so several edges on one node
    // pair draw as one line; bezier is the curve style cytoscape bundles
    selector: "edge[parallel > 1]",
    css: {
      "curve-style": "bezier",
    },
  },
  {
    selector: "edge[parallel > 2]",
    css: {
      "control-point-step-size": 90,
    },
  },
  ...styleClasses
    .filter(
      (c): c is BuiltinStyleClass =>
        c.owner === "builtin" && c.element === "edge"
    )
    .map(({ name, style }) => ({
      selector: `edge.${name}`,
      css: style as any,
    })),
];

const borders = ["solid", "dashed", "dotted", "double"];

/**
 * When default nodes have no border width, we need a given width
 * to know what to set the border width to.
 */
export function createSmartChildlessBorderClasses(
  width: number
): StylesheetCSS[] {
  return [
    { selector: ":childless.border_none", css: { "border-width": 0 } },
    ...borders.map((border) => ({
      selector: `:childless.border_${border}`,
      css: {
        "border-width": width,
        "border-style": border as any,
      },
    })),
  ];
}
