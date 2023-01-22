import { Stylesheet } from "cytoscape";

import { defaultFontSize } from "./themes/constants";

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
  "polygon",
  "tag",
  "round-rectangle",
  "round-triangle",
  "round-diamond",
  "round-pentagon",
  "round-hexagon",
  "round-heptagon",
  "round-octagon",
  "round-tag",
  "cut-rectangle",
  "bottom-round-rectangle",
  "concave-hexagon",
];

const circle: Stylesheet = {
  selector: ".circle",
  style: {
    shape: "ellipse",
    height: "data(width)",
  },
};

const lineStyles: Stylesheet[] = [
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

const borderStyles: Stylesheet[] = [
  {
    selector: "node.dashed",
    style: {
      "border-style": "dashed",
    },
  },
  {
    selector: "node.dotted",
    style: {
      "border-style": "dotted",
    },
  },
  {
    selector: "node.solid",
    style: {
      "border-style": "solid",
    },
  },
  {
    selector: "node.double",
    style: {
      "border-style": "double",
    },
  },
];

const textSizeStyles: Stylesheet[] = [
  {
    selector: ".text-sm",
    style: {
      "font-size": defaultFontSize * 0.75,
    },
  },
  {
    selector: ".text-lg",
    style: {
      "font-size": defaultFontSize * 1.25,
    },
  },
  {
    selector: ".text-xl",
    style: {
      "font-size": defaultFontSize * 1.5,
    },
  },
];

export const graphUtilityClasses: Stylesheet[] = shapes
  .map<Stylesheet>((shape) => ({
    selector: `.${shape}`,
    style: {
      shape,
    },
  }))
  .concat(circle)
  .concat([
    {
      selector: ".edgeHovered",
      style: {
        "line-opacity": 0.25,
      },
    },
    {
      selector: ".nodeHovered",
      style: {
        opacity: 0.25,
      },
    },
  ])
  .concat(lineStyles)
  .concat(borderStyles)
  .concat(textSizeStyles);

export const baseStyles: Stylesheet[] = [
  {
    selector: "node",
    style: {
      "font-size": defaultFontSize,
    },
  },
  {
    selector: "edge",
    style: {
      "font-size": defaultFontSize,
    },
  },
];
