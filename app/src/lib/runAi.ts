import { t } from "@lingui/macro";
import { useEditorStore } from "./useEditorStore";
import { lockZoomToGraph } from "./useGraphStore";
import { setDiff, setLastResult } from "./usePromptStore";
import { useDoc } from "./useDoc";

export const RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";

// New function to handle editor operations
function writeToEditor(text: string) {
  const editor = useEditorStore.getState().editor;
  if (!editor) {
    throw new Error("Editor not found");
  }

  const model = editor.getModel();
  if (!model) {
    throw new Error("Editor model not found");
  }

  model.pushEditOperations(
    [],
    [
      {
        range: model.getFullModelRange(),
        text,
      },
    ],
    () => null
  );
}

/**
 * Runs an AI endpoint and streams the response back into the editor
 */
export async function runAi({
  prompt,
  endpoint,
  sid,
}: {
  prompt: string;
  endpoint: "prompt" | "convert" | "edit";
  sid?: string;
}) {
  let accumulated = "";

  return new Promise<void>((resolve, reject) => {
    fetch(`/api/prompt/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sid ? `Bearer ${sid}` : "",
      },
      body: JSON.stringify({ prompt, document: useDoc.getState().text }),
    })
      .then((response) => {
        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          const editor = useEditorStore.getState().editor;
          if (!editor) {
            throw new Error("Editor not found");
          }

          lockZoomToGraph();

          if (endpoint === "edit") {
            // No setup...
          } else {
            editor.pushUndoStop(); // Make sure you can undo the changes
            writeToEditor(""); // Clear the editor content
          }

          const processText = ({
            done,
            value,
          }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
            if (done) {
              setLastResult(accumulated);
              return Promise.resolve();
            }

            const text = decoder.decode(value, { stream: true });
            accumulated += text;
            if (endpoint === "edit") {
              setDiff(accumulated);
            } else {
              writeToEditor(accumulated);
            }

            return reader.read().then(processText);
          };

          reader
            .read()
            .then(processText)
            .finally(() => {
              editor.pushUndoStop();
              resolve();
            });
        } else {
          if (response.status === 429) {
            reject(new Error(RATE_LIMIT_EXCEEDED));
          }
          reject(
            new Error(
              t`Sorry, there was an error converting the text to a flowchart. Try again later.`
            )
          );
        }
      })
      .catch(reject);
  });
}
