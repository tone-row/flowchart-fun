import { EditorProps } from "@monaco-editor/react";
import cytoscape from "cytoscape";

import { GraphThemes } from "./graphThemes";

type AllKeys<T> = T extends any ? keyof T : never;
type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any }
  ? T[K]
  : undefined;
type Merge<T extends object> = {
  [k in AllKeys<T>]: PickType<T, k>;
};

type Layout = Merge<cytoscape.LayoutOptions> & {
  elk?: any;
  rankDir?: string;
};

export type GraphOptionsObject = {
  layout: Partial<Layout>;
  style?: cytoscape.Stylesheet[];
  theme?: GraphThemes;
  background?: string;
};

export const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false },
  insertSpaces: true,
  wordBasedSuggestions: false,
  occurrencesHighlight: false,
  renderLineHighlight: "none",
  scrollBeyondLastLine: false,
  overviewRulerBorder: false,
  lineDecorationsWidth: "10px",
  renderValidationDecorations: "off",
  hideCursorInOverviewRuler: true,
  matchBrackets: "never",
  selectionHighlight: false,
  lineNumbersMinChars: 3,
  cursorWidth: 2,
  automaticLayout: true,
  lineNumbers: "off",
  contextmenu: false,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 16,
  lineHeight: 32,
  tabSize: 2,
};

export const delimiters = "~~~";
export const newDelimiters = "=====";

export const LOCAL_STORAGE_SETTINGS_KEY = "flowcharts.fun.user.settings";

export const HIDDEN_GRAPH_OPTIONS_DIVIDER = "¼▓╬";

// The raster image scale for a valid user
export const AUTH_IMG_SCALE = 3;
// default unauth raster image scale
export const UNAUTH_IMG_SCALE = 1.5;
