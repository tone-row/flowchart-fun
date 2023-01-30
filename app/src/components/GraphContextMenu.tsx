import "react-contexify/dist/ReactContexify.css";

import { Trans } from "@lingui/macro";
import { operate } from "graph-selector";
import { Graph, Palette, X } from "phosphor-react";
import { memo, ReactNode, useReducer } from "react";
import { Item, Menu, Separator, Submenu } from "react-contexify";
import { FiDownload } from "react-icons/fi";
import { HiOutlineClipboardCopy } from "react-icons/hi";

import { useThemeStore } from "../lib/graphThemes";
import { useIsFirefox } from "../lib/hooks";
import { useParser } from "../lib/parsers";
import { useDoc } from "../lib/prepareChart";
import { useContextMenuState } from "../lib/useContextMenuState";
import { Box, Type } from "../slang";
import styles from "./GraphContextMenu.module.css";
import { smallIconSize } from "./Shared";

export const GRAPH_CONTEXT_MENU_ID = "graph-context-menu";

export const GraphContextMenu = memo(function GraphContextMenu() {
  const isFirefox = useIsFirefox();
  return (
    <Menu
      id={GRAPH_CONTEXT_MENU_ID}
      className={styles.GraphContextMenu}
      animation="fade"
      onHidden={() => {
        // reset the context menu state
        useContextMenuState.setState({
          active: null,
        });
      }}
    >
      <NodeSubmenu />
      {!isFirefox && <CopyPNG />}
      <CopySVG />
      <Separator />
      <Item
        onClick={() => {
          window.__FF_downloadPNG();
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download PNG</Trans>
        </WithIcon>
      </Item>
      <Item
        onClick={() => {
          window.__FF_downloadJPG();
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download JPG</Trans>
        </WithIcon>
      </Item>
      <Item
        onClick={() => {
          window.__FF_downloadSVG();
        }}
      >
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
      const svgStr = await window.__FF_getSVG();
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
      window.__FF_copyPNG().then(() => {
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
      <Type>{children}</Type>
    </Box>
  );
});

function NodeSubmenu() {
  const colors = useThemeStore((theme) => theme.colors);
  const colorNames = Object.keys(colors);
  const active = useContextMenuState((state) => state.active);
  const parser = useParser();
  if (parser !== "graph-selector") return null;
  if (!active || active.type !== "node") return null;
  return (
    <>
      <Submenu
        label={
          <WithIcon icon={<Graph size={smallIconSize} />}>
            <Trans>Node</Trans>
          </WithIcon>
        }
      >
        <Submenu
          label={
            <WithIcon icon={<Palette size={smallIconSize} />}>
              <Trans>Color</Trans>
            </WithIcon>
          }
          className={styles.GridSubmenu}
        >
          {Object.entries(colors).map(([name, value]) => (
            <Item
              key={name}
              onClick={() => {
                let newText = operate(useDoc.getState().text, {
                  lineNumber: active.lineNumber,
                  operation: [
                    "removeClassesFromNode",
                    { classNames: colorNames },
                  ],
                });
                newText = operate(newText, {
                  lineNumber: active.lineNumber,
                  operation: ["addClassesToNode", { classNames: [name] }],
                });
                useDoc.setState({ text: newText });
              }}
            >
              <Box
                style={{ backgroundColor: value }}
                className={styles.ColorSquare}
              />
            </Item>
          ))}
          <Item
            key="remove-all"
            onClick={() => {
              const newText = operate(useDoc.getState().text, {
                lineNumber: active.lineNumber,
                operation: [
                  "removeClassesFromNode",
                  { classNames: colorNames },
                ],
              });
              useDoc.setState({ text: newText });
            }}
          >
            <Box className={styles.SquareButton}>
              <X size={32} />
            </Box>
          </Item>
        </Submenu>
      </Submenu>
      <Separator />
    </>
  );
}
