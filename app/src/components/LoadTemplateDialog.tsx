import * as Dialog from "@radix-ui/react-dialog";
import { Close, Content, Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import {
  ArrowLineLeft,
  FolderOpen,
  Check,
  WarningCircle,
  Folder,
} from "phosphor-react";
import { Trans } from "@lingui/macro";
import { templates } from "../lib/templates/templates";
import * as Checkbox from "@radix-ui/react-checkbox";
import { useCallback, useState } from "react";
import { Button2 } from "../ui/Shared";
import classNames from "classnames";
import { getDefaultChart } from "../lib/getDefaultChart";
import { useDoc } from "../lib/useDoc";
import { prepareChart } from "../lib/prepareChart/prepareChart";
import { useUnmountStore } from "../lib/useUnmountStore";

export function LoadTemplateDialog() {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<
    null | typeof templates[number]["key"]
  >(null);
  const templateData = templates.find((t) => t.key === template);
  const [layout, setLayout] = useState(true);
  const [content, setContent] = useState(false);
  const disabled = !layout && !content;

  /**
   * reset the state of the dialog
   */
  const reset = useCallback(() => {
    setTemplate(null);
    setLayout(true);
    setContent(false);
  }, []);

  const load = useCallback(() => {
    (async () => {
      if (!template || !templateData) return;
      let templateContent: string, nextLayout: string;
      if (template === "default") {
        const chart = getDefaultChart();
        const parts = chart.split("=====");
        templateContent = parts[0];
        nextLayout = `=====${parts[1]}=====`;
      } else {
        const importTemplate = await import(
          `../lib/templates/${template}-template.ts`
        );
        templateContent = importTemplate.content;
        nextLayout = importTemplate.template;
      }

      const { text, details } = useDoc.getState();

      const nextContent = content ? templateContent : text;

      prepareChart(`${nextContent}\n${nextLayout}`, details);
      reset();
      setOpen(false);
      requestAnimationFrame(() => {
        useUnmountStore.setState({
          unmount: true,
        });
      });
    })();
  }, [template, templateData, content, reset]);

  return (
    <Dialog.Root
      modal
      open={open}
      onOpenChange={(open) => {
        if (!open) reset();
        setOpen(open);
      }}
    >
      <Dialog.Trigger asChild>
        <EditorActionTextButton icon={open ? FolderOpen : Folder}>
          <Trans>Templates</Trans>
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Content
          overflowV
          maxWidthClass="max-w-[880px]"
          className="overflow-y-auto max-h-[calc(100vh-2rem)] h-[576px] grid-rows-[auto_minmax(0,1fr)]"
        >
          <Close />
          <Dialog.Title className="text-xl font-bold flex items-center">
            <FolderOpen className="mr-2" />
            <Trans>Templates</Trans>
          </Dialog.Title>
          <Dialog.Description asChild>
            {templateData ? (
              <div className="grid gap-2 h-full grid-rows-[auto_minmax(0,1fr)]">
                <button
                  onClick={() => {
                    setTemplate(null);
                  }}
                  className="flex items-center text-sm text-foreground/70 hover:text-foreground/100 focus:outline-foreground/10 focus:outline-2 outline-offset-4 rounded-md"
                >
                  <ArrowLineLeft className="mr-2" />
                  <Trans>Back</Trans>
                </button>
                <div className="grid grid-cols-[2fr,1fr] gap-6">
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
                          This will replace the current content.
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
                    >
                      Load
                    </Button2>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-2 sm:grid-cols-2 md:grid-cols-3"
                aria-label="Templates"
              >
                {templates.map((template) => (
                  <button
                    key={template.key}
                    className="relative grid gap-2 group focus:outline-foreground/10 focus:outline-2 outline-offset-4 rounded-md"
                    onClick={() => setTemplate(template.key)}
                  >
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                      className="p-1 h-[246px] rounded-sm border border-foreground/10 opacity-70 hover:opacity-100 group-data-[state=checked]:opacity-100 group-data-[state=checked]:border-foreground/30 overflow-hidden group-data-[state=checked]:shadow-sm"
                      style={{ backgroundColor: template.bgColor }}
                    >
                      <img
                        key={template.img}
                        src={`/templates/${template.img}`}
                        className="rounded w-full h-full object-contain object-center"
                        alt={template.key}
                        height={273}
                        width={273}
                      />
                    </div>
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