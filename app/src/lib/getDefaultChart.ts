import { cytoscapeStyle } from "../lib/themes/original";
import { getDefaultText } from "./getDefaultText";

const defaultMeta = {
  cytoscapeStyle,
};

// TODO: Should be shared with the back-end through a shared package
function getMetaBase() {
  return `\n=====\n${JSON.stringify(defaultMeta, null, 2)}\n=====`;
}

export function getDefaultChart() {
  return `${getDefaultText()}\n${getMetaBase()}`;
}
