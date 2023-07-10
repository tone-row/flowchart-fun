import { Trans } from "@lingui/macro";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Translate } from "phosphor-react";

import { IconOutlineButton, tooltipContentProps } from "../ui/Shared";

/**
 * A warning message that a particular page is only available in English.
 */
export function OnlyInEnglish() {
  return (
    <Tooltip.Root>
      <Tooltip.TooltipTrigger asChild>
        <IconOutlineButton>
          <Translate size={20} />
        </IconOutlineButton>
      </Tooltip.TooltipTrigger>
      <Tooltip.TooltipPortal>
        <Tooltip.TooltipContent {...tooltipContentProps}>
          <Trans>Sorry! This page is only available in English.</Trans>
        </Tooltip.TooltipContent>
      </Tooltip.TooltipPortal>
    </Tooltip.Root>
  );
}
