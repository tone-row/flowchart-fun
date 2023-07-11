import { Trans } from "@lingui/macro";
import * as Popover from "@radix-ui/react-popover";
import { PaintBrush } from "phosphor-react";
import { useState } from "react";
import { useQuery } from "react-query";
import { create } from "zustand";

import { validThemes } from "../lib/graphOptions";
import { Button2 } from "../ui/Shared";

export const usePreviewTheme = create<{ cytoscapeStyle?: string }>(
  (_set) => ({})
);

export function ThemePicker({
  applyStyle,
}: {
  applyStyle: (style: string) => void;
}) {
  const [preview, setPreview] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  useQuery(
    ["previewTheme", preview],
    async () => {
      const { cytoscapeStyle = "" } = await import(`../lib/themes/${preview}`);
      return cytoscapeStyle;
    },
    {
      enabled: !!preview,
      onSuccess: (data) => {
        usePreviewTheme.setState({
          cytoscapeStyle: data,
        });
      },
    }
  );
  return (
    <Popover.Root
      modal
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        // on close, reset the preview theme
        if (!open) {
          usePreviewTheme.setState({
            cytoscapeStyle: undefined,
          });
          setPreview("");
        }
      }}
    >
      <Popover.Trigger className="text-xs p-3 pr-5 pl-4 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 flex active:opacity-90 items-center space-x-1">
        <PaintBrush size={16} className="mr-2" />
        <Trans>Load Theme</Trans>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          className="rounded p-2 pt-4 w-[260px] bg-neutral-100 shadow-md will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade max-h-[calc(100vh_-_340px)] grid grid-rows-[auto_minmax(0,1fr)_auto] dark:bg-neutral-900"
          sideOffset={10}
          align="end"
        >
          <div className="grid gap-1 mb-2 px-1">
            <h3 className="text-base font-bold">
              <Trans>Choose a Theme</Trans>
            </h3>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              <Trans>Click to preview</Trans>
            </p>
          </div>
          <div className="grid overflow-auto">
            {validThemes.map((theme) => (
              <button
                key={theme.value}
                className="text-left text-xs p-2 rounded w-full hover:bg-neutral-300 active:bg-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 focus:bg-neutral-200 dark:focus:bg-neutral-800 focus:outline-none data-[active=true]:bg-neutral-400 dark:data-[active=true]:bg-neutral-700"
                onClick={() => {
                  setPreview(theme.value);
                  previewTheme(theme.value);
                }}
                data-active={preview === theme.value}
              >
                {theme.label()}
              </button>
            ))}
          </div>
          <p className="px-1 text-[12px] text-neutral-700 dark:text-neutral-200 my-2 leading-normal">
            <Trans>
              Loading a theme will erase any custom styles you have applied
            </Trans>
          </p>
          <Button2
            disabled={!preview}
            color="blue"
            onClick={() => {
              const cytoscapeStyle = usePreviewTheme.getState().cytoscapeStyle;
              setIsOpen(false);
              setPreview("");
              usePreviewTheme.setState({
                cytoscapeStyle: undefined,
              });
              if (cytoscapeStyle) {
                applyStyle(cytoscapeStyle);
              }
            }}
          >
            <Trans>Load Theme</Trans>
          </Button2>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

async function previewTheme(theme: string) {
  const { cytoscapeStyle } = await import(`../lib/themes/${theme}`);
  usePreviewTheme.setState({
    cytoscapeStyle,
  });
}
