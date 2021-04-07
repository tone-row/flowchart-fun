import styles from "./ResizableLayout.module.css";
import { Resizable } from "re-resizable";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import Graph from "./Graph";
import { AppContext } from "./AppContext";
import Spinner from "./Spinner";
import { Box } from "../slang";

export default function ResizableLayout({
  children,
  textToParse,
  setHoverLineNumber,
}: {
  children?: ReactNode;
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
}) {
  const [shouldResize, triggerResize] = useState(0);
  const { isReady } = useContext(AppContext);
  return (
    <>
      {!isReady && <Loading />}
      <Box
        template="minmax(0, 1fr) minmax(0, 1fr) / none"
        overflow="hidden"
        className={styles.App}
        at={{ tablet: { display: "flex", template: "none / none" } }}
        root
      >
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
          onResizeStop={() => triggerResize((n) => n + 1)}
        >
          {children}
        </Resizable>
        <Graph
          textToParse={textToParse}
          setHoverLineNumber={setHoverLineNumber}
          shouldResize={shouldResize}
        />
        <div id="resizer" className={styles.resizer} />
      </Box>
    </>
  );
}

function Loading() {
  return (
    <Box
      background="color-background"
      content="center"
      className={styles.Loading}
      root
    >
      <Spinner />
    </Box>
  );
}
