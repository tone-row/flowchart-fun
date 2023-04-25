import produce from "immer";

import { getNodePositionsFromCy } from "../components/getNodePositionsFromCy";
import { useDoc } from "./useDoc";
import { useGraphStore } from "./useGraphStore";

export function toggleDocFrozen() {
  useDoc.setState(
    (state) => {
      return produce(state, (draft) => {
        if (draft.meta.isFrozen) {
          delete draft.meta.isFrozen;
        } else {
          draft.meta.isFrozen = true;
          // get node positions
          draft.meta.nodePositions = getNodePositionsFromCy();
        }
      });
    },
    false,
    "unfreezeDoc"
  );
}

/**
 * Whether the graph is fully frozen
 */
export function useIsFrozen() {
  return useDoc((state) => state.meta?.isFrozen ?? false);
}

export function getIsFrozen() {
  return useDoc.getState().meta?.isFrozen ?? false;
}

/**
 * Whether the graph has individually-fixed nodes in it
 */
export function useHasFixedNodes() {
  const elements = useGraphStore((state) => state.elements);
  // check if any have the class fixed
  return elements.some((el) => el.classes?.includes("fixed"));
}
