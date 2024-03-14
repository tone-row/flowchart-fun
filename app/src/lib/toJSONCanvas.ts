import cytoscape, { Core } from "cytoscape";

interface GenericNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

interface TextNode extends GenericNode {
  text: string;
}

interface FileNode extends GenericNode {
  file: string;
  subpath?: string;
}

interface LinkNode extends GenericNode {
  url: string;
}

interface GroupNode extends GenericNode {
  label?: string;
  background?: string;
  backgroundStyle?: "cover" | "ratio" | "repeat";
}

type Side = "top" | "right" | "bottom" | "left";

interface Edge {
  id: string;
  fromNode: string;
  fromSide?: Side;
  fromEnd?: "none" | "arrow";
  toNode: string;
  toSide?: Side;
  toEnd?: "none" | "arrow";
  color?: string;
  label?: string;
}

interface JSONCanvas {
  nodes?: Array<TextNode | FileNode | LinkNode | GroupNode>;
  edges?: Edge[];
}

const HEIGHT_PAD = 46;

export function toJSONCanvas(cy: Core): JSONCanvas {
  const jsonCanvas: JSONCanvas = {
    nodes: [],
    edges: [],
  };

  cy.nodes().forEach((node) => {
    const position = node.position();
    const data = node.data();

    // Assuming 'group' nodes are represented in cytoscape with a 'parent' field
    const type = node.isParent() ? "group" : "text";

    const genericNode: TextNode = {
      id: node.id(),
      type,
      x: position.x,
      y: position.y,
      width: Math.round(node.width() + HEIGHT_PAD),
      height: Math.round(node.height() + HEIGHT_PAD),
      text: data.label,
    };

    // get the node rendered background color
    const renderedStyle = node.renderedStyle();
    const backgroundColor = renderedStyle.backgroundColor;
    if (backgroundColor !== "transparent") {
      const hex = rgbToHex(backgroundColor);
      if (hex !== "#ffffff") {
        genericNode.color = hex;
      }
    }

    jsonCanvas.nodes?.push({
      ...genericNode,
    });
  });

  cy.edges().forEach((edge) => {
    const data = edge.data();

    const { fromSide, toSide } = getSideFromEndpoints(edge);

    jsonCanvas.edges?.push({
      id: edge.id(),
      fromNode: data.source,
      toNode: data.target,
      // color: data.color ? { color: data.color } : undefined,
      label: data.label,
      fromSide,
      toSide,
      fromEnd: data.fromEnd,
      toEnd: data.toEnd,
    });
  });

  return jsonCanvas;
}

type Direction = "down" | "left" | "right" | "up";

/**
 * Use the sourceEndpoint and targetEndpoint
 * to determine if the edge is more right, down, left, or up,
 * and return the according fromSide and toSide
 */
function getSideFromEndpoints(edge: cytoscape.EdgeSingular): {
  fromSide: Side;
  toSide: Side;
} {
  const source = getBoundingBox(edge.source());
  const target = getBoundingBox(edge.target());

  // Give a score to each direction based on the distance
  // of opposite sides of the source and target nodes
  const scores: Record<Direction, number> = {
    down: target.top - source.bottom,
    left: source.left - target.right,
    right: target.left - source.right,
    up: source.top - target.bottom,
  };

  // Get the direction with the highest score
  const maxScore = Math.max(...Object.values(scores));
  const direction = Object.keys(scores).find(
    (direction) => scores[direction as Direction] === maxScore
  ) as Direction;

  // Return the fromSide and toSide based on the direction
  switch (direction) {
    case "down":
      return { fromSide: "bottom", toSide: "top" };
    case "left":
      return { fromSide: "left", toSide: "right" };
    case "right":
      return { fromSide: "right", toSide: "left" };
    case "up":
      return { fromSide: "top", toSide: "bottom" };
  }
}

/**
 * Given a node, get the top-left corner of the node
 * and the bottom-right corner of the node and return
 * an object with top, left, bottom, and right properties
 */
function getBoundingBox(node: cytoscape.NodeSingular): {
  top: number;
  left: number;
  bottom: number;
  right: number;
} {
  const position = node.position();
  const width = node.width();
  const height = node.height();

  return {
    top: position.y,
    left: position.x,
    bottom: position.y + height,
    right: position.x + width,
  };
}

/**
 * Converts an rgb string in the format rgb(255,255,255)
 * to a hex string in the format #ffffff
 */
function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb
    .match(/\d+/g)!
    .map((value) => parseInt(value, 10).toString(16).padStart(2, "0"));
  return `#${r}${g}${b}`;
}
