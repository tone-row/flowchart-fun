import { Resizable } from "re-resizable";
import React, { ReactNode, useContext } from "react";
import { LayoutContext } from "../constants";
import { Box } from "../slang";
import styles from "./ResponsiveLayout.module.css";
import Settings from "./Settings";
import Share from "./Share";

const Reresizable = ({
  children,
  triggerResize,
}: {
  children: ReactNode;
  triggerResize: () => void;
}) => {
  return (
    <Resizable
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
    </Resizable>
  );
};

export default function ResponsiveLayout({
  children,
  triggerResize,
}: {
  children: ReactNode;
  triggerResize: () => void;
}) {
  const { showing } = useContext(LayoutContext);
  const child =
    showing === "editor" ? (
      children
    ) : showing === "settings" ? (
      <Settings />
    ) : showing === "share" ? (
      <Share />
    ) : (
      showing
    );
  return (
    <>
      <Box
        at={{ tablet: { display: false } }}
        className={styles.Top}
        pt={2}
        overflow={showing !== "editor" ? "auto" : undefined}
      >
        {child}
      </Box>
      <Reresizable triggerResize={triggerResize}>
        <Box
          pt={4}
          h="100%"
          overflow={showing !== "editor" ? "auto" : undefined}
        >
          {child}
        </Box>
      </Reresizable>
    </>
  );
}
