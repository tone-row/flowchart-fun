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
    selector: ".dashed",
    style: {
      "line-style": "dashed",
    },
  },
  {
    selector: ".dotted",
    style: {
      "line-style": "dotted",
    },
  },
  {
    selector: ".solid",
    style: {
      "line-style": "solid",
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
  .concat(lineStyles);

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
