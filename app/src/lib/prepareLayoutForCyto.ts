import { defaultLayout, GraphOptionsObject } from "./constants";
import { HiddenGraphOptions } from "./helpers";
import { Doc } from "./prepareChart";

/** Expand complex graph options that have
 * been abstracted before they're passed to
 * cytoscape for rendering.
 *
 * For example, the layout named "stress", actually refers
 * to the "elk" layout with an elk algorithm specified.
 **/
export function prepareLayoutForCyto(
  layout: GraphOptionsObject["layout"],
  hiddenGraphOptions: HiddenGraphOptions
): GraphOptionsObject["layout"] {
  if (!layout) return;

  // Fix elk algorithms
  const elkAlgo = getElkAlgo(layout);
  if (elkAlgo) {
    layout.name = "elk";
    if (!layout.elk) layout.elk = {};
    layout.elk.algorithm = elkAlgo;
  }

  // set positions
  if (hiddenGraphOptions?.nodePositions) {
    layout.positions = hiddenGraphOptions.nodePositions;
    layout.name = "preset";
  }

  // If frozen, make sure to remove anything
  // with a negative impact, i.e. spacingFactor
  if (layout.name === "preset" && layout.spacingFactor) {
    delete layout.spacingFactor;
  }

  return layout;
}

function getElkAlgo(layout: NonNullable<GraphOptionsObject["layout"]>): string {
  const { name = "" } = layout;
  if (!name) return "";
  if (name.startsWith("elk-")) return name.slice(4);
  return "";
}

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
