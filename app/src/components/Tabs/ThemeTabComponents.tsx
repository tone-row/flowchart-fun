import * as Slider from "@radix-ui/react-slider";
import { Control } from "formulaic";
import * as Popover from "@radix-ui/react-popover";
import { ReactNode, useState } from "react";
import { fonts } from "../../lib/fonts";
import classNames from "classnames";
import { Editor } from "@monaco-editor/react";
import { useCanEdit, useLightOrDarkMode } from "../../lib/hooks";

type BaseProps = {
  id: string;
  title: string;
};

export const select: Control<
  string,
  BaseProps & { options: { value: string; label: string }[] }
> = (value, onValueChange, { id, options }, globals) => {
  const disabled = globals?.canEdit === false;
  return (
    <select
      key={id}
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        onValueChange(e.target.value);
      }}
      className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const range: Control<
  number,
  BaseProps & { min: number; max: number; step: number }
> = (value, onValueChange, { id, min, max, step, title }, globals) => {
  const disabled = globals?.canEdit === false;
  return (
    <Slider.Root
      key={id}
      id={id}
      name={id}
      disabled={disabled}
      className="relative flex items-center select-none touch-none w-full h-6 group"
      value={[value]}
      max={max}
      min={min}
      step={step}
      onValueChange={([value]) => {
        onValueChange(value);
      }}
    >
      <Slider.Track
        className={classNames(
          "w-full h-1 bg-gray-200 rounded-full relative grow",
          {
            "opacity-50": disabled,
          }
        )}
      >
        <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
      </Slider.Track>
      <Slider.Thumb
        className={classNames(
          "block w-4 h-4 bg-blue-500 rounded-full shadow-md",
          {
            "opacity-50": disabled,
          }
        )}
        aria-label={title}
      />
    </Slider.Root>
  );
};

export const text: Control<string, BaseProps> = (
  value,
  onValueChange,
  { id },
  globals
) => {
  const disabled = globals?.canEdit === false;
  return (
    <input
      key={id}
      type="text"
      id={id}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        onValueChange(e.target.value);
      }}
      className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
    />
  );
};

export const color: Control<string, BaseProps> = (
  value,
  onValueChange,
  { id },
  globals
) => {
  const disabled = globals?.canEdit === false;
  return (
    <div className="flex items-center gap-2 justify-between">
      <input
        key={id}
        type="color"
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onValueChange(e.target.value);
        }}
        className="h-6 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
      />
      <span className="font-mono text-neutral-500/50 text-[12px]">
        {value.toUpperCase()}
      </span>
    </div>
  );
};

export const checkbox: Control<boolean, BaseProps> = (
  value,
  onValueChange,
  { id },
  globals
) => {
  const disabled = globals?.canEdit === false;
  return (
    <input
      key={id}
      type="checkbox"
      id={id}
      checked={value}
      disabled={disabled}
      onChange={(e) => {
        onValueChange(e.target.checked);
      }}
      className="h-6 w-6 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
    />
  );
};

export const fontpicker: Control<string, BaseProps> = (
  value,
  onValueChange,
  _options,
  globals
) => {
  const isKnownFont = fonts.some((font) => font.name === value);
  const disabled = globals?.canEdit === false;
  return (
    <>
      <Fontpicker
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
      {!isKnownFont ? (
        <span className="text-xs text-neutral-500 -mt-1 text-center">
          When using a custom font make sure to add the import to your custom
          CSS.
        </span>
      ) : null}
    </>
  );
};

function Fontpicker({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  return (
    <>
      <input
        placeholder="system-ui"
        disabled={disabled}
        className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
        onFocus={() => setOpen(true)}
        onBlur={() => {
          if (!hovering) setOpen(false);
        }}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
        }}
        // on escape key, close the popover
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <Popover.Root open={open} modal={false}>
        <Popover.Trigger className="w-full h-0" />
        <Popover.Content
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="grid bg-white z-10 rounded shadow-lg w-full border border-gray-200 overflow-hidden p-1"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          side="bottom"
          align="start"
        >
          {fonts.map((font) => (
            <FontpickerButton
              key={font.name}
              onClick={() => {
                onValueChange(font.name);
                setOpen(false);
              }}
            >
              {font.name}
            </FontpickerButton>
          ))}
        </Popover.Content>
      </Popover.Root>
    </>
  );
}

function FontpickerButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full p-2 hover:bg-gray-100 text-left text-sm"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const customCss: Control<string, BaseProps> = (
  value,
  onValueChange,
  { id },
  globals
) => {
  const disabled = globals?.canEdit === false;
  return (
    <CustomCSSEditor
      key={id}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    />
  );
};

function CustomCSSEditor({
  value,
  onValueChange,
  disabled,
}: {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
}) {
  const mode = useLightOrDarkMode();
  return (
    <div className="theme-editor-monaco bg-neutral-50">
      <Editor
        height={300}
        width="100%"
        defaultLanguage="scss"
        value={value}
        onChange={(value) => {
          onValueChange(value ?? "");
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
          readOnly: disabled,
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
