import "react-contexify/dist/ReactContexify.css";

import { Trans } from "@lingui/macro";
import { operate } from "graph-selector";
import { X } from "phosphor-react";
import { memo, ReactNode, useMemo, useReducer } from "react";
import { Item, Menu, Separator, Submenu } from "react-contexify";
import { FiDownload } from "react-icons/fi";
import { HiOutlineClipboardCopy } from "react-icons/hi";

import { AUTH_IMG_SCALE, UNAUTH_IMG_SCALE } from "../lib/constants";
import {
  useHasProAccess,
  useDownloadFilename,
  useIsFirefox,
} from "../lib/hooks";
import { useContextMenuState } from "../lib/useContextMenuState";
import { useDoc } from "../lib/useDoc";
import { Box } from "../slang";
import { smallIconSize } from "../ui/Shared";
import {
  copyCanvas,
  downloadCanvas,
  downloadSvg,
  getCanvas,
  getSvg,
} from "./downloads";
import styles from "./GraphContextMenu.module.css";
import { useProcessStyleStore } from "../lib/preprocessStyle";

export const GRAPH_CONTEXT_MENU_ID = "graph-context-menu";

export const GraphContextMenu = memo(function GraphContextMenu() {
  const isFirefox = useIsFirefox();
  const filename = useDownloadFilename();

  const hasProAccess = useHasProAccess();
  const watermark = !hasProAccess;
  const scale = hasProAccess ? AUTH_IMG_SCALE : UNAUTH_IMG_SCALE;

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
      <EdgeSubmenu />
      {!isFirefox && <CopyPNG watermark={watermark} scale={scale} />}
      {hasProAccess && <CopySVG />}
      <Item
        onClick={() => {
          if (!window.__cy) return;
          startCursorSpin();
          getCanvas({
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
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download PNG</Trans>
        </WithIcon>
      </Item>
      <Item
        onClick={() => {
          if (!window.__cy) return;
          startCursorSpin();
          getCanvas({
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
        }}
      >
        <WithIcon icon={<FiDownload size={smallIconSize} />}>
          <Trans>Download JPG</Trans>
        </WithIcon>
      </Item>
      {hasProAccess && (
        <Item
          onClick={async () => {
            const cy = window.__cy;
            if (!cy) return;
            startCursorSpin();
            const svg = await getSvg({
              cy,
            });
            if (!svg) return;
            downloadSvg({
              svg,
              filename,
            }).finally(stopCursorSpin);
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
        const cy = window.__cy;
        if (cy)
          // copy to clipboard using navigator
          await navigator.clipboard.writeText(
            await getSvg({
              cy,
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
  const [state, dispatch] = useReducer(
    (_state: ItemState, action: ItemState) => action,
    "idle"
  );
  function handleClick() {
    dispatch("loading");
    startCursorSpin();
    setTimeout(() => {
      if (!window.__cy) return;
      getCanvas({
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
      <span className="text-sm">{children}</span>
    </Box>
  );
});

function NodeSubmenu() {
  const active = useContextMenuState((state) => state.active);
  // make sure cy node is not parent
  const isParent = window.__cy?.$(`#${active?.id}`)?.isParent();
  if (isParent) return <ParentSubmenu />;
  return <ChildlessSubmenu />;
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
    : active
    ? [active]
    : [];
  const dynamicClassesEdges = useProcessStyleStore(
    (state) => state.dynamicClassesEdges
  );
  const dynamicClasses = useMemo<Record<
    string,
    Record<string, string>
  > | null>(() => {
    return convertDynamicClasses(dynamicClassesEdges);
  }, [dynamicClassesEdges]);
  if (!active || active.type !== "edge" || !dynamicClasses) return null;
  return (
    <DynamicClassesMenu
      dynamicClasses={dynamicClasses}
      activeSelection={activeSelection}
      type="edge"
    />
  );
}

function convertDynamicClasses(dynamicClassesChildless: string[]) {
  if (!dynamicClassesChildless || !dynamicClassesChildless.length) return null;
  let classes: Record<string, Record<string, string>> = {};

  for (const className of dynamicClassesChildless) {
    const [name, option] = className.split("_");
    if (!classes[name]) classes[name] = {};
    classes[name][option] = className;
  }

  return classes;
}

function DynamicClassesMenu({
  dynamicClasses,
  activeSelection,
  type,
}: {
  dynamicClasses: Record<string, Record<string, string>>;
  activeSelection: { id: any; lineNumber: any; type: string }[];
  type: "node" | "edge";
}) {
  return (
    <>
      {Object.entries(dynamicClasses).map(([name, options]) => (
        <Submenu
          key={name}
          // className="max-h-[200px] overflow-y-auto"
          label={
            <span className="text-sm capitalize">
              {name.replace(/-/g, " ")}
            </span>
          }
        >
          {Object.entries(options).map(([option, className]) => (
            <Item
              key={className}
              onClick={() => {
                let newText = useDoc.getState().text;
                for (const selection of activeSelection) {
                  if (!selection) continue;

                  // get classnames to remove
                  const classNamesToRemove = Object.values(options).filter(
                    (c) => c !== className
                  );

                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: [
                      type === "node"
                        ? "removeClassesFromNode"
                        : "removeClassesFromEdge",
                      { classNames: classNamesToRemove },
                    ],
                  });
                  newText = operate(newText, {
                    lineNumber: selection.lineNumber,
                    operation: [
                      type === "node" ? "addClassesToNode" : "addClassesToEdge",
                      { classNames: [className] },
                    ],
                  });
                }
                useDoc.setState(
                  { text: newText },
                  false,
                  "NodeSubmenu/dynamic"
                );
              }}
            >
              <span className="text-sm capitalize">{option}</span>
            </Item>
          ))}
          {/** Item to remove all */}
          <Item
            onClick={() => {
              let newText = useDoc.getState().text;
              for (const selection of activeSelection) {
                if (!selection) continue;
                newText = operate(newText, {
                  lineNumber: selection.lineNumber,
                  operation: [
                    type === "node"
                      ? "removeClassesFromNode"
                      : "removeClassesFromEdge",
                    { classNames: Object.values(options) },
                  ],
                });
              }
              useDoc.setState({ text: newText }, false, "NodeSubmenu/dynamic");
            }}
          >
            <X size={smallIconSize} className="mx-auto" />
          </Item>
        </Submenu>
      ))}
    </>
  );
}

function ChildlessSubmenu() {
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
    : active
    ? [active]
    : [];

  const dynamicClassesChildless = useProcessStyleStore(
    (state) => state.dynamicClassesChildless
  );

  /** Read classes into a format we can build a submenu out of */
  const dynamicClasses = useMemo<Record<
    string,
    Record<string, string>
  > | null>(() => {
    return convertDynamicClasses(dynamicClassesChildless);
  }, [dynamicClassesChildless]);
  if (!active || active.type !== "node") return null;
  return dynamicClasses ? (
    <>
      <DynamicClassesMenu
        dynamicClasses={dynamicClasses}
        activeSelection={activeSelection}
        type="node"
      />
      <Separator />
    </>
  ) : null;
}

function ParentSubmenu() {
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
    : active
    ? [active]
    : [];
  const dynamicClassesParent = useProcessStyleStore(
    (state) => state.dynamicClassesParent
  );
  /** Read classes into a format we can build a submenu out of */
  const dynamicClasses = useMemo<Record<
    string,
    Record<string, string>
  > | null>(() => {
    return convertDynamicClasses(dynamicClassesParent);
  }, [dynamicClassesParent]);
  if (!active || active.type !== "node" || !dynamicClasses) return null;
  return (
    <>
      <DynamicClassesMenu
        dynamicClasses={dynamicClasses}
        activeSelection={activeSelection}
        type="node"
      />
      <Separator />
    </>
  );
}
