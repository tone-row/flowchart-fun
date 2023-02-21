import { defaultLayout } from "./constants";
import { hasOwnProperty } from "./helpers";
import { Doc } from "./useDoc";

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
  if (hasOwnProperty(meta, "layout") && meta.layout) {
    layout = { ...meta.layout };
  }

  // sanitize layout name
  let name = defaultLayout.name as string;
  if (
    hasOwnProperty(layout, "name") &&
    layout.name &&
    typeof layout.name === "string"
  ) {
    name = layout.name;
  }
  // in some cases, we need to transform the layout name
  if (name.startsWith("elk-")) {
    layout.name = "elk";
    layout.elk = { algorithm: name.slice(4) };
  } else if (name === "cose") {
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

  if (
    hasOwnProperty(meta, "nodePositions") &&
    meta.nodePositions &&
    typeof meta.nodePositions === "object"
  ) {
    layoutToReturn.positions = { ...meta.nodePositions };
    layoutToReturn.name = "preset";
  }

  if (layoutToReturn.name === "preset" && layoutToReturn.spacingFactor) {
    delete layoutToReturn.spacingFactor;
  }

  // return layout shallow-merged with default layout
  return layoutToReturn;
}
