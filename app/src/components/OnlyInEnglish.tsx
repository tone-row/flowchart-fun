import { Trans } from "@lingui/macro";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Translate } from "phosphor-react";

/**
 * A warning message that a particular page is only available in English.
 */
export function OnlyInEnglish() {
  return (
    <Tooltip.Root>
      <Tooltip.TooltipTrigger asChild>
        <div className="w-7 h-7 rounded grid content-center justify-center border border-neutral-400 text-neutral-500 dark:border-neutral-500 dark:text-neutral-400">
          <Translate size={16} />
        </div>
      </Tooltip.TooltipTrigger>
      <Tooltip.TooltipPortal>
        <Tooltip.TooltipContent
          side="bottom"
          sideOffset={10}
          className="bg-background border border-neutral-300 dark:border-neutral-600 text-xs dark:bg-neutral-700 data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade select-none rounded-md px-4 py-3 leading-none shadow-sm will-change-[transform,opacity]"
        >
          <Trans>Sorry! This page is only available in English.</Trans>
        </Tooltip.TooltipContent>
      </Tooltip.TooltipPortal>
    </Tooltip.Root>
  );
}
