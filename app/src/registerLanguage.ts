import { Monaco } from "@monaco-editor/react";
import { useEffect } from "react";
import { palette } from "./slang/config";

export const languageId = "flowchartfun";
export const themeNameLight = "flowchartfun-light";
export const themeNameDark = "flowchartfun-dark";

export function registerLanguage(monaco: Monaco) {
  monaco.languages.register({ id: languageId });

  monaco.languages.setMonarchTokensProvider(languageId, {
    tokenizer: {
      root: [
        { regex: "/\\*", action: { token: "comment", next: "@comment" } },
        {
          regex: "^~~~$",
          action: { token: "meta.embedded.block", next: "@yaml" },
        },
        [/\s*\[[\w\s]+\]/, "variable.other.property"],
        [/\s*[\w\s\W]+[:：]\s*/, "keyword.operator.assignment"],
        [/[(（].+[)）]/, "support.function"],
        [/\/\/.*/, "comment"],
      ],
      comment: [
        ["\\*/", "comment", "@pop"],
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
  monaco.editor.defineTheme(themeNameLight, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "variable.other.property", foreground: palette.purple[0] },
      {
        token: "keyword.operator.assignment",
        foreground: palette.purple[1],
      },
      { token: "support.function", foreground: palette.green[2] },
      { token: "comment", foreground: palette.white[3], fontStyle: "italic" },
      { token: "string", foreground: palette.black[0] },
      { token: "meta.embedded.block", foreground: palette.orange[0] },
    ],
  });

  monaco.editor.defineTheme(themeNameDark, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "variable.other.property", foreground: palette.purple[0] },
      {
        token: "keyword.operator.assignment",
        foreground: palette.purple[1],
      },
      { token: "support.function", foreground: palette.green[1] },
      { token: "comment", foreground: "cccccc", fontStyle: "italic" },
      { token: "string", foreground: palette.white[0] },
      { token: "meta.embedded.block", foreground: palette.orange[0] },
    ],
  });
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
