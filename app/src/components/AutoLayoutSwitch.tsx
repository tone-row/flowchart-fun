import { t, Trans } from "@lingui/macro";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Toggle from "@radix-ui/react-toggle";
import { memo } from "react";
import { FaSnowflake } from "react-icons/fa";

import { HiddenGraphOptions } from "../lib/helpers";
import { useStoreGraph } from "../lib/store.graph";
import { Box, Type } from "../slang";
import styles from "./AutoLayoutSwitch.module.css";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import graphBarStyles from "./GraphOptionsBar.module.css";

export const AutoLayoutSwitch = memo(function AutoLayoutSwitch({
  setHiddenGraphOptions,
}: {
  setHiddenGraphOptions?: (newOptions: HiddenGraphOptions) => void;
}) {
  const setRunLayout = useStoreGraph((store) => store.setRunLayout);
  const runLayout = useStoreGraph((store) => store.runLayout);
  return (
    <Box
      className={`${graphBarStyles.BarSection} ${styles.AutoLayout} ${
        runLayout ? "checked" : ""
      }`}
      content="center"
      items="center"
      flow="column"
      gap={1}
      pr={2}
    >
      <HoverCard.Root openDelay={0}>
        <HoverCard.Trigger asChild>
          <Toggle.Root
            className={styles.Toggle}
            pressed={runLayout}
            aria-label={t`Freeze Layout`}
            onPressedChange={(pressed) => {
              setRunLayout(pressed);
              if (pressed && setHiddenGraphOptions) {
                setHiddenGraphOptions({});
              } else if (!pressed && setHiddenGraphOptions && window.__cy) {
                const nodePositions = getNodePositionsFromCy();
                setHiddenGraphOptions({ nodePositions });
              }
            }}
          >
            <FaSnowflake className={styles.Play} size={18} />
          </Toggle.Root>
        </HoverCard.Trigger>
        <HoverCard.Content asChild>
          <Box
            p={2}
            background="color-nodeHover"
            rad={1}
            gap={1}
            className={styles.Popover}
          >
            <Type size={-1}>
              <Trans>Freeze Layout</Trans>
            </Type>
            <Type size={-2}>
              {t`Freezing your chart allows you to customize the layout by disabling automatic layout.`}
            </Type>
            <HoverCard.Arrow style={{ fill: "var(--color-nodeHover)" }} />
          </Box>
        </HoverCard.Content>
      </HoverCard.Root>
    </Box>
  );
});
