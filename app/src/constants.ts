import { EditorProps } from "@monaco-editor/react";

export const LAYOUT: any = {
  name: "dagre",
  fit: true,
  animate: true,
  rankDir: "LR",
  spacingFactor: 1.25,
};

export const defaultText = `This app works by typing
  Indenting creates a link to the current line
  any text: before a colon creates a label
  Create a link directly using the exact label text
    like this: (This app works by typing)
    [custom ID] or
      by adding an [ID] and referencing that
        like this: (custom ID) // You can also use single-line comments
/*
or 
multiline 
comments

Have fun! 🎉
*/`;

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
