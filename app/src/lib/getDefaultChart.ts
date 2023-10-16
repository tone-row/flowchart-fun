import { getDefaultText } from "./getDefaultText";
import { theme, cytoscapeStyle } from "./templates/default-template";
import { getExpirationDate } from "./getExpirationDate";

const defaultMeta = {
  themeEditor: theme,
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
    expires: getExpirationDate(),
  };
  return `${getDefaultText()}\n=====\n${JSON.stringify(meta, null, 2)}\n=====`;
}
