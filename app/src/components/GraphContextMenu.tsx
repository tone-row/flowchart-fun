import "react-contexify/dist/ReactContexify.css";

import { Trans } from "@lingui/macro";
import { memo, ReactNode, useReducer } from "react";
import { Item, Menu, Separator } from "react-contexify";
import { FiDownload } from "react-icons/fi";
import { HiOutlineClipboardCopy } from "react-icons/hi";

import { Box, Type } from "../slang";
import styles from "./GraphContextMenu.module.css";
import { smallIconSize } from "./Shared";

export const GRAPH_CONTEXT_MENU_ID = "graph-context-menu";

export const GraphContextMenu = memo(function GraphContextMenu() {
  return (
    <Menu
      id={GRAPH_CONTEXT_MENU_ID}
      className={styles.GraphContextMenu}
      animation="fade"
    >
      <CopyPNG />
      <CopySVG />
      <Separator />
      <Item onClick={() => window.flowchartFunDownloadPNG()}>
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download PNG</Trans>
        </WithIcon>
      </Item>
      <Item onClick={() => window.flowchartFunDownloadJPG()}>
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download JPG</Trans>
        </WithIcon>
      </Item>
      <Item onClick={() => window.flowchartFunDownloadSVG()}>
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download SVG</Trans>
        </WithIcon>
      </Item>
    </Menu>
  );
});

type ItemState = "idle" | "loading" | "success";
function CopySVG() {
  const [state, dispatch] = useReducer(
    (_state: ItemState, action: ItemState) => action,
    "idle"
  );
  function handleClick() {
    (async () => {
      dispatch("loading");
      const svgStr = await window.flowchartFunGetSVG();
      // copy to clipboard using navigator
      await navigator.clipboard.writeText(svgStr);
      dispatch("success");
    })();
  }
  return (
    <Item onClick={handleClick}>
      <WithIcon icon={<HiOutlineClipboardCopy size={smallIconSize} />}>
        <Trans>Copy SVG Code</Trans>
        {state === "loading" ? "..." : ""}
      </WithIcon>
    </Item>
  );
}

function CopyPNG() {
  const [state, dispatch] = useReducer(
    (_state: ItemState, action: ItemState) => action,
    "idle"
  );
  function handleClick() {
    dispatch("loading");
    setTimeout(() => {
      window.flowchartFunCopyPNG().then(() => {
        dispatch("success");
      });
    }, 0);
  }
  return (
    <Item onClick={handleClick}>
      <WithIcon icon={<HiOutlineClipboardCopy size={smallIconSize} />}>
        <Trans>Copy PNG Image</Trans>
        {state === "loading" ? "..." : ""}
      </WithIcon>
    </Item>
  );
}

const WithIcon = memo(function WithIcon({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Box items="center" flow="column" content="start normal" gap={2}>
      {icon}
      <Type size={-1}>{children}</Type>
    </Box>
  );
});
