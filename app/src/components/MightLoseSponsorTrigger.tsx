import { t, Trans } from "@lingui/macro";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Warning } from "phosphor-react";
import { useContext } from "react";

import { useIsLocalChart, useIsValidSponsor } from "../lib/hooks";
import { useRenameDialogStore } from "../lib/renameDialogStore";
import { IconOutlineButton, tooltipContentProps } from "../ui/Shared";
import { AppContext } from "./AppContext";

export function MightLoseSponsorTrigger() {
  const { customerIsLoading } = useContext(AppContext);
  const isValidSponsor = useIsValidSponsor();
  const isLocal = useIsLocalChart();
  if (customerIsLoading) return null;
  if (!isValidSponsor) return null;
  if (!isLocal) return null;
  return (
    <Tooltip.Root>
      <Tooltip.TooltipTrigger asChild>
        <IconOutlineButton>
          <Warning size={20} />
        </IconOutlineButton>
      </Tooltip.TooltipTrigger>
      <Tooltip.TooltipPortal>
        <Tooltip.TooltipContent {...tooltipContentProps}>
          <div className="grid gap-3 justify-items-start max-w-sm">
            <p className="text-xs opacity-80 leading-normal">
              {t`Heads up! Before you clear your cache, remember that this document isn't saved in the cloud.`}
            </p>
            <button
              className="font-bold text-xs text-blue-500 hover:underline block"
              onClick={() => {
                useRenameDialogStore.setState({
                  isOpen: true,
                  convertToHosted: true,
                });
              }}
              data-testid="convert-to-hosted"
            >
              <Trans>Convert to hosted chart?</Trans>
            </button>
          </div>
        </Tooltip.TooltipContent>
      </Tooltip.TooltipPortal>
    </Tooltip.Root>
  );
}
