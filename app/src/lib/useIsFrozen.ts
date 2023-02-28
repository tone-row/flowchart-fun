import { getDoc, setMetaImmer } from "./docHelpers";
import { getLayout } from "./getLayout";

export function unfreezeDoc() {
  setMetaImmer((draft) => {
    delete draft.nodePositions;
  }, "unfreezeDoc");
}

export function useIsFrozen() {
  const doc = getDoc();
  const rendered = getLayout(doc);
  const frozen = "positions" in rendered;

  return frozen;
}
