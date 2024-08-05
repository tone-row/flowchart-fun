import * as Dialog from "@radix-ui/react-dialog";
import { Close, Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { Check, WarningCircle, ArrowLeft } from "phosphor-react";
import { PiShapesDuotone } from "react-icons/pi";
import { Trans } from "@lingui/macro";
import { templates } from "../lib/templates/templates";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useCallback, useState } from "react";
import { Button2 } from "../ui/Shared";
import classNames from "classnames";
import { useDoc } from "../lib/useDoc";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { mountGraph, unmountGraph } from "../lib/useUnmountStore";
import { FFTheme } from "../lib/FFTheme";
import { getDefaultText } from "../lib/getDefaultText";
import { RequestTemplate } from "./RequestTemplate";

/**
 * We want to load template content if the user has no content
 */
function getContentInitialValue() {
  const text = useDoc.getState().text;
  return text.trim() === "" || text === getDefaultText();
}

export function LoadTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<
    null | typeof templates[number]["key"]
  >(null);
  const templateData = templates.find((t) => t.key === template);
  const [layout, setLayout] = useState(true);
  const [content, setContent] = useState(getContentInitialValue);
  const disabled = !layout && !content;

  /**
   * reset the state of the dialog
   */
  const reset = useCallback(() => {
    setTemplate(null);
    setLayout(true);
    setContent(getContentInitialValue);
  }, []);

  const load = useCallback(async () => {
    if (!template || !templateData) return;

    const importTemplate = await import(
      `../lib/templates/${template}-template.ts`
    );
    const templateContent = importTemplate.content;
    const theme: FFTheme = importTemplate.theme;
    const cytoscapeStyle: string = importTemplate.cytoscapeStyle ?? "";

    const { text, meta: _meta, details } = useDoc.getState();

    const nextContent = content ? templateContent : text;

    const meta = {
      ..._meta,
      cytoscapeStyle,
      themeEditor: theme,
      // Unfreeze the doc
      nodePositions: undefined,
    };

    reset();
    setOpen(false);

    unmountGraph();
    // The reason this is done is because the unmounting
    // of the graph happens effectually, i.e. not immediately
    // and when an elk layout is run, but the graph is no longer
    // there we get an error, this ensures the graph is actually
    // unmounted, therefore the layout doesn't begin to run
    requestAnimationFrame(() => {
      prepareChart({
        doc: `${nextContent}\n=====${JSON.stringify(meta)}=====`,
        details,
      });
      mountGraph();
    });
  }, [template, templateData, content, reset]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) reset();
        setOpen(open);
        setContent(getContentInitialValue);
      }}
    >
      <Dialog.Trigger asChild>
        <EditorActionTextButton
          icon={PiShapesDuotone}
          data-session-activity="Load Template: Open Dialog"
          iconClassName="fill-zinc-500"
        >
          <Trans>Examples</Trans>
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content
          overflowV
          maxWidthClass="max-w-[880px]"
          className="overflow-y-auto max-h-[calc(100vh-2rem)] h-[650px] grid-rows-[auto_minmax(0,1fr)]"
        >
          <Close />
          <div className="grid gap-1 sm:flex justify-between items-baseline">
            <Dialog.Title className="text-xl font-bold flex items-baseline">
              <PiShapesDuotone className="mr-2 translate-y-1" />

              <span className="mr-4">
                <Trans>Examples</Trans>
              </span>
            </Dialog.Title>
            <RequestTemplate />
          </div>
          <Dialog.Description asChild>
            {templateData ? (
              <div className="grid gap-2 h-full grid-rows-[auto_minmax(0,1fr)]">
                <button
                  onClick={() => {
                    setTemplate(null);
                  }}
                  className="flex items-center text-sm text-foreground/70 hover:text-foreground/100 dark:text-white/80 dark:hover:text-white"
                >
                  <ArrowLeft className="mr-2" />
                  <Trans>Back</Trans>
                </button>
                <div className="grid sm:grid-cols-[2fr,1fr] gap-6">
                  <div
                    className="h-full w-full overflow-hidden p-4 rounded-lg shadow-md"
                    style={{
                      backgroundColor: templateData.bgColor,
                    }}
                  >
                    <img
                      src={`/templates/${templateData.img}`}
                      alt={templateData.key}
                      className="rounded w-full h-full object-contain object-center"
                    />
                  </div>
                  <div className="self-center grid gap-3">
                    <h2 className="text-lg mb-2">Options</h2>
                    <Option id="layout" checked={layout} set={setLayout}>
                      <Trans>Load layout and styles</Trans>
                    </Option>
                    <Option id="content" checked={content} set={setContent}>
                      <Trans>Load default content</Trans>
                    </Option>
                    <div
                      className={classNames(
                        "text-xs text-neutral-500 rounded transition-opacity duration-200 flex gap-1 justify-start items-center",
                        {
                          "opacity-100": content,
                          "opacity-0": !content,
                        }
                      )}
                    >
                      {content ? (
                        <>
                          <WarningCircle size={16} className="shrink-0" />
                          <Trans>This will replace the current content.</Trans>
                        </>
                      ) : (
                        <>&nbsp;</>
                      )}
                    </div>
                    <Button2
                      color="blue"
                      disabled={disabled}
                      onClick={load}
                      className="mt-2"
                      data-session-activity="Load Template: Load"
                      data-template={templateData.key}
                    >
                      <Trans>Load</Trans>
                    </Button2>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-3 grid-cols-2 md:grid-cols-3"
                aria-label="Templates"
              >
                {templates.map((template) => (
                  <button
                    key={template.key}
                    onClick={() => setTemplate(template.key)}
                    className="rounded overflow-hidden md:h-[280px] shadow-sm p-2"
                    style={{ backgroundColor: template.bgColor }}
                  >
                    <img
                      key={template.img}
                      src={`/templates/${template.img}`}
                      className="rounded-lg object-contain object-center aspect-square"
                      alt={template.key}
                    />
                  </button>
                ))}
              </div>
            )}
          </Dialog.Description>
        </Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Option({
  id,
  children,
  checked,
  set,
}: {
  id: string;
  children: React.ReactNode;
  checked: boolean;
  set: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center select-none">
      <Checkbox.Root
        className="w-5 h-5 rounded bg-neutral-300 mr-2 flex items-center justify-center data-[state=checked]:bg-blue-500"
        defaultChecked
        id={id}
        checked={checked}
        onCheckedChange={set}
      >
        <Checkbox.Indicator className="text-white">
          <Check weight="bold" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label htmlFor={id} className="cursor-pointer">
        {children}
      </label>
    </div>
  );
}
