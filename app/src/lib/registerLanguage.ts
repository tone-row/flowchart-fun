import { Monaco } from "@monaco-editor/react";

import { palette } from "../slang/config";

export const languageId = "flowchartfun";
export const themeNameLight = "flowchartfun-light";
export const themeNameDark = "flowchartfun-dark";
import { highlight } from "graph-selector";
import type { editor } from "monaco-editor";

const lightTheme: editor.IStandaloneThemeData = {
  base: "vs",
  inherit: true,
  colors: {},
  rules: [
    { token: "nodeIdAndClass", foreground: palette.purple[0] },
    {
      token: "keyword.operator.assignment",
      foreground: palette.purple[1],
    },
    { token: "support.function", foreground: palette.green[2] },
    { token: "comment", foreground: palette.white[3], fontStyle: "italic" },
    { token: "string", foreground: palette.black[0] },
    { token: "meta.embedded.block", foreground: palette.orange[0] },
  ],
};

const darkTheme: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  colors: {},
  rules: [
    // ID
    { token: "nodeIdAndClass", foreground: palette.purple[0] },
    {
      token: "keyword.operator.assignment",
      foreground: palette.purple[1],
    },
    { token: "support.function", foreground: palette.green[1] },
    { token: "comment", foreground: "888888", fontStyle: "italic" },
    { token: "string", foreground: palette.white[0] },
    { token: "meta.embedded.block", foreground: palette.orange[0] },
  ],
};

function registerV1Language(monaco: Monaco) {
  monaco.languages.register({ id: languageId });

  monaco.languages.setMonarchTokensProvider(languageId, {
    tokenizer: {
      root: [
        {
          regex: "^~~~$",
          action: { token: "meta.embedded.block", next: "@yaml" },
        },
        { regex: /\/\*/, action: { token: "comment", next: "@comment" } },
        [/[\w\s]+[:：]\s*/, "keyword.operator.assignment"],
        [/\[[\s\w.-]+\]*/, "nodeIdAndClass"],
        [/[(（][^(（)）]+[)）]/, "support.function"],
        [/\/\/.*/, "comment"],
      ],
      comment: [
        [/[\s\S]*\*\//gm, "comment", "@pop"],
        [".*", "comment"],
      ],
      yaml: [
        ["~~~", "meta.embedded.block", "@pop"],
        [".*", "meta.embedded.block"],
      ],
    },
  });

  monaco.editor.defineTheme(themeNameLight, lightTheme);
  monaco.editor.defineTheme(themeNameDark, darkTheme);
}

/** Registers language for both syntaxes with monaco */
export function registerLanguages(monaco: Monaco | null) {
  if (!monaco) return;
  if (!isLangRegistered(monaco, languageId)) {
    registerV1Language(monaco);
  }
  if (!isLangRegistered(monaco, highlight.languageId)) {
    highlight.registerHighlighter(monaco);
  }
}

function isLangRegistered(monaco: Monaco, languageId: string) {
  return monaco.languages
    .getLanguages()
    .map(({ id }: { id: string }) => id)
    .includes(languageId);
}
