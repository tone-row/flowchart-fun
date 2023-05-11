import { t, Trans } from "@lingui/macro";
import * as HoverCard from "@radix-ui/react-hover-card";
import { CircleWavyWarning } from "phosphor-react";
import { Link } from "react-router-dom";

import { track } from "../lib/track";
import { Box } from "../slang";
import styles from "./MightLoseWarning.module.css";
export function MightLoseWarning() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Box
          p={2}
          pr={3}
          background="palette-yellow-2"
          color="palette-black-0"
          className={`${styles.MightLoseWarning} overflow-hidden`}
          rad={2}
          items="center normal"
          gap={2}
          flow="column"
        >
          <CircleWavyWarning size={20} />
          <p className="text-xs opacity-80 whitespace-nowrap text-ellipsis overflow-hidden">
            {t`Heads up! Before you clear your cache, remember that this document isn't saved in the cloud.`}
          </p>
        </Box>
      </HoverCard.Trigger>
      <HoverCard.Content portalled>
        <Box
          p={4}
          background="color-background"
          color="color-foreground"
          rad={2}
          className={styles.MightLoseWarningInner}
        >
          <p className="text-sm opacity-80 leading-normal">
            <Trans>
              Remember that this document is only saved on this computer. If you
              want a way to store documents and access them wherever you go,
              then try our Pro plan with unlimited hosted charts, and more! For
              only $3/month!
            </Trans>
          </p>
          <Link
            className="font-bold text-sm text-blue-500 hover:underline mt-6 block"
            to="/pricing"
            onClick={() => track("might_lose_warning_click", "click")}
          >
            <Trans>Learn More</Trans>
          </Link>
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}
