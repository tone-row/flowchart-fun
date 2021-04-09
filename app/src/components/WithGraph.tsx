import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
import TabPane from "./TabPane";
import Graph from "./Graph";
import TextResizer from "./TextResizer";
import GraphWrapper from "./GraphWrapper";

export default function WithGraph({
  children,
  textToParse,
  setHoverLineNumber,
}: {
  children?: ReactNode;
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
}) {
  const [shouldResize, triggerResize] = useState(0);
  return (
    <>
      <TabPane triggerResize={() => triggerResize((n) => n + 1)}>
        {children}
      </TabPane>
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
