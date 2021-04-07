import styles from "./ResizableLayout.module.css";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { AppContext } from "./AppContext";
import Spinner from "./Spinner";
import { Box } from "../slang";
import ResponsiveLayout from "./ResponsiveLayout";
import Graph from "./Graph";
import TextResizer from "./TextResizer";
import GraphWrapper from "./GraphWrapper";

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
      <ResponsiveLayout triggerResize={() => triggerResize((n) => n + 1)}>
        {children}
      </ResponsiveLayout>
      <GraphWrapper>
        <Graph
          textToParse={textToParse}
          setHoverLineNumber={setHoverLineNumber}
          shouldResize={shouldResize}
        />
      </GraphWrapper>
      <TextResizer />
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
