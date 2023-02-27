import { getDoc, setDocImmer } from "./docHelpers";
import { getLayout } from "./getLayout";

export function unfreezeDoc() {
  setDocImmer((draft) => {
    delete draft.meta.nodePositions;
  }, "unfreezeDoc");
}

export function useIsFrozen() {
  const doc = getDoc();
  const rendered = getLayout(doc);
  const frozen = "positions" in rendered;

  return frozen;
}
