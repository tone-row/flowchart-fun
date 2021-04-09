import React, { Dispatch, ReactNode, SetStateAction, useState } from "react";
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
  return (
    <>
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
