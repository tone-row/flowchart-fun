import { t, Trans } from "@lingui/macro";
import * as Popover from "@radix-ui/react-popover";
import { Warning } from "phosphor-react";
import { useContext } from "react";
import { Link } from "react-router-dom";

import { useIsValidCustomer } from "../lib/hooks";
import { track } from "../lib/track";
import { IconButton2, popoverContentProps } from "../ui/Shared";
import { AppContext } from "./AppContext";
export function MightLoseWarning() {
  const isValidCustomer = useIsValidCustomer();
  const { customerIsLoading } = useContext(AppContext);
  const showMightLoseWarning = !isValidCustomer && !customerIsLoading;
  if (!showMightLoseWarning) return null;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <IconButton2 aria-label={t`Temporary Flowchart Warning`}>
          <Warning size={16} />
        </IconButton2>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content {...popoverContentProps}>
          <p className="text-xs opacity-80 leading-normal max-w-md">
            <Trans>
              This document is only saved on this computer. If you want a way to
              store documents and access them wherever you go try our Pro plan
              for only $3/month!
            </Trans>
          </p>
          <Link
            className="font-bold text-xs text-blue-500 hover:underline mt-6 block dark:text-blue-400"
            to="/pricing"
            onClick={() => track("might_lose_warning_click", "click")}
          >
            <Trans>Learn More</Trans>
          </Link>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
