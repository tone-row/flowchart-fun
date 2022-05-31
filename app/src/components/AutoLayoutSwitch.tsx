import { t, Trans } from "@lingui/macro";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Toggle from "@radix-ui/react-toggle";
import { memo } from "react";
import { HiLockClosed } from "react-icons/hi";
import { MdPlayArrow } from "react-icons/md";

import { useStoreGraph } from "../lib/store.graph";
import { Box, Type } from "../slang";
import styles from "./AutoLayoutSwitch.module.css";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import graphBarStyles from "./GraphOptionsBar.module.css";

export const AutoLayoutSwitch = memo(function AutoLayoutSwitch({
  setHiddenGraphOptions,
}: {
  setHiddenGraphOptions?: (newOptions: any) => void;
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
            {runLayout ? (
              <MdPlayArrow className={styles.Play} size={18} />
            ) : (
              <HiLockClosed className={styles.Play} size={18} />
            )}
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
              <Trans>Auto Layout</Trans>
            </Type>
            <Type size={-2}>
              {t`Automatically run the layout algorithm while editing your chart. Turn this off to customize your chart. NOTE: Currently, custom layouts only work for exported images: layouts are not saved between refreshes, navigations, or in share links.`}
            </Type>
            <HoverCard.Arrow style={{ fill: "var(--color-nodeHover)" }} />
          </Box>
        </HoverCard.Content>
      </HoverCard.Root>
    </Box>
  );
});
