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
  ]);
