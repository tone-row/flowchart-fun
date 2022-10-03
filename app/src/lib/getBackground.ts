import { GraphOptionsObject } from "./constants";
import { Theme } from "./themes/constants";

export function getBackground(
  graphOptions: GraphOptionsObject,
  graphTheme: Theme
) {
  return graphOptions?.background ?? graphTheme.safeBg ?? graphTheme.bg;
}
