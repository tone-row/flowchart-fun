import { Resizable as Reresizable } from "re-resizable";
import { memo, ReactNode, useContext } from "react";
import { Box } from "../slang";
import styles from "./TabPane.module.css";
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
    return (
      <>
        <Box
          at={hideAtTablet}
          className={styles.Top}
          pt={2}
          overflow={showing !== "editor" ? "auto" : undefined}
        >
          {children}
        </Box>
        <Resizable triggerResize={triggerResize}>
          <Box
            pt={4}
            h="100%"
            overflow={showing !== "editor" ? "auto" : undefined}
          >
            {children}
          </Box>
        </Resizable>
      </>
    );
  }
);

TabPane.displayName = "TabPane";

export default TabPane;
