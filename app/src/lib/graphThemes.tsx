import { t } from "@lingui/macro";
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
import { Theme } from "./themes/constants";
import original from "./themes/original";
export type GraphThemes =
  | "original"
  | "original-dark"
  | "eggs"
  | "excalidraw"
  | "monospace";
export const allGraphThemes: GraphThemes[] = [
  "original",
  "original-dark",
  "eggs",
  "excalidraw",
  "monospace",
];
export const themes: {
  label: () => string;
  value: GraphThemes;
}[] = [
  { label: () => t`Light`, value: "original" },
  { label: () => t`Dark`, value: "original-dark" },
  { label: () => t`Eggs`, value: "eggs" },
  { label: () => t`Excalidraw`, value: "excalidraw" },
  { label: () => t`Monospace`, value: "monospace" },
];
export const defaultGraphTheme: GraphThemes = "original";

async function dynamicActivate(name: string) {
  const theme = await import(`./themes/${name}`);
  return theme.default;
}

async function loadFont(name: string, url: string, unicodeRange?: string) {
  const font = new FontFace(name, `url(/fonts/${url})`, {
    unicodeRange,
  });
  await font.load();
  document.fonts.add(font);
}

const ThemeLoader = createContext(
  {} as {
    loaded: Record<string, Theme>;
    setLoaded: Dispatch<SetStateAction<Record<string, Theme>>>;
  }
);

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

// Loading them dynamically if not loaded
function useLoadedTheme(theme: GraphThemes) {
  const { loaded, setLoaded } = useContext(ThemeLoader);
  const lastTheme = useRef<GraphThemes>(theme ?? defaultGraphTheme);
  useEffect(() => {
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
    }
  }, [theme, loaded, setLoaded]);
  return loaded[theme] ?? loaded[lastTheme.current] ?? original;
}

export function useGraphTheme() {
  const { graphOptions } = useContext(GraphContext);
  let theme = defaultGraphTheme;
  if (graphOptions.theme && allGraphThemes.includes(graphOptions.theme))
    theme = graphOptions.theme;
  return useLoadedTheme(theme);
}
