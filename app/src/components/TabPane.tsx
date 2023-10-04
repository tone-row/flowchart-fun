import { Resizable as Reresizable } from "re-resizable";
import { memo, ReactNode } from "react";

import { useIsEditorView } from "../lib/hooks";
import { useEditorStore } from "../lib/useEditorStore";
import { PiArrowsOutLineHorizontalBold } from "react-icons/pi";
import styles from "./TabPane.module.css";
import classNames from "classnames";

const Resizable = ({
  children,
  triggerResize,
}: {
  children: ReactNode;
  triggerResize: () => void;
}) => {
  const isDragging = useEditorStore((s) => s.isDragging);

  return (
    <Reresizable
      defaultSize={{
        width: "50%",
        height: "auto",
      }}
      maxWidth="90%"
      minWidth="10%"
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      className={styles.TextareaContainer}
      handleComponent={{ right: <Handle dragging={isDragging} /> }}
      onResizeStart={() => {
        useEditorStore.setState({ isDragging: true });
      }}
      onResizeStop={() => {
        useEditorStore.setState({ isDragging: false });
        triggerResize();
      }}
    >
      {children}
    </Reresizable>
  );
};

const TabPane = memo(
  ({
    children,
    triggerResize,
  }: {
    children: ReactNode;
    triggerResize: () => void;
  }) => {
    const showing = useIsEditorView();
    return (
      <Resizable triggerResize={triggerResize}>
        <div
          className={classNames("grid h-full", {
            "overflow-auto": !showing,
          })}
        >
          {children}
        </div>
      </Resizable>
    );
  }
);

TabPane.displayName = "TabPane";

export default TabPane;

const Handle = ({ dragging = false }: { dragging: boolean }) => (
  <div
    className="hidden md:block w-0 h-full translate-x-[5px] relative z-[12]"
    data-dragging={dragging}
  >
    <button className="absolute top-1/2 left-0 -translate-x-1/2 p-1 rounded bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 cursor-col-resize">
      <PiArrowsOutLineHorizontalBold className="w-4 h-4 text-neutral-500" />
    </button>
  </div>
);
