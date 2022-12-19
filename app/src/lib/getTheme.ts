import { StylesheetStyle } from "cytoscape";

import { defaultGraphTheme, GraphThemes, useGraphTheme } from "./graphThemes";
import { useDoc } from "./prepareChart";

/**
 * Get the theme from the document metadata.
 */
export function useThemeKey() {
  return (useDoc.getState().meta?.theme ?? defaultGraphTheme) as GraphThemes;
}

/**
 * Get the user style from the document metadata.
 */
export function getUserStyle() {
  return (useDoc.getState().meta?.style ?? []) as StylesheetStyle[];
}

// const theme = useGraphTheme(options.graphOptions.theme);
// That's how we're currently grabbing the theme from the name
// Believe it does some async loading behind the scenes

export function useThemeObject() {
  const themeKey = useThemeKey();
  const themeObj = useGraphTheme(themeKey);
  console.log("useThemeObject themeKey", themeObj);
  return { ...themeObj };
}
