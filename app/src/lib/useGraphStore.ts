import { create } from "zustand";

import { GraphOptionsObject } from "./constants";

type StoreGraph = {
  layout: GraphOptionsObject["layout"];
  elements: cytoscape.ElementDefinition[];
  sponsorLayoutsLoaded: boolean;
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
  sponsorLayoutsLoaded: false,
}));
