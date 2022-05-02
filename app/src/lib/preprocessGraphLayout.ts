import { GraphOptionsObject } from "./constants";

/** Expand complex graph options that have
 * been abstracted before they're passed to
 * cytoscape for rendering.
 *
 * For example, the layout named "stress", actually refers
 * to the "elk" layout with an elk algorithm specified.
 **/
export function preprocessGraphLayout(
  layout: GraphOptionsObject["layout"]
): GraphOptionsObject["layout"] {
  if (!layout) return;

  // Fix elk algorithms
  const elkAlgo = isElkLayout(layout);
  if (elkAlgo) {
    layout.name = "elk";
    if (!layout.elk) layout.elk = {};
    layout.elk.algorithm = elkAlgo;
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
