import { GraphOptionsObject } from "./constants";
import { HiddenGraphOptions } from "./helpers";

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
  const elkAlgo = isElkLayout(layout);
  if (elkAlgo) {
    layout.name = "elk";
    if (!layout.elk) layout.elk = {};
    layout.elk.algorithm = elkAlgo;
  }

  // set positions
  if (hiddenGraphOptions?.nodePositions) {
    layout.positions = hiddenGraphOptions.nodePositions;
  }

  // If frozen, make sure to remove anything
  // with a negative impact, i.e. spacingFactor
  if (layout.name === "preset" && layout.spacingFactor) {
    delete layout.spacingFactor;
  }

  return layout;
}

function isElkLayout(
  layout: NonNullable<GraphOptionsObject["layout"]>
): string {
  const { name = "" } = layout;
  if (!name) return "";
  if (name.startsWith("elk-")) return name.slice(4);
  return "";
}
