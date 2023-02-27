import { OnMount } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { isError } from "./helpers";
import { logError } from "./sentry";

type IStandAloneCodeEditor = Parameters<OnMount>[0];

export const useYDoc = create<{
  ydoc?: Y.Doc;
  provider?: WebsocketProvider;
}>()(
  devtools(() => ({}), {
    name: "useYDoc",
  })
);

// Create a Yjs document
export function setupYDoc(type: "hosted", id: string) {
  const ydoc = new Y.Doc();

  // Create a provider
  const provider = new WebsocketProvider(
    "ws://localhost:1234",
    `${type}-${id}`,
    ydoc
  );

  // set references in store
  useYDoc.setState({ ydoc, provider });
}

export function initRealtime(editor: IStandAloneCodeEditor) {
  try {
    const ydoc = useYDoc.getState().ydoc;
    const provider = useYDoc.getState().provider;
    if (!ydoc) throw new Error("Y.Doc not found");
    if (!provider) throw new Error("Y.WebsocketProvider not found");

    // Define a shared text type
    const ytext = ydoc.getText("text");
    // Define a shared map type
    // const ymeta = ydoc.getText("meta");

    // Initialize the text if it doesn't match the current text
    // if (ytext.toString() !== text) ytext.insert(0, text);
    // if (ymap.toString() !== JSON.stringify(meta))
    //   ymap.insert(0, JSON.stringify(meta));

    const model = editor.getModel();
    if (!model) throw new Error("Model not found");

    new MonacoBinding(ytext, model, new Set([editor]), provider.awareness);

    // subscribe to doc meta changes and update state
    // useDoc.subscribe(
    //   (doc) => doc.meta,
    //   (meta) => {
    //     ymeta.delete(0, ymeta.length);
    //     ymeta.insert(0, JSON.stringify(meta));
    //   }
    // );

    // when meta changes set doc meta
    // ymeta.observe((event) => {
    //   try {
    //     const str = event.target.toString();
    //     if (str) {
    //       const meta = JSON.parse(str);
    //       useDoc.setState({ meta });
    //     }
    //   } catch (e) {
    //     console.error(e);
    //   }
    // });

    return true;
  } catch (e) {
    console.error(e);
    logError(isError(e) ? e : new Error("Realtime error"));
    return false;
  }
}
