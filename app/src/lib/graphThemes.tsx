import { useProcessStyleStore } from "./preprocessCytoscapeStyle";

export type GraphThemes =
  | "original"
  | "original-dark"
  | "eggs"
  | "excalidraw"
  | "monospace"
  | "clay"
  | "playbook"
  | "blokus"
  | "museum"
  | "retro"
  | "futuristic"
  | "comic-book";

declare global {
  interface Window {
    /**
     * Here we store the fonts that are loaded as base64 encoded strings
     * so we can add them to our svg exports
     */
    __flowchartFunBase64EncodedFonts: Record<string, string>;
  }
}

window.__flowchartFunBase64EncodedFonts = {};

/**
 * Get the background color, user override, theme, or default
 */
const bgDefault = "#ffffff";
export function useBackgroundColor() {
  return useProcessStyleStore((s) => s.variables?.background ?? bgDefault);
}

export function getBackgroundColor() {
  return useProcessStyleStore.getState().variables?.background ?? bgDefault;
}

/**
 * Temporarily need a store of colors for use in the
 * Node Context menu. The context menu will eventually
 * be replaced using intellisense so this won't be necessary.
 */
export const tmpThemeColors = {
  black: "#000000",
  white: "#ffffff",
  green: "#01d857",
  yellow: "#ffcf0d",
  blue: "#6172F9",
  orange: "#ff7044",
  purple: "#a492ff",
  red: "#fa2323",
  gray: "#aaaaaa",
};
