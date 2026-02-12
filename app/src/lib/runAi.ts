import { t } from "@lingui/macro";
import { useEditorStore } from "./useEditorStore";
import { lockZoomToGraph } from "./useGraphStore";
import { setDiff, setLastResult } from "./usePromptStore";
import { useDoc } from "./useDoc";
import { FFTheme } from "./FFTheme";
import { preprocessStyle, getStyleStringFromMeta } from "./preprocessStyle";

export const RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";

/**
 * Writes text to the editor, better than setting text in the doc
 * when streaming back the response.
 */
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
  endpoint,
  prompt,
  sid,
  signal,
}: {
  endpoint: string;
  prompt: string;
  sid?: string;
  signal?: AbortSignal;
}) {
  let accumulated = "";

  if (endpoint === "prompt" || endpoint === "convert") {
    try {
      await loadTemplate(prompt, sid);
    } catch (error) {
      console.error(error);
    }
  }

  return new Promise<string>((resolve, reject) => {
    fetch(`/api/prompt/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: sid ? `Bearer ${sid}` : "",
      },
      body: JSON.stringify({ prompt, document: useDoc.getState().text }),
      signal,
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
            editor.pushUndoStop();
            writeToEditor("");
          }

          const processText = ({
            done,
            value,
          }: ReadableStreamReadResult<Uint8Array>): Promise<void> => {
            if (done) {
              setLastResult(accumulated);
              resolve(accumulated);
              return Promise.resolve();
            }

            const text = decoder.decode(value, { stream: true });
            accumulated += text;

            if (endpoint === "edit") {
              setDiff(accumulated);
            } else {
              writeToEditor(accumulated);
            }

            return reader.read().then(processText).catch(reject);
          };

          reader.read().then(processText).catch(reject);
        } else {
          if (response.status === 429) {
            reject(new Error(RATE_LIMIT_EXCEEDED));
          } else {
            reject(
              new Error(
                t`Sorry, there was an error converting the text to a flowchart. Try again later.`
              )
            );
          }
        }
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          reject(new Error("Operation canceled"));
        } else {
          reject(error);
        }
      });
  });
}

async function loadTemplate(prompt: string, sid?: string) {
  // Choose a template by hitting the /api/prompt/choose-template endpoint
  const response = await fetch("/api/prompt/choose-template", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: sid ? `Bearer ${sid}` : "",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Failed to load template: ${response.statusText}`);
  }

  const { template } = (await response.json()) as { template: string };

  // Dynamic import of the template
  const importTemplate = await import(
    `../lib/templates/${template}-template.ts`
  );
  const theme: FFTheme = importTemplate.theme;
  const cytoscapeStyle: string = importTemplate.cytoscapeStyle ?? "";

  const { meta: _meta } = useDoc.getState();

  const meta = {
    ..._meta,
    cytoscapeStyle,
    themeEditor: theme,
    // Unfreeze the doc
    nodePositions: undefined,
  };

  // Apply theme CSS (font imports, dynamic classes)
  preprocessStyle(getStyleStringFromMeta(meta));

  // Only set meta (theme) — don't set text.
  // The template text is a visual placeholder that gets overwritten by streaming.
  // Setting it would create a spurious undo entry in Monaco.
  useDoc.setState({ meta }, false, "loadTemplate");
}
