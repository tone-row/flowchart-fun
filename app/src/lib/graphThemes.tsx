import { useQuery } from "react-query";

import { useProcessStyleStore } from "./preprocessCytoscapeStyle";
import { queryClient } from "./queries";
import { Theme } from "./themes/constants";
import { useDoc } from "./useDoc";

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

export const defaultGraphTheme: GraphThemes = "original";

async function dynamicActivate(name: string): Promise<Theme> {
  const theme = await import(`./themes/${name}`);
  return theme.default;
}

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

async function loadFont(name: string, url: string, unicodeRange?: string) {
  const toLoadUrl = url.startsWith("http")
    ? `url(${url})`
    : `url(/fonts/${url})`;
  const font = new FontFace(name, toLoadUrl, {
    unicodeRange,
  });
  await font.load();
  document.fonts.add(font);
}

/**
 * Alternative theme loader, using useQuery
 * Suspends until theme and fonts are loaded, expects a themeKey
 */
export function useCurrentTheme(themeKey: string) {
  const theme = useQuery(
    ["theme", themeKey],
    async () => {
      // TODO: maybe dynamicActivate should include font loading
      const theme = await dynamicActivate(themeKey);
      if (theme.font?.files) {
        await Promise.all(
          theme.font.files.map((file) =>
            loadFont(file.name, file.url, file.unicodeRange)
          )
        );
      }
      return theme;
    },
    {
      enabled: !!themeKey,
      suspense: true,
      // cache forever
      staleTime: Infinity,
    }
  );
  return theme.data;
}

/**
 * Returns the current theme key in the doc or the default theme key
 */
export function useThemeKey() {
  const themeKey = useDoc((s) => s.meta?.theme) ?? defaultGraphTheme;
  return themeKey as GraphThemes;
}

/**
 * one-shot get theme key
 */
export function getThemeKey() {
  return (useDoc.getState().meta?.theme ?? defaultGraphTheme) as GraphThemes;
}

/**
 * one-shot get theme, or undefined if not loaded
 */
export function getTheme() {
  const themeKey = getThemeKey();
  return queryClient.getQueryData<Theme>(["theme", themeKey]);
}

/**
 * use theme, up to date from queryClient, but doesn't fetch
 */
export function useTheme() {
  const themeKey = useThemeKey();
  return queryClient.getQueryData<Theme>(["theme", themeKey]);
}

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
