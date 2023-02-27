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
  const providerUrl = process.env.REACT_APP_WEBSOCKET_PROVIDER;
  if (!providerUrl) throw new Error("REACT_APP_WEBSOCKET_PROVIDER not found");

  const ydoc = new Y.Doc();

  // Create a provider
  const provider = new WebsocketProvider(providerUrl, `${type}-${id}`, ydoc);

  // set references in store
  useYDoc.setState({ ydoc, provider });
}

/**
 * Returns the ydoc if it exists or false if it doesn't
 */
export function getSafeYDoc() {
  const ydoc = useYDoc.getState().ydoc;
  if (!ydoc) {
    logError(new Error("Y.Doc not found"));
    return false;
  }
  return ydoc;
}

export function initRealtime(editor: IStandAloneCodeEditor) {
  try {
    const ydoc = useYDoc.getState().ydoc;
    const provider = useYDoc.getState().provider;
    if (!ydoc) throw new Error("Y.Doc not found");
    if (!provider) throw new Error("Y.WebsocketProvider not found");

    // Define a shared text type
    const ytext = ydoc.getText("text");

    const model = editor.getModel();
    if (!model) throw new Error("Model not found");

    new MonacoBinding(ytext, model, new Set([editor]), provider.awareness);

    return true;
  } catch (e) {
    console.error(e);
    logError(isError(e) ? e : new Error("Realtime error"));
    return false;
  }
}
