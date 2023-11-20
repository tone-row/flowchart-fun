const getId = () => (Math.random() + 1).toString(36).substring(2);

const scale = 0.9;

/**
 * Returns the clipboard information to paste the graph into excalidraw
 */
export function toExcalidraw() {
  // Create Elements
  let elements: any[] = [];

  const cy = window.__cy;
  if (!cy) return "";

  // keep a map from our node id's to excalidraw node id's
  const idMap: Record<string, string> = {};

  // Loop over nodes
  cy.nodes().forEach((node) => {
    // get node id
    const id = node.id();
    const excalidrawId = getId();
    idMap[id] = excalidrawId;

    const { x, y } = node.position();
    const { w, h } = node.boundingBox();
    const { label } = node.data();
    const { shape, ...rest } = node.style();
    const nodeType = getNodeType(shape);
    const backgroundColor = rgbToHex(rest["background-color"]);
    const textColor = rgbToHex(rest["color"]);
    const strokeWidth = parsePx(rest["border-width"]);
    const strokeColor =
      strokeWidth === 0 ? "transparent" : rgbToHex(rest["border-color"]);

    elements = [
      ...elements,
      ...createNode({
        text: label,
        y: scale * (y - h / 2),
        x: scale * (x - w / 2),
        width: scale * w,
        height: scale * h,
        nodeType,
        backgroundColor,
        textColor,
        strokeWidth,
        strokeColor,
        excalidrawId,
      }),
    ];
  });

  // Loop over edges
  cy.edges().forEach((edge) => {
    const { source, target, label } = edge.data();
    const fromId = idMap[source];
    const toId = idMap[target];

    // @ts-ignore
    const { srcX, srcY, tgtX, tgtY } = edge._private.rstyle as Record<
      string,
      number
    >;

    const points = [
      [srcX * scale, srcY * scale],
      [tgtX * scale, tgtY * scale],
    ];

    const edgeAndLabel = createEdge({
      fromId,
      toId,
      points,
      // this appears to be some kind of offset
      x: 0,
      y: 0,
      label,
    });

    // add the edge to the elements
    const fromIndex = elements.findIndex((x) => x.id === fromId);
    if (fromIndex > -1) {
      elements[fromIndex].boundElements.push({
        type: "arrow",
        id: edgeAndLabel[0].id,
      });
    }
    const toIndex = elements.findIndex((x) => x.id === toId);
    if (toIndex > -1) {
      elements[toIndex].boundElements.push({
        type: "arrow",
        id: edgeAndLabel[0].id,
      });
    }

    elements = [...elements, ...edgeAndLabel];

    // Need to add arrow to bound elements inside each node, also
  });

  // Build Paste Object
  const result = {
    type: "excalidraw/clipboard",
    elements,
    files: {},
  };

  return JSON.stringify(result);
}

function createNode({
  text,
  x,
  y,
  width,
  height,
  nodeType,
  backgroundColor,
  textColor,
  strokeWidth,
  strokeColor,
  excalidrawId,
}: {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeType: string;
  backgroundColor: string;
  textColor: string;
  strokeWidth: number;
  strokeColor: string;
  excalidrawId: string;
}) {
  const textId = getId();

  return [
    {
      id: excalidrawId,
      type: nodeType,
      x,
      y,
      width,
      height,
      angle: 0,
      strokeColor,
      strokeWidth,
      backgroundColor,
      fillStyle: "solid",
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 },
      isDeleted: false,
      boundElements: [{ type: "text", id: textId }],
      updated: 1698858608230,
      link: null,
      locked: false,
    },
    {
      id: textId,
      type: "text",
      angle: 0,
      strokeColor: textColor,
      backgroundColor: "#f8f9fa",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      isDeleted: false,
      boundElements: null,
      updated: 1698858603606,
      link: null,
      locked: false,
      text,
      fontSize: 16,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      baseline: 14,
      containerId: excalidrawId,
      originalText: text,
      lineHeight: 1.25,
    },
  ];
}

/**
 * Creates an excalidraw edge
 */
function createEdge({
  fromId,
  toId,
  points,
  x,
  y,
  label,
}: {
  fromId: string;
  toId: string;
  points: number[][];
  x: number;
  y: number;
  label: string;
}) {
  const edge = {
    id: getId(),
    type: "arrow",
    x,
    y,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "#f8f9fa",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    isDeleted: false,
    boundElements: null,
    updated: 1698866637577,
    link: null,
    locked: false,
    points,
    lastCommittedPoint: null,
    startBinding: {
      elementId: fromId,
      // focus: 0.10214122173692175,
      gap: 4,
    },
    endBinding: {
      elementId: toId,
      // focus: -0.1396259068336095,
      gap: 4,
    },
    startArrowhead: null,
    endArrowhead: "triangle",
  };

  if (label) {
    const labelNode = {
      id: getId(),
      type: "text",
      x: edge.x,
      y: edge.y,
      angle: 0,
      strokeColor: "#1e1e1e",
      backgroundColor: "#f8f9fa",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      isDeleted: false,
      boundElements: null,
      updated: 1700487763161,
      link: null,
      locked: false,
      text: label,
      fontSize: 16,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      baseline: 20,
      containerId: edge.id,
      originalText: label,
      lineHeight: 1.2,
    };

    return [labelNode, edge];
  }

  return [edge];
}

function getNodeType(shape: string) {
  switch (shape) {
    case "diamond":
      return "diamond";
    default:
      return "rectangle";
  }
}

/**
 * Takes a string in the format rgb(230,57,70) and returns the hex code
 */
function rgbToHex(rgb: string) {
  const [r, g, b] = rgb
    .replace("rgb(", "")
    .replace(")", "")
    .split(",")
    .map((x) => parseInt(x));

  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

/**
 * Parses 1px to 1 integer
 */
function parsePx(px: string) {
  return parseInt(px.replace("px", ""));
}
