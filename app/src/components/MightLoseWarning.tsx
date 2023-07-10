import { Trans } from "@lingui/macro";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Warning } from "phosphor-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

import { useIsValidCustomer } from "../lib/hooks";
import { track } from "../lib/track";
import { IconOutlineButton, tooltipContentProps } from "../ui/Shared";
import { AppContext } from "./AppContext";
export function MightLoseWarning() {
  const isValidCustomer = useIsValidCustomer();
  const { customerIsLoading } = useContext(AppContext);
  const showMightLoseWarning = !isValidCustomer && !customerIsLoading;
  if (!showMightLoseWarning) return null;
  return (
    <Tooltip.Root>
      <Tooltip.TooltipTrigger asChild>
        <IconOutlineButton>
          <Warning size={20} />
        </IconOutlineButton>
      </Tooltip.TooltipTrigger>
      <Tooltip.TooltipPortal>
        <Tooltip.TooltipContent {...tooltipContentProps}>
          <p className="text-xs opacity-80 leading-normal max-w-md">
            <Trans>
              Remember that this document is only saved on this computer. If you
              want a way to store documents and access them wherever you go,
              then try our Pro plan with unlimited hosted charts, and more! For
              only $3/month!
            </Trans>
          </p>
          <Link
            className="font-bold text-xs text-blue-500 hover:underline mt-6 block"
            to="/pricing"
            onClick={() => track("might_lose_warning_click", "click")}
          >
            <Trans>Learn More</Trans>
          </Link>
        </Tooltip.TooltipContent>
      </Tooltip.TooltipPortal>
    </Tooltip.Root>
  );
}
