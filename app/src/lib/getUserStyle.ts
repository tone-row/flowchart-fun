import { StylesheetStyle } from "cytoscape";

import { usePreviewTheme } from "../components/ThemePicker";
import { preprocessCytoscapeStyle } from "./preprocessCytoscapeStyle";
import { useDoc } from "./useDoc";

/**
 * Get the user style from the document metadata.
 */
export function getUserStyle() {
  return (useDoc.getState().meta?.style ?? []) as StylesheetStyle[];
}

// const theme = useGraphTheme(options.graphOptions.theme);
// That's how we're currently grabbing the theme from the name
// Believe it does some async loading behind the scenes

export function getCytoscapeStyle() {
  let style = usePreviewTheme.getState().cytoscapeStyle;
  if (!style) style = useDoc.getState().meta?.cytoscapeStyle as string;
  if (typeof style !== "string" || !style) return "";
  const result = preprocessCytoscapeStyle(style);
  return result.style;
}

export function useCytoscapeStyle() {
  const previewStyle = usePreviewTheme((s) => s.cytoscapeStyle);
  const docStyle = useDoc((s) => s.meta?.cytoscapeStyle as string);
  const style = previewStyle ?? docStyle;
  if (typeof style !== "string" || !style) return "";
  return style;
  // const result = preprocessCytoscapeStyle(style);
  // return result.style;
}
