import { Resizable as Reresizable } from "re-resizable";
import { lazy, memo, ReactNode, useContext, useMemo } from "react";
import { Box } from "../slang";
import styles from "./TabPane.module.css";
const Share = lazy(() => import("./Share"));
const Settings = lazy(() => import("./Settings"));
const Navigation = lazy(() => import("./Navigation"));
import { AppContext } from "./AppContext";

const Resizable = ({
  children,
  triggerResize,
}: {
  children: ReactNode;
  triggerResize: () => void;
}) => {
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
      handleClasses={{ right: styles.resizableHandle }}
      onResizeStop={triggerResize}
    >
      {children}
    </Reresizable>
  );
};

const hideAtTablet = { tablet: { display: false } };

const TabPane = memo(
  ({
    children,
    triggerResize,
  }: {
    children: ReactNode;
    triggerResize: () => void;
  }) => {
    const { showing } = useContext(AppContext);
    const child = useMemo(() => {
      return showing === "editor" ? (
        children
      ) : showing === "settings" ? (
        <Settings />
      ) : showing === "share" ? (
        <Share />
      ) : showing === "navigation" ? (
        <Navigation />
      ) : (
        showing
      );
    }, [children, showing]);
    return (
      <>
        <Box
          at={hideAtTablet}
          className={styles.Top}
          pt={2}
          overflow={showing !== "editor" ? "auto" : undefined}
        >
          {child}
        </Box>
        <Resizable triggerResize={triggerResize}>
          <Box
            pt={4}
            h="100%"
            overflow={showing !== "editor" ? "auto" : undefined}
          >
            {child}
          </Box>
        </Resizable>
      </>
    );
  }
);

TabPane.displayName = "TabPane";

export default TabPane;
