import { MagicWand, Microphone } from "phosphor-react";
import { Button2, IconButton2 } from "../ui/Shared";
import * as Popover from "@radix-ui/react-popover";
import { Trans, t } from "@lingui/macro";

export function EditWithAIButton() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button2
          leftIcon={
            <MagicWand className="group-hover-tilt-shaking" size={18} />
          }
          color="zinc"
          size="sm"
          rounded
          className="aria-[expanded=true]:bg-zinc-700"
        >
          <Trans>Edit with AI</Trans>
        </Button2>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={10}
          align="center"
          className="w-[300px] bg-white rounded shadow border p-2 grid gap-2"
        >
          <div className="relative">
            <textarea
              placeholder={t`Write your prompt here or press and hold the button to speak...`}
              className="text-xs w-full resize-none h-24 p-2 leading-normal"
            />
            <IconButton2 size="xs" className="!absolute bottom-0 right-0">
              <Microphone size={16} />
            </IconButton2>
          </div>
          <Button2 size="sm" color="purple">
            <Trans>Submit</Trans>
          </Button2>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
