import { parse } from "graph-selector";
import { isError } from "./helpers";

/**
 * Given some text, this function checks if it is valid
 * Flowchart Fun Syntax. If it is valid, it returns null.
 * If it is not valid, it attemps to repair the text.
 */
export function repairText(text: string) {
  let newText: string | null = null,
    hasError = true,
    count = 0;

  while (hasError && count < 10) {
    count++;
    try {
      parse(getText());
      hasError = false;
    } catch (error) {
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
