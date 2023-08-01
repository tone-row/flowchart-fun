import { create } from "zustand";

import { GraphOptionsObject } from "./constants";

type StoreGraph = {
  layout: GraphOptionsObject["layout"];
  elements: cytoscape.ElementDefinition[];
  // The items above are used by the mermaid renderer
  // The items below are meant more for client-side state
  // related to the graph component
  /** Whether or not to fit the graph within bounds on render */
  autoFit: boolean;

  /** View on the graph when auto-fit is false */
  zoom?: number;
  /** Pan on the graph when auto-fit is false */
  pan?: cytoscape.Position;
};

/**
 * Layout and Elements are stored after the cy graph is rendered
 * They are only used by the mermaid renderer
 *
 * We can safely do this after the fact, because the mermaid
 * code is only available in the share modal
 */
export const useGraphStore = create<StoreGraph>(() => ({
  layout: {},
  elements: [],
  autoFit: true,
}));
