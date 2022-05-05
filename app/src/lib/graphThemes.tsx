import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { GraphContext } from "../components/GraphProvider";
import { themes } from "./graphOptions";
import { useIsPublicHostedCharted, useIsValidSponsor } from "./hooks";
import { Theme } from "./themes/constants";
import original from "./themes/original";

export type GraphThemes =
  | "original"
  | "original-dark"
  | "eggs"
  | "excalidraw"
  | "monospace"
  | "clay"
  | "playbook"
  | "blokus"
  | "museum";

const publicThemes = themes
  .filter((theme) => !theme.sponsorOnly)
  .map((theme) => theme.value) as GraphThemes[];

const sponsorOnlyThemes = themes
  .filter((theme) => theme.sponsorOnly)
  .map((theme) => theme.value) as GraphThemes[];

const defaultGraphTheme: GraphThemes = "original";

async function dynamicActivate(name: string) {
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

type TThemeLoader = {
  loaded: Record<string, Theme>;
  setLoaded: Dispatch<SetStateAction<Record<string, Theme>>>;
};

const ThemeLoader = createContext<TThemeLoader>({
  loaded: {},
  setLoaded: () => null,
});

export const ThemeLoaderProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState<Record<string, Theme>>({
    original,
  });
  return (
    <ThemeLoader.Provider value={{ loaded, setLoaded }}>
      {children}
    </ThemeLoader.Provider>
  );
};

// Loading theme dynamically if not loaded
function useLoadedTheme(theme: GraphThemes) {
  const { loaded, setLoaded } = useContext(ThemeLoader);
  const lastTheme = useRef<GraphThemes>(theme ?? defaultGraphTheme);
  useEffect(() => {
    if (!loaded) return;

    if (!(theme in loaded)) {
      dynamicActivate(theme).then((result: Theme) => {
        if (result.font?.files) {
          Promise.all(
            result.font.files.map((file) =>
              loadFont(file.name, file.url, file.unicodeRange)
            )
          ).then(() => {
            setLoaded((loaded) => ({ ...loaded, [theme]: result }));
            lastTheme.current = theme;
          });
        } else {
          setLoaded({ ...loaded, [theme]: result });
        }
      });
    } else {
      lastTheme.current = theme;
    }
  }, [theme, loaded, setLoaded]);
  return loaded?.[theme] ?? loaded?.[lastTheme.current] ?? original;
}

export function useGraphTheme() {
  const isValidSponsor = useIsValidSponsor();
  const isPublicHostedChart = useIsPublicHostedCharted();
  const { graphOptions } = useContext(GraphContext);
  let theme = defaultGraphTheme;
  if (
    graphOptions?.theme &&
    (publicThemes.includes(graphOptions.theme) ||
      ((isValidSponsor || isPublicHostedChart) &&
        sponsorOnlyThemes.includes(graphOptions.theme)))
  )
    theme = graphOptions.theme;
  return useLoadedTheme(theme);
}

export function useBackground() {
  const { graphOptions } = useContext(GraphContext);
  const graphTheme = useGraphTheme();
  return graphOptions?.background ?? graphTheme.safeBg ?? graphTheme.bg;
}
