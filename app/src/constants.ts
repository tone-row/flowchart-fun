import { t } from "@lingui/macro";
import { EditorProps } from "@monaco-editor/react";

export const LAYOUT: any = {
  name: "dagre",
  fit: true,
  animate: true,
  rankDir: "LR",
  spacingFactor: 1.25,
};

const line1 = t`This app works by typing`;
const line2 = t`Indenting creates a link to the current line`;
const line3 = t`any text: before a colon creates a label`;
const line4 = t`Create a link directly using the exact label text`;
const line5 = t`like this: (This app works by typing)`;
const line6 = t`[custom ID] or`;
const line7 = t`by adding an [ID] and referencing that`;
const line8 = t`like this: (custom ID) // You can also use single-line comments`;
const line9 = t`or`;
const line10 = t`multiline`;
const line11 = t`comments`;
const line12 = t`Have fun! 🎉`;

export const defaultText = `${line1}
  ${line2}
  ${line3}
  ${line4}
    ${line5}
    ${line6}
      ${line7}
        ${line8}
/*
${line9}
${line10}
${line11}

${line12}
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
