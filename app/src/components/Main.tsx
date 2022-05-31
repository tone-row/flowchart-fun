import {
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  Suspense,
  useCallback,
  useState,
} from "react";

import { HiddenGraphOptions } from "../lib/helpers";
import { useFullscreen } from "../lib/hooks";
import CurrentTab from "./CurrentTab";
import Graph from "./Graph";
import GraphWrapper from "./GraphWrapper";
import Loading from "./Loading";
import styles from "./Main.module.css";
import { CloneButton } from "./MenuNext";
import MobileTabToggle from "./MobileTabToggle";
import TabPane from "./TabPane";
import TextResizer from "./TextResizer";

export type MainProps = {
  children?: ReactNode;
  textToParse: string;
  linesOfYaml?: number;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
  setHiddenGraphOptions?: (newOptions: any) => void;
  hiddenGraphOptions?: HiddenGraphOptions;
};

const Main = memo(
  ({
    children,
    textToParse,
    setHoverLineNumber,
    linesOfYaml,
    setHiddenGraphOptions,
    hiddenGraphOptions,
  }: MainProps) => {
    const [shouldResize, triggerResize] = useState(0);
    const trigger = useCallback(() => triggerResize((n) => n + 1), []);
    const isFullscreen = useFullscreen();
    return (
      <>
        {isFullscreen ? null : (
          <TabPane triggerResize={trigger}>
            <Suspense fallback={<Loading />}>
              <CurrentTab>{children}</CurrentTab>
            </Suspense>
          </TabPane>
        )}
        <GraphWrapper setHiddenGraphOptions={setHiddenGraphOptions}>
          <Graph
            textToParse={textToParse}
            setHoverLineNumber={setHoverLineNumber}
            shouldResize={shouldResize}
            linesOfYaml={linesOfYaml}
            setHiddenGraphOptions={setHiddenGraphOptions}
            hiddenGraphOptions={hiddenGraphOptions}
          />
          {isFullscreen ? (
            <div className={styles.CopyButtonWrapper}>
              <CloneButton />
            </div>
          ) : null}
        </GraphWrapper>
        {!isFullscreen && <MobileTabToggle />}
        <TextResizer />
      </>
    );
  }
);

Main.displayName = "Main";

export default Main;
