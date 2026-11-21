/**
 * The style classes users type into chart text (`Node .shape_diamond`).
 * This list is a public API: see docs/adr/0001-dsl-style-classes-are-a-public-api.md.
 */
export type StyleClassElement = "node" | "edge";

export type BuiltinStyleClass = {
  name: string;
  element: StyleClassElement;
  owner: "builtin";
  /** Cytoscape computed style the class promises under every template. */
  style: Record<string, string>;
};

export type TemplateStyleClass = {
  name: string;
  element: "node";
  owner: "template";
};

export type StyleClass = BuiltinStyleClass | TemplateStyleClass;

const nodeShapes: [name: string, shape: string][] = [
  ["rectangle", "rectangle"],
  ["roundrectangle", "roundrectangle"],
  ["ellipse", "ellipse"],
  ["triangle", "triangle"],
  ["pentagon", "pentagon"],
  ["hexagon", "hexagon"],
  ["heptagon", "heptagon"],
  ["octagon", "octagon"],
  ["star", "star"],
  ["barrel", "barrel"],
  ["diamond", "diamond"],
  ["vee", "vee"],
  ["rhomboid", "rhomboid"],
  ["right-rhomboid", "right-rhomboid"],
  ["polygon", "polygon"],
  ["tag", "tag"],
  ["round-rectangle", "round-rectangle"],
  ["cut-rectangle", "cut-rectangle"],
  ["bottom-round-rectangle", "bottom-round-rectangle"],
  ["concave-hexagon", "concave-hexagon"],
  ["iso-trapezoid", "polygon"],
  ["square", "rectangle"],
  ["roundsquare", "roundrectangle"],
  ["circle", "ellipse"],
];

const arrowShapes = [
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

/** Node colors. `color_white` is a container-only color in every template, so it is not here. */
export const colorClasses = [
  "color_red",
  "color_orange",
  "color_yellow",
  "color_green",
  "color_blue",
  "color_purple",
  "color_grey",
];

export const styleClasses: StyleClass[] = [
  ...nodeShapes.map(
    ([name, shape]): StyleClass => ({
      name: `shape_${name}`,
      element: "node",
      owner: "builtin",
      style: { shape },
    })
  ),
  ...["solid", "dashed", "dotted", "double"].map(
    (border): StyleClass => ({
      name: `border_${border}`,
      element: "node",
      owner: "builtin",
      style: { "border-style": border },
    })
  ),
  {
    name: "border_none",
    element: "node",
    owner: "builtin",
    style: { "border-width": "0px" },
  },
  ...["solid", "dashed", "dotted"].map(
    (line): StyleClass => ({
      name: `border_${line}`,
      element: "edge",
      owner: "builtin",
      style: { "line-style": line },
    })
  ),
  ...(["source", "target"] as const).reduce<StyleClass[]>(
    (all, end) =>
      all.concat(
        arrowShapes.map(
          (shape): StyleClass => ({
            name: `${end}-${shape}`,
            element: "edge",
            owner: "builtin",
            style: { [`${end}-arrow-shape`]: shape },
          })
        )
      ),
    []
  ),
  ...colorClasses.map(
    (name): StyleClass => ({ name, element: "node", owner: "template" })
  ),
];
