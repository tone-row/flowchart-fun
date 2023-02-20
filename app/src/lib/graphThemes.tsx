import { create } from "zustand";

import { Theme } from "./themes/constants";
import original from "./themes/original";
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

export const useThemeStore = create<Theme>(() => original);
// TODO: subscribing won't load the initial theme
useDoc.subscribe(
  (doc) => (doc.meta?.theme ?? defaultGraphTheme) as string,
  async (themeKey) => {
    try {
      const theme = await dynamicActivate(themeKey);
      if (theme.font?.files) {
        await Promise.all(
          theme.font.files.map((file) =>
            loadFont(file.name, file.url, file.unicodeRange)
          )
        );
      }
      useThemeStore.setState(theme);
    } catch (error) {
      console.error(error);
    }
  }
);
