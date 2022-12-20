import { defaultLayout } from "./constants";
import { Doc } from "./prepareChart";

/**
 * This version does the same thing, but from the
 * meta object of the Doc
 */
export function getLayout(doc: Doc) {
  const { meta } = doc;
  const { nodePositions } = meta as any;
  const layout = { ...(meta.layout || {}) } as any;
  const { name = defaultLayout.name } = layout;
  if (!name) return;
  if (name.startsWith("elk-")) {
    layout.name = "elk";
    layout.elk = { algorithm: name.slice(4) };
  }

  const layoutToReturn = { ...defaultLayout, ...layout };

  if (nodePositions) {
    layoutToReturn.positions = nodePositions;
    layoutToReturn.name = "preset";
  }

  if (layoutToReturn.name === "preset" && layoutToReturn.spacingFactor) {
    delete layoutToReturn.spacingFactor;
  }

  // return layout shallow-merged with default layout
  return layoutToReturn;
}
