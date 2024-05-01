import { t } from "@lingui/macro";
import { useEditorStore } from "./useEditorStore";
import { lockZoomToGraph } from "./useGraphStore";

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
            if (done) return Promise.resolve();

            const chunk = decoder.decode(value, { stream: true });

            // Get SSE events from the chunk
            const events = chunk.split("\n");

            const model = editor.getModel();

            // Process each event
            for (const event of events) {
              if (!event) {
                continue;
              }

              // Slice of '0:' to remove the event name
              const data = event.slice(2);

              try {
                // parse it as a string
                const parsed = JSON.parse(data);

                // Append the new chunk to the editor content using executeEdits API
                if (model) {
                  accumulated += parsed;

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
              } catch (error) {
                console.error("Failed to parse event:", error);
              }
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
