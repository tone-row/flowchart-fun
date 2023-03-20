import "react-contexify/dist/ReactContexify.css";

import { t, Trans } from "@lingui/macro";
import { operate } from "graph-selector";
import {
  CircleDashed,
  Diamond,
  FlowArrow,
  Graph,
  Palette,
  TextT,
  X,
} from "phosphor-react";
import { CSSProperties, memo, ReactNode, useReducer } from "react";
import { Item, Menu, Separator, Submenu } from "react-contexify";
import { FiDownload } from "react-icons/fi";
import { HiOutlineClipboardCopy } from "react-icons/hi";

import { AUTH_IMG_SCALE, UNAUTH_IMG_SCALE } from "../lib/constants";
import {
  defaultGraphTheme,
  getTheme,
  useCurrentTheme,
  useTheme,
} from "../lib/graphThemes";
import { borderStyles, shapes } from "../lib/graphUtilityClasses";
import {
  useDownloadFilename,
  useIsFirefox,
  useIsValidSponsor,
} from "../lib/hooks";
import {
  track_downloadJPG,
  track_downloadPng,
  track_downloadSvg,
} from "../lib/logsnag";
import { useParser } from "../lib/parsers";
import { useContextMenuState } from "../lib/useContextMenuState";
import { useDoc } from "../lib/useDoc";
import { Box, Type } from "../slang";
import {
  copyCanvas,
  downloadCanvas,
  downloadSvg,
  getCanvas,
  getSvg,
} from "./downloads";
import styles from "./GraphContextMenu.module.css";
import { smallIconSize } from "./Shared";

export const GRAPH_CONTEXT_MENU_ID = "graph-context-menu";

export const GraphContextMenu = memo(function GraphContextMenu() {
  const isFirefox = useIsFirefox();
  const filename = useDownloadFilename();
  const theme = useTheme();

  const isValidSponsor = useIsValidSponsor();
  const watermark = !isValidSponsor;
  const scale = isValidSponsor ? AUTH_IMG_SCALE : UNAUTH_IMG_SCALE;

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
      {/* <EdgeSubmenu /> */}
      {!isFirefox && <CopyPNG watermark={watermark} scale={scale} />}
      {isValidSponsor && <CopySVG />}
      <Item
        onClick={() => {
          if (!theme || !window.__cy) return;
          startCursorSpin();
          getCanvas({
            theme,
            cy: window.__cy,
            type: "png",
            watermark,
            scale,
          })
            .then((canvas) =>
              downloadCanvas({
                ...canvas,
                filename,
              })
            )
            .finally(stopCursorSpin);
          track_downloadPng();
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download PNG</Trans>
        </WithIcon>
      </Item>
      <Item
        onClick={() => {
          if (!theme || !window.__cy) return;
          startCursorSpin();
          getCanvas({
            theme,
            cy: window.__cy,
            type: "jpg",
            watermark,
            scale,
          })
            .then((canvas) =>
              downloadCanvas({
                ...canvas,
                filename,
              })
            )
            .finally(stopCursorSpin);
          track_downloadJPG();
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download JPG</Trans>
        </WithIcon>
      </Item>
      {isValidSponsor && (
        <Item
          onClick={async () => {
            const theme = getTheme();
            const cy = window.__cy;
            if (!theme || !cy) return;
            startCursorSpin();
            const svg = await getSvg({
              cy,
              theme,
            });
            if (!svg) return;
            downloadSvg({
              svg,
              filename,
            }).finally(stopCursorSpin);
            track_downloadSvg();
          }}
        >
          <WithIcon icon={<FiDownload size={smallIconSize} />}>
            <Trans>Download SVG</Trans>
          </WithIcon>
        </Item>
      )}
    </Menu>
  );
});

type ItemState = "idle" | "loading" | "success";
function CopySVG() {
  const [state, dispatch] = useReducer(
    (_state: ItemState, action: ItemState) => action,
    "idle"
  );

  return (
    <Item
      onClick={async () => {
        dispatch("loading");
        startCursorSpin();
        const theme = getTheme();
        const cy = window.__cy;
        if (theme && cy)
          // copy to clipboard using navigator
          await navigator.clipboard.writeText(
            await getSvg({
              cy,
              theme,
            })
          );
        dispatch("success");
        stopCursorSpin();
      }}
    >
      <WithIcon icon={<HiOutlineClipboardCopy size={smallIconSize} />}>
        <Trans>Copy SVG Code</Trans>
        {state === "loading" ? "..." : ""}
      </WithIcon>
    </Item>
  );
}

function CopyPNG({
  watermark,
  scale,
}: {
  watermark?: boolean;
  scale?: number;
}) {
  const theme = useTheme();

  const [state, dispatch] = useReducer(
    (_state: ItemState, action: ItemState) => action,
    "idle"
  );
  function handleClick() {
    dispatch("loading");
    startCursorSpin();
    setTimeout(() => {
      if (!window.__cy || !theme) return;
      getCanvas({
        theme,
        cy: window.__cy,
        type: "png",
        watermark,
        scale,
      })
        .then(copyCanvas)
        .finally(() => {
          dispatch("success");
          stopCursorSpin();
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
  const active = useContextMenuState((state) => state.active);
  const themeKey = useDoc((doc) => doc.meta?.theme ?? defaultGraphTheme);
  const theme = useCurrentTheme(themeKey as string);
  const colors = theme?.colors ?? {};
  const colorNames = Object.keys(colors);
  const parser = useParser();
  const selected = useSelectedNodes();
  const activeSelection = selected.length
    ? selected.map((s) => {
        const data = s.data();
        return {
          id: data.id,
          lineNumber: data.lineNumber,
          type: "node",
        };
      })
    : [active];
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
                let newText = useDoc.getState().text;
                for (const selection of activeSelection) {
                  if (!selection) continue;
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: [
                      "removeClassesFromNode",
                      { classNames: colorNames },
                    ],
                  });
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: ["addClassesToNode", { classNames: [name] }],
                  });
                }
                useDoc.setState({ text: newText }, false, "NodeSubmenu/color");
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
              let newText = useDoc.getState().text;
              for (const selection of activeSelection) {
                if (!selection) continue;
                newText = operate(newText, {
                  lineNumber: selection.lineNumber,
                  operation: [
                    "removeClassesFromNode",
                    { classNames: colorNames },
                  ],
                });
              }
              useDoc.setState(
                { text: newText },
                false,
                "NodeSubmenu/color/removeAll"
              );
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
                let newText = useDoc.getState().text;
                for (const selection of activeSelection) {
                  if (!selection) continue;
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: [
                      "removeClassesFromNode",
                      { classNames: shapes as string[] },
                    ],
                  });
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: ["addClassesToNode", { classNames: [shape] }],
                  });
                }
                useDoc.setState({ text: newText }, false, "NodeSubmenu/shape");
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
              let newText = useDoc.getState().text;
              for (const selection of activeSelection) {
                if (!selection) continue;
                newText = operate(newText, {
                  lineNumber: selection.lineNumber,
                  operation: [
                    "removeClassesFromNode",
                    { classNames: shapes as string[] },
                  ],
                });
              }
              useDoc.setState(
                { text: newText },
                false,
                "NodeSubmenu/shape/removeAll"
              );
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
                let newText = useDoc.getState().text;
                for (const selection of activeSelection) {
                  if (!selection) continue;
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
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
                      lineNumber: selection.lineNumber,
                      operation: [
                        "addClassesToNode",
                        { classNames: [className] },
                      ],
                    });
                }
                useDoc.setState({ text: newText }, false, "NodeSubmenu/size");
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
                let newText = useDoc.getState().text;
                for (const selection of activeSelection) {
                  if (!selection) continue;
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: [
                      "removeClassesFromNode",
                      { classNames: borders },
                    ],
                  });
                  // If the border is solid, we want to remove all borders
                  if (className !== "border-solid")
                    newText = operate(newText, {
                      lineNumber: selection.lineNumber,
                      operation: [
                        "addClassesToNode",
                        { classNames: [className] },
                      ],
                    });
                }
                useDoc.setState({ text: newText }, false, "NodeSubmenu/border");
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

function useSelectedNodes() {
  const cy = window.__cy;
  if (!cy) return [];
  return cy.$("node:selected");
}

/**
 * add the cursor spin class to the body
 */
function startCursorSpin() {
  document.body.classList.add("cursor-wait");
}

/**
 * remove the cursor spin class from the body
 */
function stopCursorSpin() {
  setTimeout(() => {
    document.body.classList.remove("cursor-wait");
  }, 500);
}

function EdgeSubmenu() {
  const active = useContextMenuState((state) => state.active);
  const selected = useSelectedNodes();
  const activeSelection = selected.length
    ? selected.map((s) => {
        const data = s.data();
        return {
          id: data.id,
          lineNumber: data.lineNumber,
          type: "node",
        };
      })
    : [active];
  if (!active || active.type !== "edge") return null;
  console.log({ activeSelection });
  return (
    <Submenu
      label={
        <WithIcon icon={<FlowArrow size={smallIconSize} />}>
          <Trans>Edge</Trans>
        </WithIcon>
      }
    >
      <div />
    </Submenu>
  );
}
