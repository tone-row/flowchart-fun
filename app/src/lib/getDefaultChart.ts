import { getDefaultText } from "./getDefaultText";
import { getExpirationDate } from "./getExpirationDate";

import {
  theme as defaultTemplateTheme,
  cytoscapeStyle as defaultTemplateStyle,
} from "./templates/default-template";

const defaultMeta = {
  themeEditor: {
    ...defaultTemplateTheme,
    // The sandbox welcome doc is a wide tutorial tree — it reads best left-to-right
    direction: "RIGHT",
  },
  cytoscapeStyle: defaultTemplateStyle,
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
