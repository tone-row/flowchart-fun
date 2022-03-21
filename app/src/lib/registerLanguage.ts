import { Monaco } from "@monaco-editor/react";
import { useEffect } from "react";

import { palette } from "../slang/config";

export const languageId = "flowchartfun";
export const themeNameLight = "flowchartfun-light";
export const themeNameDark = "flowchartfun-dark";

const lightTheme = {
  base: "vs",
  inherit: true,
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

const darkTheme = {
  base: "vs-dark",
  inherit: true,
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

function registerLanguage(monaco: Monaco) {
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
}

export function defineThemes(monaco: Monaco) {
  monaco.editor.defineTheme(themeNameLight, lightTheme);
  monaco.editor.defineTheme(themeNameDark, darkTheme);
}

export function useMonacoLanguage(monaco: any) {
  useEffect(() => {
    if (monaco) {
      const isRegistered = monaco.languages
        .getLanguages()
        .map(({ id }: { id: string }) => id)
        .includes(languageId);

      if (!isRegistered) {
        registerLanguage(monaco);
      }
    }
  }, [monaco]);
}
