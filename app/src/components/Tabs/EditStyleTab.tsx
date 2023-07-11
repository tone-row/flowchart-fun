import { Trans } from "@lingui/macro";
import Editor from "@monaco-editor/react";
import * as Popover from "@radix-ui/react-popover";
import produce from "immer";
import { Info } from "phosphor-react";
import postcssParser from "prettier/parser-postcss";
import prettier from "prettier/standalone";
import { ReactNode, useCallback, useEffect, useState } from "react";

import { DISCORD_URL } from "../../lib/constants";
import { useLightOrDarkMode } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import { useUnmountStore } from "../../lib/useUnmountStore";
import { Button2, IconButton2, popoverContentProps } from "../../ui/Shared";
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
    <div className="h-full w-full grid grid-rows-[auto,minmax(0,1fr)]">
      <div className="grid pl-5 pr-2 gap-1 mt-4 mb-4 content-start">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h2 className="text-lg font-bold">
              <Trans>Theme Editor</Trans>
            </h2>
            <InfoButton />
          </div>
          <ThemePicker applyStyle={applyStyle} />
        </div>
      </div>
      <div
        className="pl-6 pr-2 grid gap-2 h-full grid-rows-[minmax(0,1fr),auto]"
        id="theme-editor-wrapper"
      >
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
          wrapperProps={{
            onMouseEnter() {
              const editor = document.querySelector(
                "#theme-editor-wrapper section"
              ) as HTMLElement;
              if (!editor) return;
              editor.dataset.hovering = "true";
            },
            onMouseLeave() {
              const editor = document.querySelector(
                "#theme-editor-wrapper section"
              ) as HTMLElement;
              if (!editor) return;
              editor.dataset.hovering = "false";
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
          <Button2
            onClick={() => applyStyle(style)}
            rightIcon={
              <div className="flex gap-1">
                <KeyboardKey>⌘</KeyboardKey>
                <KeyboardKey>
                  <span className="-translate-y-[1px]">s</span>
                </KeyboardKey>
              </div>
            }
          >
            <Trans>Apply Style</Trans>
          </Button2>
        </div>
      </div>
    </div>
  );
}

function KeyboardKey({ children }: { children: ReactNode }) {
  return (
    <kbd className="bg-neutral-300 dark:bg-neutral-700 rounded w-5 h-5 grid content-center font-mono text-neutral-800 dark:text-neutral-300 group-hover:bg-neutral-400">
      {children}
    </kbd>
  );
}

function InfoButton() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton2>
          <Info size={16} />
        </IconButton2>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content {...popoverContentProps}>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-normal max-w-md">
            <Trans>
              Customize your theme by editing the <span>Cytoscape CSS</span>{" "}
              below. Our styling documentation is coming soon! In the meantime,
              the best resource is the{" "}
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
