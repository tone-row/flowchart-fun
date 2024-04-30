import { useEditorStore } from "./useEditorStore";
import { lockZoomToGraph } from "./useGraphStore";

export async function convertToFlowchart(prompt: string) {
  return new Promise<void>((resolve, reject) => {
    fetch("/api/prompt/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

          // Clear the editor content by setting an empty value
          editor.getModel()?.setValue("");

          // Lock the zoom to the graph
          lockZoomToGraph();

          let accumulated = "";

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

                // Append the new chunk to the editor content
                if (model) {
                  accumulated += parsed;
                  model.setValue(accumulated);
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
              resolve();
            });
        } else {
          throw new Error("Failed to fetch");
        }
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
        reject(error);
      });
  });
}
