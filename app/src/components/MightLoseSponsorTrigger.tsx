import { t, Trans } from "@lingui/macro";
import * as HoverCard from "@radix-ui/react-hover-card";
import { CircleWavyWarning } from "phosphor-react";
import { useContext } from "react";

import { useIsLocalChart, useIsValidSponsor } from "../lib/hooks";
import { useRenameDialogStore } from "../lib/renameDialogStore";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./MightLoseSponsorTrigger.module.css";
import styles2 from "./MightLoseWarning.module.css";

export function MightLoseSponsorTrigger() {
  const { customerIsLoading } = useContext(AppContext);
  const isValidSponsor = useIsValidSponsor();
  const isLocal = useIsLocalChart();
  if (customerIsLoading) return null;
  if (!isValidSponsor) return null;
  if (!isLocal) return null;
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
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
      </HoverCard.Trigger>
      <HoverCard.Content portalled>
        <Box
          p={4}
          background="color-background"
          color="color-foreground"
          rad={2}
          className={styles2.MightLoseWarningInner}
        >
          <Type>
            {t`Heads up! Before you clear your cache, remember that this document isn't saved in the cloud.`}
          </Type>
          <Type
            as="button"
            weight="700"
            color="color-highlightColor"
            onClick={() => {
              useRenameDialogStore.setState({
                isOpen: true,
                convertToHosted: true,
              });
            }}
          >
            <Trans>Convert to hosted chart?</Trans>
          </Type>
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}
