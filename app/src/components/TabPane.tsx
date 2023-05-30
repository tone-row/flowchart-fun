import { DotsThreeVertical } from "phosphor-react";
import { Resizable as Reresizable } from "re-resizable";
import { memo, ReactNode } from "react";

import { useIsEditorView } from "../lib/hooks";
import { useEditorStore } from "../lib/useEditorStore";
import { Box } from "../slang";
import styles from "./TabPane.module.css";

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
        <Box h="100%" overflow={!showing ? "auto" : undefined}>
          {children}
        </Box>
      </Resizable>
    );
  }
);

TabPane.displayName = "TabPane";

export default TabPane;

const Handle = ({ dragging = false }: { dragging: boolean }) => (
  <Box className={styles.Handle} content="center" data-dragging={dragging}>
    <DotsThreeVertical height={32} width={32} />
  </Box>
);
