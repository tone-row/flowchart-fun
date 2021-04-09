import { EditorProps } from "@monaco-editor/react";

export const LAYOUT: any = {
  name: "dagre",
  fit: true,
  animate: true,
  rankDir: "LR",
  spacingFactor: 1.25,
};

export const defaultText = `this app works by typing
  new lines create new nodes
    indentation creates child nodes 
    and any text: before a colon+space creates a label
  [linking] you can link to nodes using their ID in parentheses
    like this: (1)
    lines have a default ID of their line-number
      but you can also supply a custom ID in brackets
        like this: (linking) // use single line comments
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
