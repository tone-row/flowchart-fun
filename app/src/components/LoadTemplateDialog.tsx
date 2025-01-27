import * as Dialog from "@radix-ui/react-dialog";
import { Close, Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import { Check, WarningCircle, ArrowLeft } from "phosphor-react";
import { PiShapesDuotone } from "react-icons/pi";
import { Trans } from "@lingui/macro";
import { templates } from "shared";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useCallback, useState } from "react";
import { Button2 } from "../ui/Shared";
import classNames from "classnames";
import { useDoc } from "../lib/useDoc";
import { loadTemplate } from "../lib/loadTemplate";
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
  const [template, setTemplate] = useState<null | (typeof templates)[number]>(
    null
  );
  const [layout, setLayout] = useState(true);
  // Whether to load the content or not
  const [replaceContent, setReplaceContent] = useState(getContentInitialValue);
  const disabled = !layout && !replaceContent;

  /**
   * reset the state of the dialog
   */
  const reset = useCallback(() => {
    setTemplate(null);
    setLayout(true);
    setReplaceContent(getContentInitialValue);
  }, []);

  const load = useCallback(async () => {
    loadTemplate(template, replaceContent, () => {
      reset();
      setOpen(false);
    });
  }, [template, replaceContent, reset]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) reset();
        setOpen(open);
        setReplaceContent(getContentInitialValue);
      }}
    >
      <Dialog.Trigger asChild>
        <EditorActionTextButton
          icon={PiShapesDuotone}
          data-session-activity="Load Template: Open Dialog"
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
          <Dialog.Description
            asChild
            className="content-start grid overflow-hidden"
          >
            {template ? (
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
                  <div className="h-full w-full overflow-hidden rounded-lg shadow-md">
                    <img
                      src={`/template-screenshots/${template}.png`}
                      alt={template}
                      className="rounded w-full h-full object-contain object-center"
                    />
                  </div>
                  <div className="self-center grid gap-3">
                    <h2 className="text-lg mb-2">Options</h2>
                    <Option id="layout" checked={layout} set={setLayout}>
                      <Trans>Load layout and styles</Trans>
                    </Option>
                    <Option
                      id="content"
                      checked={replaceContent}
                      set={setReplaceContent}
                    >
                      <Trans>Load default content</Trans>
                    </Option>
                    <div
                      className={classNames(
                        "text-xs text-neutral-500 rounded transition-opacity duration-200 flex gap-1 justify-start items-center",
                        {
                          "opacity-100": replaceContent,
                          "opacity-0": !replaceContent,
                        }
                      )}
                    >
                      {replaceContent ? (
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
                      data-template={template}
                    >
                      <Trans>Load</Trans>
                    </Button2>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto minimal-scrollbar">
                <div
                  className="grid gap-2 grid-cols-2 md:grid-cols-3"
                  aria-label="Templates"
                >
                  {templates.map((template) => (
                    <button
                      key={template}
                      onClick={() => setTemplate(template)}
                      className="overflow-hidden aspect-square relative group rounded-md"
                    >
                      <img
                        key={template}
                        src={`/template-screenshots/thumb_${template}.png`}
                        className="object-contain object-center w-full h-full"
                        alt={template}
                      />
                      <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200 absolute bottom-0 left-0 right-0 bg-black/80 flex items-center justify-center text-white py-2 text-xs font-mono">
                        {template}
                      </div>
                    </button>
                  ))}
                </div>
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
