import { t } from "@lingui/macro";
import { useContext, useEffect, useRef, useState } from "react";

import { GraphContext } from "../components/GraphProvider";
import { Theme } from "./themes/constants";
import original from "./themes/original";
export type GraphThemes = "original" | "original-dark" | "eggs" | "excalidraw";
export const allGraphThemes: GraphThemes[] = [
  "original",
  "original-dark",
  "eggs",
  "excalidraw",
];
export const themes: {
  label: () => string;
  value: GraphThemes;
}[] = [
  { label: () => t`Light`, value: "original" },
  { label: () => t`Dark`, value: "original-dark" },
  { label: () => t`Eggs`, value: "eggs" },
  { label: () => t`Excalidraw`, value: "excalidraw" },
];
export const defaultGraphTheme: GraphThemes = "original";

async function dynamicActivate(name: string) {
  const theme = await import(`./themes/${name}`);
  return theme.default;
}

// Loading them dynamically if not loaded
function useLoadedTheme(theme: GraphThemes) {
  const [loaded, setLoaded] = useState<Record<string, Theme>>({
    original,
  });
  const lastTheme = useRef<GraphThemes>(theme ?? defaultGraphTheme);
  useEffect(() => {
    if (!(theme in loaded)) {
      dynamicActivate(theme).then((result: Theme) => {
        if (result.font) {
          const font = new FontFace(
            result.font.fontFamily,
            `url(/fonts/${result.font.filename})`
          );
          font.load().then(() => {
            document.fonts.add(font);
            setLoaded({ ...loaded, [theme]: result });
          });
          lastTheme.current = theme;
        } else {
          setLoaded({ ...loaded, [theme]: result });
        }
      });
    }
  }, [theme, loaded]);
  return loaded[theme] ?? loaded[lastTheme.current] ?? original;
}

export function useGraphTheme() {
  const { graphOptions } = useContext(GraphContext);
  let theme = defaultGraphTheme;
  if (graphOptions.theme && allGraphThemes.includes(graphOptions.theme))
    theme = graphOptions.theme;
  return useLoadedTheme(theme);
}
