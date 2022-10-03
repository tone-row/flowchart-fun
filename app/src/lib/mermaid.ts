import { GraphOptionsObject } from "./constants";
import { shapes } from "./graphUtilityClasses";
import { originalColors } from "./themes/original";
import { isEdge } from "./utils";

export function toMermaidJS({
  layout,
  elements,
}: {
  layout: GraphOptionsObject["layout"];
  elements: cytoscape.ElementDefinition[];
}) {
  if (!elements.length) return "";

  const styleLines: string[] = [];
  const lines = [`flowchart${layout?.rankDir ? ` ${layout.rankDir}` : ""}`];
  const [nodes, edges] = elements.reduce<
    [cytoscape.ElementDefinition[], cytoscape.ElementDefinition[]]
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

  function getSafe(s: string) {
    return s.replace(/\s+/g, "_");
  }

  for (const node of nodes) {
    const { classes = "", data } = node;
    const { id, label } = data;
    if (!id) continue;
    const safeId = getSafe(id);

    // find shape
    const shape = classes
      .split(" ")
      .find((c) => [...shapes, "circle"].includes(c as typeof shapes[number]));
    const backgroundColor = classes.split(" ").find((c) => c.startsWith("bg-"));
    const color = classes.split(" ").find((c) => c.startsWith("color-"));
    const [before, after] = labelDelimiterFromShape(
      shape as cytoscape.Css.Node["shape"]
    );
    lines.push(`\t${safeId}${before}"${getSafeLabel(label) || " "}"${after}`);
    // Add Style
    if (color || backgroundColor)
      styleLines.push(getStyle({ id: safeId, color, backgroundColor }));
  }

  for (const edge of edges) {
    const { source, target, label } = edge.data;
    const safeSource = getSafe(source);
    const safeTarget = getSafe(target);
    const safeLabel = getSafeLabel(label);
    lines.push(
      `\t${safeSource} -${
        safeLabel ? `- "${safeLabel}" -` : ""
      }-> ${safeTarget}`
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
  if (color && originalColors[color.slice(6) as keyof typeof originalColors]) {
    style.push(
      `color:${originalColors[color.slice(6) as keyof typeof originalColors]}`
    );
  }
  if (
    backgroundColor &&
    originalColors[backgroundColor.slice(3) as keyof typeof originalColors]
  ) {
    style.push(
      `fill:${
        originalColors[backgroundColor.slice(3) as keyof typeof originalColors]
      }`
    );
  }
  // add initial space
  return style.length ? `style ${id} ${style.join(",")}` : "";
}

function getSafeLabel(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
