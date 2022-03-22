import create from "zustand";

import { GraphOptionsObject } from "./constants";

export type StoreGraph = {
  layout: GraphOptionsObject["layout"];
  setLayout: (layout: GraphOptionsObject["layout"]) => void;
  elements: cytoscape.ElementDefinition[];
  setElements: (elements: cytoscape.ElementDefinition[]) => void;
  runLayout: boolean;
  setRunLayout: (runLayout: boolean) => void;
};

export const useStoreGraph = create<StoreGraph>((set) => ({
  layout: undefined,
  setLayout: (layout) => set((state) => ({ ...state, layout })),
  elements: [],
  setElements: (elements) => set((state) => ({ ...state, elements })),
  runLayout: true,
  setRunLayout: (runLayout) => set((state) => ({ ...state, runLayout })),
}));
