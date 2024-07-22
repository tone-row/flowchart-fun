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

export const editorStyleOptions: EditorProps["options"] = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: 16,
  lineHeight: 32,
  tabSize: 2,
  insertSpaces: true,
  lineDecorationsWidth: "10px",
  cursorWidth: 2,
  padding: { top: 10, bottom: 10 },
};

export const editorFunctionalOptions: EditorProps["options"] = {
  minimap: { enabled: false },
  wordBasedSuggestions: false,
  occurrencesHighlight: false,
  renderLineHighlight: "none",
  // scrollBeyondLastLine: false,
  overviewRulerBorder: false,
  renderValidationDecorations: "on",
  roundedSelection: false,
  colorDecorators: false,
  hideCursorInOverviewRuler: true,
  matchBrackets: "never",
  selectionHighlight: false,
  lineNumbersMinChars: 3,
  automaticLayout: true,
  lineNumbers: "off",
  contextmenu: false,
};

// Combine both options for use in the editor
export const editorOptions: EditorProps["options"] = {
  ...editorStyleOptions,
  ...editorFunctionalOptions,
};

export const delimiters = "~~~";
export const newDelimiters = "=====";

export const LOCAL_STORAGE_SETTINGS_KEY = "flowcharts.fun.user.settings";
export const SANDBOX_STORAGE_KEY = "flowcharts.fun.sandbox";

export const HIDDEN_GRAPH_OPTIONS_DIVIDER = "¼▓╬";

// The raster image scale for a valid user
export const AUTH_IMG_SCALE = 3;
// default unauth raster image scale
export const UNAUTH_IMG_SCALE = 1.5;

// This is to avoid a monaco-editor import that breaks too many things
export const monacoMarkerErrorSeverity = 8;

export const DISCORD_URL = "https://discord.gg/wPASTQHQBf";
