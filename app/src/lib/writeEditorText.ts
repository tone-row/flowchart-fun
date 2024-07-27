import type { editor } from "monaco-editor";
import { useDoc } from "./useDoc";

/**
 * This function takes a reference to the editor and a string and a speed
 * and animates the text being written to the editor one line at a time.
 * It now checks for a query parameter to skip animation for e2e tests.
 */
export function writeEditorText(
  interval: NodeJS.Timeout | null,
  editor: editor.IStandaloneCodeEditor,
  text: string,
  speed: number = 1500 / 10
) {
  // Check for e2e test query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const skipAnimation = urlParams.get("skipAnimation") === "true";

  if (skipAnimation) {
    // For e2e tests, set the text immediately and return
    useDoc.setState({ text });
    return;
  }

  // Bind focus event to handle the text being written
  editor.onDidFocusEditorText(() => {
    if (interval) clearInterval(interval);
  });

  let lines = text.split("\n");
  let index = 0;
  interval = setInterval(() => {
    if (index < lines.length) {
      editor.executeEdits("", [
        {
          range: editor.getModel()!.getFullModelRange(),
          text: lines.slice(0, index + 1).join("\n"),
        },
      ]);
      index++;
    } else {
      if (interval) clearInterval(interval);
    }
  }, speed);
}
