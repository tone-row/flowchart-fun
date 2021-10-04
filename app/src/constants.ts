import { EditorProps } from "@monaco-editor/react";
import cytoscape from "cytoscape";
import { GraphThemes } from "./components/graphThemes";

type AllKeys<T> = T extends any ? keyof T : never;
type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any }
  ? T[K]
  : undefined;
type Merge<T extends object> = {
  [k in AllKeys<T>]: PickType<T, k>;
};

type Layout = Merge<cytoscape.LayoutOptions>;

export type GraphOptionsObject = {
  layout?: Partial<Layout> & { rankDir?: string };
  style?: cytoscape.Stylesheet[];
  theme?: GraphThemes;
};

export const defaultSpacingFactor = 1.25;

export const defaultLayout: GraphOptionsObject["layout"] = {
  name: "dagre",
  fit: true,
  animate: true,
  spacingFactor: defaultSpacingFactor,
  rankDir: "TB",
};

export const editorOptions: EditorProps["options"] = {
  minimap: { enabled: false },
  fontSize: 16,
  tabSize: 2,
  insertSpaces: true,
  wordBasedSuggestions: false,
  occurrencesHighlight: false,
  renderLineHighlight: false,
  highlightActiveIndentGuide: false,
  scrollBeyondLastLine: false,
  renderIndentGuides: false,
  overviewRulerBorder: false,
  lineDecorationsWidth: "10px",
  renderValidationDecorations: "off",
  hideCursorInOverviewRuler: true,
  matchBrackets: "never",
  selectionHighlight: false,
  lineHeight: 28,
  lineNumbersMinChars: 3,
  cursorWidth: 2,
  automaticLayout: true,
};

export const delimiters = "~~~";
