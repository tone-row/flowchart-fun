import React, {
  ReactNode,
  Dispatch,
  SetStateAction,
  memo,
  useState,
  useCallback,
  Suspense,
} from "react";
import { useRouteMatch } from "react-router-dom";
import Graph from "./Graph";
import TabPane from "./TabPane";
import TextResizer from "./TextResizer";
import GraphWrapper from "./GraphWrapper";
import Loading from "./Loading";
import CurrentTab from "./CurrentTab";

export type MainProps = {
  children?: ReactNode;
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
};

const Main = memo(
  ({ children, textToParse, setHoverLineNumber }: MainProps) => {
    const [shouldResize, triggerResize] = useState(0);
    const trigger = useCallback(() => triggerResize((n) => n + 1), []);
    const { path } = useRouteMatch();
    const isFullscreen = path === "/f/:graphText?";
    return (
      <>
        {isFullscreen ? null : (
          <TabPane triggerResize={trigger}>
            <Suspense fallback={<Loading />}>
              <CurrentTab>{children}</CurrentTab>
            </Suspense>
          </TabPane>
        )}
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
);

Main.displayName = "Main";

export default Main;
