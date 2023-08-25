import {
  memo,
  ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useFullscreen, useIsProUser } from "../lib/hooks";
import { useUnmountStore } from "../lib/useUnmountStore";
import { CloneButton } from "./CloneButton";
import Graph from "./Graph";
import GraphWrapper from "./GraphWrapper";
import Loading from "./Loading";
import styles from "./Main.module.css";
import TabPane from "./TabPane";

type MainProps = {
  children?: ReactNode;
};

/** The left/right column wrapper. Also controls when things should be fullscreen. */
const Main = memo(({ children }: MainProps) => {
  const [shouldResize, triggerResize] = useState(0);
  const trigger = useCallback(() => triggerResize((n) => n + 1), []);
  const isFullscreen = useFullscreen();
  const unmount = useUnmountStore((state) => state.unmount);
  useEffect(() => {
    if (unmount) {
      // Defer
      setTimeout(() => {
        useUnmountStore.setState({
          unmount: false,
        });
      }, 100);
    }
  }, [unmount]);
  const isProUser = useIsProUser();
  return (
    <>
      {isFullscreen ? null : (
        <TabPane triggerResize={trigger}>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </TabPane>
      )}
      <GraphWrapper>
        {unmount ? <Loading /> : <Graph shouldResize={shouldResize} />}
        {isFullscreen && isProUser ? (
          <div className={styles.CopyButtonWrapper}>
            <CloneButton />
          </div>
        ) : null}
      </GraphWrapper>
    </>
  );
});

Main.displayName = "Main";

export default Main;
