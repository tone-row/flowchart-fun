import produce from "immer";

import { Doc, useDoc } from "./useDoc";

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
  return isFrozen(doc);
}

function isFrozen(doc: Doc) {
  return doc.meta?.nodePositions !== undefined;
}
