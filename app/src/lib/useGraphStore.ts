import create from "zustand";

import { GraphOptionsObject } from "./constants";

export type StoreGraph = {
  layout: GraphOptionsObject["layout"];
  setLayout: (layout: GraphOptionsObject["layout"]) => void;
  elements: cytoscape.ElementDefinition[];
  setElements: (elements: cytoscape.ElementDefinition[]) => void;
  isFrozen: boolean;
  runLayout: boolean;
  setRunLayout: (runLayout: boolean) => void;
  graphUpdateNumber: number;
  /** Trigger a graph update manually with update number */
  incrementGraphUpdateNumber: () => void;
};

export const useGraphStore = create<StoreGraph>((set) => ({
  /** This is only used by conversion to Mermaid */
  layout: undefined,
  setLayout: (layout) => set((state) => ({ ...state, layout })),
  elements: [],
  setElements: (elements) => set((state) => ({ ...state, elements })),
  runLayout: false,
  setRunLayout: (runLayout) => set((state) => ({ ...state, runLayout })),
  isFrozen: false,
  graphUpdateNumber: 0,
  // TODO: examine where this is used... seems hackish
  incrementGraphUpdateNumber: () => {
    set((state) => ({
      ...state,
      graphUpdateNumber: state.graphUpdateNumber + 1,
    }));
  },
}));
