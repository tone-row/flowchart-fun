import { parse, ParseError } from "graph-selector";
import { isError } from "./helpers";

/**
 * Given some text, this function checks if it is valid
 * Flowchart Fun Syntax. If it is valid, it returns null.
 * If it is not valid, it attemps to repair the text.
 *
 * Pass the document text around a paste as `context` so the paste is
 * judged where it landed: an edge label is only valid under a parent.
 */
export function repairText(
  text: string,
  context: { before: string; after: string } = { before: "", after: "" }
) {
  let newText: string | null = null,
    hasError = true,
    count = 0;

  const firstLine = context.before.split("\n").length;
  const lastLine = firstLine + text.split("\n").length - 1;

  while (hasError && count < 10) {
    count++;
    try {
      parse(context.before + getText() + context.after);
      hasError = false;
    } catch (error) {
      if (
        error instanceof ParseError &&
        (error.startLineNumber < firstLine || error.startLineNumber > lastLine)
      ) {
        break;
      }
      if (isError(error)) {
        if (error.message.includes("pointer")) {
          newText = getText().replace(/[()]/g, "\\$&");
        } else if (error.message.includes("label without parent")) {
          newText = getText().replace(/:/g, "\\:");
        } else if (error.message.includes("missing indentation")) {
          newText = getText().replace(/:/g, "\\:");
        } else {
          console.log(error.message);
        }
      }
    }
  }
  return newText;

  function getText() {
    return newText ? newText : text;
  }
}
