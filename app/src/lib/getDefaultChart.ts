import { cytoscapeStyle } from "../lib/themes/august2023";
import { getDefaultText } from "./getDefaultText";
import { addDays } from "date-fns";

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

/**
 * Returns a chart where the meta has an expiry date in it
 */
export function getDefaultLocalChart() {
  const meta = {
    ...defaultMeta,
    expires: addDays(new Date(), 1).toISOString(),
  };
  return `${getDefaultText()}\n=====\n${JSON.stringify(meta, null, 2)}\n=====`;
}
