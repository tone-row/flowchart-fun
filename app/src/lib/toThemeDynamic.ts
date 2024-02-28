import { FFTheme } from "shared";
import { theme as defaultTheme } from "./templates/default-template";
import { useDoc } from "./useDoc";
import { getThemeEditor } from "./toTheme";

export function useThemeEditor() {
  return useDoc(
    (state) => (state.meta?.themeEditor as FFTheme) || defaultTheme
  );
}

export function useBackground() {
  return useThemeEditor().background;
}

export function updateThemeEditor(theme: Partial<FFTheme>) {
  useDoc.setState((doc) => ({
    ...doc,
    meta: {
      ...doc.meta,
      themeEditor: {
        ...getThemeEditor(doc),
        ...theme,
      },
    },
  }));
}

export function getBackground() {
  return getThemeEditor(useDoc.getState()).background;
}
