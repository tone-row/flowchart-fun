import { useQuery } from "react-query";

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
 * Get the background color, user override, theme, or default
 */
export function useBackgroundColor(theme?: Theme) {
  const bgUser = useDoc((state) => state.meta?.background);
  const bgTheme = theme?.bg;
  const bgDefault = "#ffffff";
  return (bgUser ?? bgTheme ?? bgDefault) as string;
}
