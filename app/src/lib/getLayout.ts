import { defaultLayout } from "./constants";
import { hasOwnProperty } from "./helpers";
import { Doc } from "./prepareChart";

/**
 * Reads what's stored in the doc.meta.layout option
 * and merges it with the default layout, plus does some
 * extra processing to make sure the layout is valid (for elk, preset)
 */
export function getLayout(doc: Doc) {
  const { meta } = doc;
  // Using any type so layout is permissive
  let layout = {} as any;
  if (hasOwnProperty(meta, "layout") && meta.layout) {
    layout = { ...meta.layout };
  }
  let name = defaultLayout.name as string;
  if (
    hasOwnProperty(layout, "name") &&
    layout.name &&
    typeof layout.name === "string"
  ) {
    name = layout.name;
  }
  if (name.startsWith("elk-")) {
    layout.name = "elk";
    layout.elk = { algorithm: name.slice(4) };
  }

  const layoutToReturn = { ...defaultLayout, ...layout };

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
