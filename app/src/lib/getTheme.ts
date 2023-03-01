import { StylesheetStyle } from "cytoscape";

import { getDoc, useDocMeta } from "./docHelpers";

/**
 * Get the user style from the document metadata.
 */
export function getUserStyle() {
  return (getDoc().meta?.style ?? []) as StylesheetStyle[];
}

export function useUserStyle() {
  return (useDocMeta().style ?? []) as StylesheetStyle[];
}
