import { Stylesheet } from "cytoscape";

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

export const edgeLineStyles: Stylesheet[] = [
  {
    selector: "edge.dashed",
    style: {
      "line-style": "dashed",
    },
  },
  {
    selector: "edge.dotted",
    style: {
      "line-style": "dotted",
    },
  },
  {
    selector: "edge.solid",
    style: {
      "line-style": "solid",
    },
  },
];

export const borderStyles: Stylesheet[] = [
  {
    selector: "node.border-solid",
    style: {
      "border-style": "solid",
    },
  },
  {
    selector: "node.border-dashed",
    style: {
      "border-style": "dashed",
    },
  },
  {
    selector: "node.border-dotted",
    style: {
      "border-style": "dotted",
    },
  },
  {
    selector: "node.border-double",
    style: {
      "border-style": "double",
    },
  },
  {
    selector: "node.border-none",
    style: {
      "border-width": 0,
    },
  },
];
