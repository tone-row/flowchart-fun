import { Doc } from "./useDoc";

export const defaultLayout: any = {
  name: "dagre",
  // fit: true,
  animate: true,
  spacingFactor: 1.25,
};

// Store default settings for layouts here
const layoutSpecificDefaults: { [key: string]: object } = {
  dagre: {
    rankDir: "TB",
  },
  "cose-bilkent": {
    randomize: false,
    nodeDimensionsIncludeLabels: true,
    quality: "proof",
  },
};

/**
 * Reads what's stored in the doc.meta.layout option
 * and merges it with the default layout, plus does some
 * extra processing to make sure the layout is valid (for elk, preset)
 */
export function getLayout(doc: Doc) {
  const { meta } = doc;

  // Using any type so layout is permissive
  let layout = {} as any;

  // if layout is defined in meta, merge it with the default layout
  if (meta?.layout && typeof meta.layout === "object") {
    layout = { ...meta.layout };
  }

  // if no layout name, use the default
  if (!(layout?.name && typeof layout.name === "string")) {
    layout.name = defaultLayout.name;
  }

  // in some cases, we need to transform the layout name
  if (layout.name.startsWith("elk-")) {
    layout.elk = { algorithm: layout.name.slice(4) };
    layout.name = "elk";
  } else if (layout.name === "cose") {
    layout.name = "cose-bilkent";
  }

  // depending on the layout, grab the layoutSpecificDefaults
  // and merge it with the layout
  const layoutSpecificDefault = layoutSpecificDefaults?.[layout.name] || {};

  const layoutToReturn = {
    ...defaultLayout,
    ...layoutSpecificDefault,
    ...layout,
  };

  // if isFrozen, change to preset layout
  if (meta.isFrozen) {
    layoutToReturn.name = "preset";
  }

  // Forward nodePositions onto layout
  if (meta.nodePositions && typeof meta.nodePositions === "object") {
    layoutToReturn.positions = { ...meta.nodePositions };
  }

  // Remove spacingFactor if using preset layout
  if (layoutToReturn.name === "preset" && layoutToReturn.spacingFactor) {
    delete layoutToReturn.spacingFactor;
  }

  return layoutToReturn;
}

/**
 * Not all auto-layouts work when individual nodes are frozen
 *
 * Store the list of layout names that are valid with partially frozen nodes */
export const validLayoutsForFixedNodes = [
  "dagre",
  "klay",
  "breadthfirst",
  "concentric",
  "circle",
  "grid",
  "preset",
];
