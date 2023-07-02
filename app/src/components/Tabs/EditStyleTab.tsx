import { Trans } from "@lingui/macro";
import Editor from "@monaco-editor/react";
import produce from "immer";
import postcssParser from "prettier/parser-postcss";
import prettier from "prettier/standalone";
import { useCallback, useEffect, useState } from "react";

import { DISCORD_URL } from "../../lib/constants";
import { useLightOrDarkMode } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import { useUnmountStore } from "../../lib/useUnmountStore";
import { Button } from "../Shared";
import { ThemePicker } from "../ThemePicker";

export function EditStyleTab() {
  const meta = useDoc((s) => s.meta);
  const [style, setStyle] = useState<string>(
    (meta.cytoscapeStyle as string) ?? ""
  );
  const mode = useLightOrDarkMode();
  const applyStyle = useCallback((style: string) => {
    let formattedStyle = style;
    try {
      // format the style
      formattedStyle = prettier.format(style, {
        parser: "css",
        plugins: [postcssParser],
      });
      setStyle(formattedStyle);
    } catch (e) {
      // ignore
      console.error(e);
    }
    useDoc.setState(
      (s) => {
        return produce(s, (draft) => {
          draft.meta.cytoscapeStyle = formattedStyle;
        });
      },
      false,
      "EditStyleTab/style"
    );
    useUnmountStore.setState({
      unmount: true,
    });
  }, []);
  // bind Command+S to apply the style
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        applyStyle(style);
      }
    };
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [applyStyle, style]);
  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto,minmax(0,1fr)]">
      <div className="grid px-5 gap-1 mt-4 mb-4 content-start">
        <div className="flex justify-between items-end">
          <h2 className="text-lg font-bold">
            <Trans>Theme Editor</Trans>
          </h2>
          <ThemePicker applyStyle={applyStyle} />
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-normal">
          <Trans>
            Customize your theme by editing the Cytoscape CSS below. Our styling
            documentation is coming soon! In the meantime, the best resource is
            the{" "}
            <a
              className="text-blue-600 dark:text-green-400"
              href="https://js.cytoscape.org/#style"
              target="_blank"
              rel="noreferrer"
            >
              Cytoscape
            </a>{" "}
            documentation. Come ask questions in the{" "}
            <a
              href={DISCORD_URL}
              className="text-blue-600 dark:text-green-400"
              target="_blank"
              rel="noreferrer"
            >
              Discord
            </a>{" "}
            if you get stuck.
          </Trans>
        </p>
      </div>
      <div className="pl-6 pr-2 grid gap-2 h-full grid-rows-[minmax(0,1fr),auto]">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="scss"
          value={style}
          onChange={(value) => {
            setStyle(value ?? "");
          }}
          options={{
            minimap: { enabled: false },
            lineNumbers: "off",
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            glyphMargin: false,
            folding: false,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            wrappingIndent: "indent",
            wrappingStrategy: "advanced",
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            renderLineHighlight: "none",
            renderFinalNewline: false,
            fontSize: 14,
            guides: {
              indentation: false,
            },
          }}
          theme={mode === "dark" ? "vs-dark" : "vs-light"}
          beforeMount={(monaco) => {
            // turn off validation
            monaco.languages.css.scssDefaults.setOptions({
              validate: false,
              lint: {
                unknownProperties: "ignore",
                unknownVendorSpecificProperties: "ignore",
              },
            });
          }}
        />
        <div className="pb-2 grid">
          <Button onClick={() => applyStyle(style)}>Apply Style</Button>
        </div>
      </div>
    </div>
  );
}
