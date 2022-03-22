import * as HoverCard from "@radix-ui/react-hover-card";
import * as Switch from "@radix-ui/react-switch";
import { Info } from "phosphor-react";
import { memo } from "react";
import { MdPlayArrow, MdPlayDisabled } from "react-icons/md";

import { useStoreGraph } from "../lib/store.graph";
import { Box, Type } from "../slang";
import styles from "./AutoLayoutSwitch.module.css";
import graphBarStyles from "./GraphOptionsBar.module.css";

export const AutoLayoutSwitch = memo(function AutoLayoutSwitch() {
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
      {runLayout ? (
        <MdPlayArrow className={styles.Play} size={16} />
      ) : (
        <MdPlayDisabled className={styles.Play} size={16} />
      )}
      <Switch.Root
        className={styles.SwitchRoot}
        onCheckedChange={setRunLayout}
        checked={runLayout}
      >
        <Switch.Thumb className={styles.SwitchThumb} />
      </Switch.Root>
      <HoverCard.Root openDelay={0}>
        <HoverCard.Trigger asChild>
          <Box pl={0.5}>
            <Info className={styles.Info} size={16} />
          </Box>
        </HoverCard.Trigger>
        <HoverCard.Content asChild>
          <Box
            p={2}
            background="color-nodeHover"
            rad={1}
            gap={1}
            className={styles.Popover}
          >
            <Type size={-1}>Auto Layout</Type>
            <Type size={-2}>
              {`Automatically run the layout algorithm while editing your chart. Turn this off to customize your chart. NOTE: Currently, custom layouts only work for exported images: layouts are not saved between refreshes, navigations, or in share links.`}
            </Type>
            <HoverCard.Arrow style={{ fill: "var(--color-nodeHover)" }} />
          </Box>
        </HoverCard.Content>
      </HoverCard.Root>
    </Box>
  );
});
