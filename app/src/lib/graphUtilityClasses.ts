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

/* CSS2 Color Spec */
export const css2Colors = {
  black: "#000000",
  silver: "#c0c0c0",
  gray: "#808080",
  white: "#ffffff",
  maroon: "#800000",
  red: "#ff0000",
  purple: "#800080",
  fuchsia: "#ff00ff",
  green: "#008000",
  lime: "#00ff00",
  olive: "#808000",
  orange: "#ffA500",
  yellow: "#ffff00",
  navy: "#000080",
  blue: "#0000ff",
  teal: "#008080",
  aqua: "#00ffff",
};

export const graphUtilityClasses: Stylesheet[] = shapes
  .map<Stylesheet>((shape) => ({
    selector: `.${shape}`,
    style: {
      shape,
      // ...shapeHelper(shape),
    },
  }))
  .concat(circle)
  .concat(
    Object.entries(css2Colors).map<Stylesheet>(([color, value]) => ({
      selector: `.bg-${color}`,
      style: {
        "background-color": value,
        "background-opacity": 1,
      },
    }))
  )
  .concat(
    Object.entries(css2Colors).map<Stylesheet>(([color, value]) => ({
      selector: `.color-${color}`,
      style: {
        color: value,
      },
    }))
  )
  .concat([
    {
      selector: ".edgeHovered",
      style: {
        opacity: 0.5,
      },
    },
    {
      selector: ".nodeHovered",
      style: {
        opacity: 0.5,
      },
    },
  ]);
