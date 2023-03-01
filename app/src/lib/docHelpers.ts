/**
 * This file will contain all the helpers which mutation the document
 *
 * It will use the doc details to know whether to mutate a zustand store
 * or a yjs document
 */

import produce from "immer";
import { WritableDraft } from "immer/dist/internal";
import { useEffect, useState } from "react";

import { getSafeYDoc } from "./realtime";
import { Doc, useDetailsStore, useDoc } from "./useDoc";

/**
 * Full or partial doc mutation using spread operator
 */
export function setDoc(doc: Partial<Doc>, description: string) {
  const isHosted = useDetailsStore.getState().isHosted;
  // mutate the doc
  if (isHosted) {
    const ydoc = getSafeYDoc();
    if (!ydoc) return;
    const { text, meta } = doc;
    ydoc.transact(() => {
      if (text) {
        const ytext = ydoc.getText("text");
        if (ytext) {
          ytext.delete(0, ytext.length);
          ytext.insert(0, text);
        }
      }
      if (meta) {
        const ymeta = ydoc.getMap("meta");
        if (ymeta) {
          for (const [key, value] of Object.entries(meta)) {
            ymeta.set(key, value);
          }
          // delete any keys that were removed
          for (const key of Object.keys(ymeta.toJSON())) {
            if (!(key in meta)) {
              ymeta.delete(key);
            }
          }
        }
      }
    });
  } else {
    // mutate the zustand store
    useDoc.setState(
      (cur) => ({
        ...cur,
        ...doc,
      }),
      false,
      description
    );
  }
}

export function setMetaImmer(
  cb: (draft: WritableDraft<Doc["meta"]>) => void,
  description: string
) {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    const ydoc = getSafeYDoc();
    if (!ydoc) return;
    const meta = ydoc.getMap("meta");
    if (!meta) return;
    const fullMeta = meta.toJSON();
    const newMeta = produce(fullMeta, cb);
    ydoc.transact(() => {
      for (const [key, value] of Object.entries(newMeta)) {
        meta.set(key, value);
      }
      // delete any keys that were removed
      for (const key of Object.keys(fullMeta)) {
        if (!(key in newMeta)) {
          meta.delete(key);
        }
      }
    });
  } else {
    useDoc.setState(
      (cur) => ({
        ...cur,
        meta: produce(cur.meta, cb),
      }),
      false,
      description
    );
  }
}

/**
 * Implicitly sets the doc text
 *
 * This is different than setDoc above, because setDoc actually
 * ignores text changes, presuming that they are coming from Monaco
 */
export function setDocText(text: string, description: string) {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    const ydoc = getSafeYDoc();
    if (!ydoc) return;
    const ytext = ydoc.getText("text");
    if (!ytext) return;
    ydoc.transact(() => {
      if (!ytext) return;
      ytext.delete(0, ytext.length);
      ytext.insert(0, text);
    });
  } else {
    useDoc.setState((cur) => ({ ...cur, text }), false, description);
  }
}

export function subscribeToDoc(cb: (doc: Doc) => void) {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    const ydoc = getSafeYDoc();
    if (!ydoc) return;
    const text = ydoc.getText("text");
    const meta = ydoc.getMap("meta");
    if (!text || !meta) return;

    const runCallback = () =>
      cb({
        text: text.toString(),
        meta: meta.toJSON(),
      });

    text.observe(runCallback);
    meta.observe(runCallback);

    return () => {
      text.unobserve(runCallback);
      meta.unobserve(runCallback);
    };
  } else {
    // subscribe to zustand store
    return useDoc.subscribe(cb);
  }
}

export function getDoc(): Doc {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    const ydoc = getSafeYDoc();
    const fallback = { text: "", meta: {} };
    if (!ydoc) return fallback;

    const text = ydoc.getText("text");
    const meta = ydoc.getMap("meta");
    if (!text || !meta) return fallback;

    return {
      text: text.toString(),
      meta: meta.toJSON(),
    };
  } else {
    // get the zustand store
    return useDoc.getState();
  }
}

/**
 * Returns the document text whether it's hosted or local
 *
 * Returns an empty string if the ydoc isn't found
 */
export function getDocText(): string {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    const ydoc = getSafeYDoc();
    if (!ydoc) return "";

    const text = ydoc.getText("text");
    if (!text) return "";

    return text.toString();
  } else {
    // get the zustand store
    return useDoc.getState().text;
  }
}

function getYDocText() {
  const ydoc = getSafeYDoc();
  if (!ydoc) return "";
  const text = ydoc.getText("text");
  if (!text) return "";
  return text.toString();
}

export function useHostedText(): string {
  const [sharedType, setSharedType] = useState(getYDocText());

  useEffect(() => {
    const ydoc = getSafeYDoc();
    if (!ydoc) return;
    const text = ydoc.getText("text");
    if (!text) return;
    setSharedType(getYDocText());
    // subscribe to updates of the shared type
    const updateHandler = () => setSharedType(getYDocText());
    text.observe(updateHandler);
    return () => {
      text.unobserve(updateHandler);
      setSharedType("");
    };
  }, []);

  return sharedType;
}

export function useDocText(): string {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [sharedType, setSharedType] = useState("");

    // @ts-ignore
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const ydoc = getSafeYDoc();
      if (!ydoc) return "";
      const text = ydoc.getText("text");
      if (!text) return "";
      setSharedType(text.toString());

      // subscribe to updates of the shared type
      const updateHandler = () =>
        setSharedType(ydoc.getText("text").toString());
      text.observe(updateHandler);
      return (): void => {
        text.unobserve(updateHandler);
      };
    }, []);

    return sharedType;
  } else {
    // get the zustand store
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDoc((state) => state?.text ?? "");
  }
}

/**
 * Returns the document meta whether it's hosted or local
 * Returns an empty object if the ydoc isn't found
 */
export function useDocMeta(): Record<string, unknown> {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [sharedType, setSharedType] = useState({});

    // @ts-ignore
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const ydoc = getSafeYDoc();
      if (!ydoc) return {};
      const meta = ydoc.getMap("meta");
      if (!meta) return {};
      setSharedType(meta.toJSON());

      // subscribe to updates of the shared type
      const updateHandler = () => setSharedType(ydoc.getMap("meta").toJSON());
      meta.observe(updateHandler);
      return (): void => {
        meta.unobserve(updateHandler);
      };
    }, []);

    return sharedType;
  } else {
    // get the zustand store
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDoc((state) => state.meta);
  }
}

/**
 * A self-updating doc that works for the ydoc
 * and for the temporary-doc zustand store
 */
export function useSafeDoc(): Doc {
  const isHosted = useDetailsStore.getState().isHosted;
  if (isHosted) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDocUpdate();
  } else {
    // get the zustand store
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDoc();
  }
}

/**
 * Watch "text" and "meta" ydoc props and return an updated doc
 * when they change
 */
function useDocUpdate(): Doc {
  const [localDoc, setLocaldoc] = useState<Doc>({ text: "", meta: {} });

  useEffect(() => {
    const ydoc = getSafeYDoc();
    if (!ydoc) return;

    const text = ydoc.getText("text");
    const meta = ydoc.getMap("meta");
    if (!text || !meta) return;

    const updateHandler = () => {
      setLocaldoc({
        text: text.toString(),
        meta: meta.toJSON(),
      });
    };

    text.observe(updateHandler);
    meta.observe(updateHandler);

    return () => {
      text.unobserve(updateHandler);
      meta.unobserve(updateHandler);
    };
  }, []);

  return localDoc;
}
