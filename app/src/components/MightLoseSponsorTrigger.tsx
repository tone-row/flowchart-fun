import { t, Trans } from "@lingui/macro";
import * as Popover from "@radix-ui/react-popover";
import { CircleWavyWarning } from "phosphor-react";
import { useContext } from "react";

import { useIsLocalChart, useIsValidSponsor } from "../lib/hooks";
import { useRenameDialogStore } from "../lib/renameDialogStore";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./MightLoseSponsorTrigger.module.css";

export function MightLoseSponsorTrigger() {
  const { customerIsLoading } = useContext(AppContext);
  const isValidSponsor = useIsValidSponsor();
  const isLocal = useIsLocalChart();
  if (customerIsLoading) return null;
  if (!isValidSponsor) return null;
  if (!isLocal) return null;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Box
          as="button"
          p={2}
          background="palette-yellow-2"
          className={styles.MightLoseSponsorTrigger}
          rad={3}
          data-testid="might-lose-sponsor-trigger"
        >
          <CircleWavyWarning size={28} />
        </Box>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          asChild
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          className="shadow-lg border rounded-lg bg-white dark:bg-gray-800 dark:text-white"
        >
          <div className="p-4 grid gap-3 justify-items-start max-w-sm">
            <p className="text-xs opacity-80 leading-normal">
              {t`Heads up! Before you clear your cache, remember that this document isn't saved in the cloud.`}
            </p>
            <button
              className="font-bold text-sm text-blue-500 hover:underline block"
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
