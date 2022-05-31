import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "../lib/constants";
import { HiddenGraphOptions } from "../lib/helpers";

export function getTextAndHiddenGraphOptions(fullText: string) {
  let text = fullText,
    hiddenGraphOptions: HiddenGraphOptions = {};
  if (fullText.includes(HIDDEN_GRAPH_OPTIONS_DIVIDER)) {
    const [textBefore, textAfter] = fullText.split(
      HIDDEN_GRAPH_OPTIONS_DIVIDER
    );
    text = textBefore;
    try {
      hiddenGraphOptions = JSON.parse(textAfter);
    } catch (e) {
      // do nothing
    }
  }
  return { text, hiddenGraphOptions };
}
