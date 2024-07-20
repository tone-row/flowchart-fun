import type { editor } from "monaco-editor";

/**
 * This function takes a reference to the editor and a string and a speed
 * and animates the text being written to the editor one character at a time.
 */
export function writeEditorText(
  interval: NodeJS.Timeout | null,
  editor: editor.IStandaloneCodeEditor,
  text: string,
  speed: number = 40
) {
  // Bind focus event to handle the text being written
  editor.onDidFocusEditorText(() => {
    if (interval) clearInterval(interval);
  });

  let index = 0;
  interval = setInterval(() => {
    if (index < text.length) {
      // Find the next non-whitespace character
      let nextIndex = index;
      while (nextIndex < text.length && /\s/.test(text[nextIndex])) {
        nextIndex++;
      }
      nextIndex++; // Include the non-whitespace character

      editor.executeEdits("", [
        {
          range: editor.getModel()!.getFullModelRange(),
          text: text.substring(0, nextIndex),
        },
      ]);
      index = nextIndex;
    } else {
      if (interval) clearInterval(interval);
    }
  }, speed);
}
