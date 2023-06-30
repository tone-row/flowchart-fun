import { t, Trans } from "@lingui/macro";
import Editor from "@monaco-editor/react";
import produce from "immer";
import throttle from "lodash.throttle";
import { PaintBrush } from "phosphor-react";
import postcssParser from "prettier/parser-postcss";
import prettier from "prettier/standalone";
import { useCallback, useEffect, useState } from "react";

import { themes } from "../../lib/graphOptions";
import {
  useBackgroundColor,
  useCurrentTheme,
  useThemeKey,
} from "../../lib/graphThemes";
import { useIsValidSponsor, useLightOrDarkMode } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import { useUnmountStore } from "../../lib/useUnmountStore";
import { Button } from "../Shared";
import {
  CustomSelect,
  LargeLink,
  OptionWithLabel,
  TabOptionsGrid,
  WithLowerChild,
} from "./shared";

export function EditStyleTab() {
  const isValidSponsor = useIsValidSponsor();
  const themeKey = useThemeKey();
  const themeNiceName =
    themes.find((t) => t.value === themeKey)?.label() ?? "???";
  const theme = useCurrentTheme(themeKey);
  const meta = useDoc((s) => s.meta);
  const bg = useBackgroundColor(theme);
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
    <div className="h-full overflow-hidden grid">
      <div className="border-b border-dashed py-2 px-5">
        <button className="text-xs p-3 pr-5 pl-4 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex active:opacity-90 items-center space-x-1">
          <PaintBrush size={16} className="mr-2" />
          Load Theme
        </button>
      </div>
      <div className="grid px-5 gap-1 mt-4 mb-1">
        <h2 className="text-lg font-bold">Theme Editor</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Customize your theme by editing the Cytoscape CSS below.
        </p>
      </div>
      <div className="grid h-full grid-rows-[auto,minmax(0,1fr)] overflow-hidden">
        <TabOptionsGrid>
          {/* <OptionWithLabel label={t`Theme`}>
            <CustomSelect
              niceName={themeNiceName}
              options={themes}
              value={themeKey}
              onValueChange={(themeKey) => {
                useDoc.setState(
                  (s) => {
                    return produce(s, (draft) => {
                      draft.meta.theme = themeKey;
                    });
                  },
                  false,
                  "EditStyleTab/theme"
                );
              }}
            />
          </OptionWithLabel> */}
          <OptionWithLabel label={t`Background`}>
            <div
              style={{
                display: "grid",
                gridAutoFlow: "column",
                justifyContent: "start",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                type="color"
                value={bg}
                onChange={(e) => {
                  throttleBGUpdate(e.target.value);
                }}
              />
              {meta.background && (
                <Button
                  onClick={() => {
                    useDoc.setState(
                      (s) => {
                        return produce(s, (draft) => {
                          delete draft.meta?.background;
                        });
                      },
                      false,
                      "EditStyleTab/remove-bg"
                    );
                    // find an input[type=color] and set it to the background color
                    const colorInput = document.querySelector(
                      "input[type=color]"
                    ) as HTMLInputElement;
                    if (colorInput) {
                      colorInput.value = theme?.bg ?? "#ffffff";
                    }
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </OptionWithLabel>
        </TabOptionsGrid>
        <div className="pl-6 pr-2 grid gap-4 border-t dark:border-t-neutral-800 pt-4 grid-rows-[auto,minmax(0,1fr),auto]">
          <label
            className="text-xs font-medium text-neutral-400 dark:text-neutral-500"
            htmlFor="style"
          >
            Style
          </label>
          <Editor
            height={"100%"}
            defaultLanguage="css"
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
              monaco.languages.css.cssDefaults.setOptions({
                validate: false,
              });
            }}
          />
          <div className="pb-2 grid">
            <Button onClick={() => applyStyle(style)}>Apply Style</Button>
          </div>
        </div>
      </div>
      {!isValidSponsor && (
        <LargeLink href="/pricing">
          <Trans>Get More Themes</Trans>
        </LargeLink>
      )}
    </div>
  );
}

const throttleBGUpdate = throttle(
  (bg: string) => {
    useDoc.setState(
      (s) => {
        return produce(s, (draft) => {
          draft.meta.background = bg;
        });
      },
      false,
      "EditStyleTab/bg"
    );
  },
  75,
  {
    trailing: true,
  }
);
