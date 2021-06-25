import { EditorProps } from "@monaco-editor/react";
import cytoscape from "cytoscape";

export const defaultLayout: cytoscape.LayoutOptions = {
  name: "dagre",
  fit: true,
  animate: true,
  spacingFactor: 1.25,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  rankDir: "LR", // Specific to cytoscape-dagre
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
  lineNumbersMinChars: 5,
  cursorWidth: 2,
};

export type GraphOptionsObject = { layout?: Partial<cytoscape.LayoutOptions> };

export const delimiters = "~~~";
