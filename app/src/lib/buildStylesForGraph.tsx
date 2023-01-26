import { CytoscapeOptions, Stylesheet } from "cytoscape";

import { cytoscape } from "./cytoscape";
import {
  baseStyles,
  graphUtilityClasses,
  importantBaseStyles,
} from "./graphUtilityClasses";
import { Theme } from "./themes/constants";

/**
 * Returns the style object to be given to cytoscape.
 * Merges the theme style with the users style.
 */
export function buildStylesForGraph(
  theme: Theme,
  userStyle: cytoscape.Stylesheet[] = [],
  bg?: string
): CytoscapeOptions["style"] {
  const bgOverrides: Stylesheet[] = [];
  if (bg) {
    bgOverrides.push({
      selector: "edge",
      style: {
        "text-background-color": bg,
      },
    });
    bgOverrides.push({
      selector: ":parent",
      style: {
        color: theme.fg,
      },
    });
  }
  return [
    ...baseStyles,
    ...theme.styles,
    ...bgOverrides,
    ...userStyle,
    ...graphUtilityClasses,
    ...importantBaseStyles,
  ];
}
