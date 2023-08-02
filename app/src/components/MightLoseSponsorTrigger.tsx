import { t, Trans } from "@lingui/macro";
import * as Popover from "@radix-ui/react-popover";
import { Warning } from "phosphor-react";
import { useContext } from "react";

import { useIsLocalChart, useIsProUser } from "../lib/hooks";
import { useRenameDialogStore } from "../lib/renameDialogStore";
import { IconButton2, popoverContentProps } from "../ui/Shared";
import { AppContext } from "./AppContext";

export function MightLoseSponsorTrigger() {
  const { customerIsLoading } = useContext(AppContext);
  const isProUser = useIsProUser();
  const isLocal = useIsLocalChart();
  if (customerIsLoading) return null;
  if (!isProUser) return null;
  if (!isLocal) return null;
  return (
    <Popover.Root>
      <Popover.Trigger asChild data-testid="might-lose-sponsor-trigger">
        <IconButton2 aria-label={t`Temporary Flowchart Warning`}>
          <Warning size={16} />
        </IconButton2>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content {...popoverContentProps}>
          <div className="grid gap-3 justify-items-start max-w-sm">
            <p className="text-xs opacity-80 leading-normal">
              {t`This is a temporary chart, it will be deleted when you clear your browser cache.`}
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
              <Trans>Convert this to a hosted chart?</Trans>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
