import "react-contexify/dist/ReactContexify.css";

import { t, Trans } from "@lingui/macro";
import { operate } from "graph-selector";
import {
  CircleDashed,
  Diamond,
  Graph,
  Palette,
  TextT,
  X,
} from "phosphor-react";
import { CSSProperties, memo, ReactNode, useReducer } from "react";
import { Item, Menu, Separator, Submenu } from "react-contexify";
import { FiDownload } from "react-icons/fi";
import { HiOutlineClipboardCopy } from "react-icons/hi";

import { useThemeStore } from "../lib/graphThemes";
import { borderStyles, shapes } from "../lib/graphUtilityClasses";
import { useIsFirefox } from "../lib/hooks";
import {
  track_downloadJPG,
  track_downloadPng,
  track_downloadSvg,
} from "../lib/logsnag";
import { useParser } from "../lib/parsers";
import { useContextMenuState } from "../lib/useContextMenuState";
import { useDoc } from "../lib/useDoc";
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
          track_downloadPng();
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download PNG</Trans>
        </WithIcon>
      </Item>
      <Item
        onClick={() => {
          window.__FF_downloadJPG();
          track_downloadJPG();
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download JPG</Trans>
        </WithIcon>
      </Item>
      <Item
        onClick={() => {
          window.__FF_downloadSVG();
          track_downloadSvg();
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

const sizes: {
  label: ReactNode;
  className?: string;
  size: number;
}[] = [
  {
    label: t`Small`,
    className: "text-sm",
    size: -1,
  },
  {
    label: t`Medium`,
    size: 0,
  },
  {
    label: t`Large`,
    className: "text-lg",
    size: 1,
  },
  {
    label: t`Extra Large`,
    className: "text-xl",
    size: 2,
  },
];

const borders = borderStyles.map((style) => style.selector.slice(5));

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
        <Submenu
          label={
            <WithIcon icon={<Diamond size={smallIconSize} />}>
              <Trans>Shape</Trans>
            </WithIcon>
          }
          className={styles.GridSubmenu}
        >
          {(shapes as string[]).map((shape, index) => (
            <Item
              key={shape}
              onClick={() => {
                let newText = operate(useDoc.getState().text, {
                  lineNumber: active.lineNumber,
                  operation: [
                    "removeClassesFromNode",
                    { classNames: shapes as string[] },
                  ],
                });
                newText = operate(newText, {
                  lineNumber: active.lineNumber,
                  operation: ["addClassesToNode", { classNames: [shape] }],
                });
                useDoc.setState({ text: newText });
              }}
            >
              <Box
                className={styles.ShapeSquare}
                style={
                  {
                    "--row": Math.floor(index / 3),
                    "--col": index % 3,
                  } as CSSProperties
                }
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
                  { classNames: shapes as string[] },
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
        <Submenu
          label={
            <WithIcon icon={<TextT size={smallIconSize} />}>
              <Trans>Size</Trans>
            </WithIcon>
          }
        >
          {sizes.map(({ label, className, size }, index) => (
            <Item
              key={index}
              onClick={() => {
                let newText = operate(useDoc.getState().text, {
                  lineNumber: active.lineNumber,
                  operation: [
                    "removeClassesFromNode",
                    {
                      classNames: sizes
                        .map((s) => s.className)
                        .filter((c): c is string => {
                          return !!c;
                        }),
                    },
                  ],
                });
                if (className)
                  newText = operate(newText, {
                    lineNumber: active.lineNumber,
                    operation: [
                      "addClassesToNode",
                      { classNames: [className] },
                    ],
                  });
                useDoc.setState({ text: newText });
              }}
            >
              <Type size={size}>{label}</Type>
            </Item>
          ))}
        </Submenu>
        <Submenu
          label={
            <WithIcon icon={<CircleDashed size={smallIconSize} />}>
              <Trans>Border</Trans>
            </WithIcon>
          }
        >
          {borders.map((className) => (
            <Item
              key={className}
              onClick={() => {
                let newText = operate(useDoc.getState().text, {
                  lineNumber: active.lineNumber,
                  operation: ["removeClassesFromNode", { classNames: borders }],
                });
                // If the border is solid, we want to remove all borders
                if (className !== "border-solid")
                  newText = operate(newText, {
                    lineNumber: active.lineNumber,
                    operation: [
                      "addClassesToNode",
                      { classNames: [className] },
                    ],
                  });
                useDoc.setState({ text: newText });
              }}
            >
              <span
                className={styles.BorderItem}
                style={{
                  borderStyle: className.slice(7),
                  borderColor:
                    className === "border-none" ? "transparent" : undefined,
                }}
              />
            </Item>
          ))}
        </Submenu>
      </Submenu>
      <Separator />
    </>
  );
}
