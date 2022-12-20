import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  Suspense,
  useCallback,
  useState,
} from "react";

import { useFullscreen } from "../lib/hooks";
import { CloneButton } from "./CloneButton";
import Graph from "./Graph";
import GraphWrapper from "./GraphWrapper";
import Loading from "./Loading";
import styles from "./Main.module.css";
import TabPane from "./TabPane";
import TextResizer from "./TextResizer";

type MainProps = {
  children?: ReactNode;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
};

/** The left/right column wrapper. Also controls when things should be fullscreen. */
const Main = memo(({ children, setHoverLineNumber }: MainProps) => {
  const [shouldResize, triggerResize] = useState(0);
  const trigger = useCallback(() => triggerResize((n) => n + 1), []);
  const isFullscreen = useFullscreen();
  return (
    <>
      {isFullscreen ? null : (
        <TabPane triggerResize={trigger}>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </TabPane>
      )}
      <GraphWrapper>
        <Graph
          setHoverLineNumber={setHoverLineNumber}
          shouldResize={shouldResize}
        />
        {isFullscreen ? (
          <div className={styles.CopyButtonWrapper}>
            <CloneButton />
          </div>
        ) : null}
      </GraphWrapper>
      <TextResizer />
    </>
  );
});

Main.displayName = "Main";

export default Main;
