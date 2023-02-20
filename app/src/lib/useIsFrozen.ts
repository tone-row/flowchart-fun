import produce from "immer";

import { getLayout } from "./getLayout";
import { useDoc } from "./useDoc";

export function unfreezeDoc() {
  useDoc.setState(
    (state) => {
      return produce(state, (draft) => {
        delete draft.meta.nodePositions;
      });
    },
    false,
    "unfreezeDoc"
  );
}

export function useIsFrozen() {
  const doc = useDoc();
  const rendered = getLayout(doc);
  const frozen = "positions" in rendered;

  return frozen;
}
