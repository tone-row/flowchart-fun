/**
 * This file will contain all the helpers which mutation the document
 *
 * It will use the doc details to know whether to mutate a zustand store
 * or a yjs document
 */

import produce from "immer";
import { WritableDraft } from "immer/dist/internal";

import { Doc, useDetailsStore, useDoc } from "./useDoc";

/**
 * Full or partial doc mutation using spread operator
 */
export function setDoc(
  doc: Partial<Doc> | ((doc: Doc) => Partial<Doc>),
  description: string
) {
  const isHosted = useDetailsStore.getState().isHosted;
  // mutate the doc
  if (isHosted) {
    // mutate the yjs document
    console.debug("mutating yjs document", doc, description);
  } else {
    // mutate the zustand store
    useDoc.setState(
      typeof doc === "function"
        ? doc
        : (cur) => ({
            ...cur,
            ...doc,
          }),
      false,
      description
    );
  }
}

type SetDocImmerCallback = (draft: WritableDraft<Doc>) => void;

export function setDocImmer(cb: SetDocImmerCallback, description: string) {
  const isHosted = useDetailsStore.getState().isHosted;
  // mutate the doc
  if (isHosted) {
    // mutate the yjs document
    console.debug("mutating yjs document", description);
  } else {
    // mutate the zustand store
    useDoc.setState((cur) => produce(cur, cb), false, description);
  }
}

export function subscribeToDoc(cb: (doc: Doc) => void) {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    // subscribe to yjs document
    console.debug("subscribing to yjs document");
    return () => console.debug("unsubscribing from yjs document");
  } else {
    // subscribe to zustand store
    return useDoc.subscribe(cb);
  }
}

export function getDoc(): Doc {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    // get the yjs document
    console.debug("getting yjs document");
    return {} as Doc;
  } else {
    // get the zustand store
    return useDoc.getState();
  }
}
