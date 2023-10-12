import { Editor } from "@monaco-editor/react";
import { useCanEdit, useLightOrDarkMode } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";
import { updateThemeEditor } from "../../lib/toTheme";
import { FFTheme } from "../../lib/FFTheme";

export function ThemeTabCustom() {
  const canEdit = useCanEdit();
  const custom = useDoc((s) => (s.meta?.themeEditor as FFTheme).custom) ?? "";
  const mode = useLightOrDarkMode();
  return (
    <div>
      <Editor
        height={300}
        width="100%"
        defaultLanguage="scss"
        value={custom}
        onChange={(value) => {
          updateThemeEditor({ custom: value ?? "" });
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
          renderFinalNewline: "off",
          fontSize: 14,
          guides: {
            indentation: false,
          },
          readOnly: !canEdit,
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
    </div>
  );
}
