import React, {
  createContext,
  Dispatch,
  memo,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import TabPane from "./TabPane";
import Graph from "./Graph";
import TextResizer from "./TextResizer";
import GraphWrapper from "./GraphWrapper";
import { GraphOptionsObject } from "../constants";

type WithGraphProps = {
  children?: ReactNode;
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
};

const WithGraph = memo(
  ({ children, textToParse, setHoverLineNumber }: WithGraphProps) => {
    const [shouldResize, triggerResize] = useState(0);
    const trigger = useCallback(() => triggerResize((n) => n + 1), []);
    return (
      <>
        <TabPane triggerResize={trigger}>{children}</TabPane>
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

WithGraph.displayName = "WithGraph";

type WithGraphContextType = {
  editable: boolean;
  updateGraphOptionsText: (n: GraphOptionsObject) => void;
  graphOptions: GraphOptionsObject;
};
export const WithGraphContext = createContext({} as WithGraphContextType);

export default function WithGraphWrapper({
  editable,
  updateGraphOptionsText,
  graphOptions,
  ...props
}: WithGraphProps & WithGraphContextType) {
  const updateOptions = useCallback(updateGraphOptionsText, [
    updateGraphOptionsText,
  ]);
  return (
    <WithGraphContext.Provider
      value={{
        editable,
        updateGraphOptionsText: updateOptions,
        graphOptions,
      }}
    >
      <WithGraph {...props} />
    </WithGraphContext.Provider>
  );
}
