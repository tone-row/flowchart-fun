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
import { Theme } from "../lib/themes/constants";
import { UpdateDoc } from "../lib/UpdateDoc";
import CurrentTab from "./CurrentTab";
import Graph from "./Graph";
import GraphWrapper from "./GraphWrapper";
import Loading from "./Loading";
import styles from "./Main.module.css";
import { CloneButton } from "./Menu";
import MobileTabToggle from "./MobileTabToggle";
import TabPane from "./TabPane";
import TextResizer from "./TextResizer";
import { UseGraphOptionsReturn } from "./useGraphOptions";

export type MainProps = {
  children?: ReactNode;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
  hiddenGraphOptionsText: string;
  options: UseGraphOptionsReturn;
  update?: UpdateDoc;
  theme: Theme;
  bg: string;
  isFrozen: boolean;
  fullText: string;
};

/** The left/right column wrapper. Also controls when things should be fullscreen. */
const Main = memo(
  ({
    children,
    setHoverLineNumber,
    hiddenGraphOptionsText,
    options,
    update,
    theme,
    bg,
    isFrozen,
    fullText,
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
        <GraphWrapper update={update} options={options} isFrozen={isFrozen}>
          <Graph
            setHoverLineNumber={setHoverLineNumber}
            shouldResize={shouldResize}
            hiddenGraphOptionsText={hiddenGraphOptionsText}
            options={options}
            update={update}
            theme={theme}
            bg={bg}
          />
          {isFullscreen ? (
            <div className={styles.CopyButtonWrapper}>
              <CloneButton fullText={fullText} />
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
