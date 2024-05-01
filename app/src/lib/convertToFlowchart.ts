import { t } from "@lingui/macro";
import { useEditorStore } from "./useEditorStore";
import { lockZoomToGraph } from "./useGraphStore";
import { setLastResult } from "./usePromptStore";

export const RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";

export async function convertToFlowchart(prompt: string, sid?: string) {
  // store the accumulated text
  let accumulated = "";

  return new Promise<void>((resolve, reject) => {
    fetch("/api/prompt/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sid ? `Bearer ${sid}` : "",
      },
      body: JSON.stringify({ prompt }),
    })
      .then((response) => {
        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          // get reference to the editor
          const editor = useEditorStore.getState().editor;
          if (!editor) {
            throw new Error("Editor not found");
          }

          // Call pushUndoStop before starting the streaming process to mark the beginning of the operation
          editor.pushUndoStop();

          // Get the current model
          const model = editor.getModel();

          if (model) {
            // Clear the editor content using the executeEdits API
            model.pushEditOperations(
              [],
              [
                {
                  range: model.getFullModelRange(),
                  text: "",
                },
              ],
              () => null
            );
          }

          // Lock the zoom to the graph
          lockZoomToGraph();

          const processText = ({
            done,
            value,
          }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
            if (done) {
              setLastResult(accumulated);
              return Promise.resolve();
            }

            // Decode the stream value
            const text = decoder.decode(value, { stream: true });

            accumulated += text;

            if (model) {
              model.pushEditOperations(
                [],
                [
                  {
                    range: model.getFullModelRange(),
                    text: accumulated,
                  },
                ],
                () => null
              );
            }

            // Read some more, and call this function again
            return reader.read().then(processText);
          };

          // Start reading from the stream
          reader
            .read()
            .then(processText)
            .finally(() => {
              // Call pushUndoStop after the streaming process to mark the end of the operation
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
