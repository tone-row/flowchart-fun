import { css2Colors, shapes } from "./graphUtilityClasses";
import { StoreGraph } from "./store.graph";
import { isEdge } from "./utils";

export function toMermaidJS({
  layout,
  elements,
}: {
  layout: StoreGraph["layout"];
  elements: StoreGraph["elements"];
}) {
  if (!elements.length) return "";

  const styleLines: string[] = [];
  const lines = [`flowchart${layout?.rankDir ? ` ${layout.rankDir}` : ""}`];
  const [nodes, edges] = elements.reduce<
    [StoreGraph["elements"], StoreGraph["elements"]]
  >(
    ([nodes, edges], element) => {
      if (isEdge(element)) {
        edges.push(element);
      } else {
        nodes.push(element);
      }
      return [nodes, edges];
    },
    [[], []]
  );

  for (const node of nodes) {
    const { classes = "", data } = node;
    const { id, label } = data;
    if (!id) continue;
    const safeId = id.replace(/[^a-zA-Z0-9]/g, "_");

    // find shape
    const shape = classes
      .split(" ")
      .find((c) => [...shapes, "circle"].includes(c as typeof shapes[number]));
    const backgroundColor = classes.split(" ").find((c) => c.startsWith("bg-"));
    const color = classes.split(" ").find((c) => c.startsWith("color-"));
    const [before, after] = labelDelimiterFromShape(
      shape as cytoscape.Css.Node["shape"]
    );
    lines.push(`\t${safeId}${before}"${label || " "}"${after}`);
    // Add Style
    if (color || backgroundColor)
      styleLines.push(getStyle({ id: safeId, color, backgroundColor }));
  }

  for (const edge of edges) {
    const { source, target, label } = edge.data;
    const safeSource = source.replace(/[^a-zA-Z0-9]/g, "_");
    const safeTarget = target.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(
      `\t${safeSource} -${label ? `- "${label}" -` : ""}-> ${safeTarget}`
    );
  }

  return lines.concat(styleLines).join("\n");
}

function labelDelimiterFromShape(
  shape: cytoscape.Css.Node["shape"] | undefined
): [string, string] {
  if (!shape) return ["[", "]"];
  switch (shape) {
    case "roundrectangle":
    case "round-rectangle":
      return ["(", ")"];
    case "ellipse":
      return ["([", "])"];
    case "circle":
      return ["((", "))"];
    case "diamond":
      return ["{", "}"];
    case "hexagon":
      return ["{{", "}}"];
    case "rhomboid":
      return ["[\\", "\\]"];
    default:
      return ["[", "]"];
  }
}

function getStyle({
  id,
  color,
  backgroundColor,
}: {
  id: string;
  color?: string;
  backgroundColor?: string;
}) {
  const style = [];
  if (color && css2Colors[color.slice(6) as keyof typeof css2Colors]) {
    style.push(
      `color:${css2Colors[color.slice(6) as keyof typeof css2Colors]}`
    );
  }
  if (
    backgroundColor &&
    css2Colors[backgroundColor.slice(3) as keyof typeof css2Colors]
  ) {
    style.push(
      `fill:${css2Colors[backgroundColor.slice(3) as keyof typeof css2Colors]}`
    );
  }
  // add initial space
  return style.length ? `style ${id} ${style.join(",")}` : "";
}
