import {
  ReactNode,
  Dispatch,
  SetStateAction,
  memo,
  useState,
  useCallback,
  Suspense,
} from "react";
import CurrentTab from "./CurrentTab";
import Loading from "./Loading";
import Graph from "./Graph";
import GraphWrapper from "./GraphWrapper";
import TabPane from "./TabPane";
import TextResizer from "./TextResizer";
import MobileTabToggle from "./MobileTabToggle";
import { useFullscreen } from "../hooks";

export type MainProps = {
  children?: ReactNode;
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
  updateGraphText: (text: string) => void;
};

const Main = memo(
  ({
    children,
    textToParse,
    setHoverLineNumber,
    updateGraphText,
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
        <GraphWrapper>
          <Graph
            textToParse={textToParse}
            setHoverLineNumber={setHoverLineNumber}
            shouldResize={shouldResize}
            updateGraphText={updateGraphText}
          />
        </GraphWrapper>
        {!isFullscreen && <MobileTabToggle />}
        <TextResizer />
      </>
    );
  }
);

Main.displayName = "Main";

export default Main;
