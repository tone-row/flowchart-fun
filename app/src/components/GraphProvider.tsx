import React, { createContext, useCallback } from "react";
import { GraphOptionsObject } from "../constants";
import Main, { MainProps } from "./Main";

type GraphContextType = {
  editable: boolean;
  updateGraphOptionsText: (n: GraphOptionsObject) => void;
  graphOptions: GraphOptionsObject;
};

export const GraphContext = createContext({} as GraphContextType);

export default function GraphProvider({
  editable,
  updateGraphOptionsText,
  graphOptions,
  ...props
}: MainProps & GraphContextType) {
  const updateOptions = useCallback(updateGraphOptionsText, [
    updateGraphOptionsText,
  ]);
  return (
    <GraphContext.Provider
      value={{
        editable,
        updateGraphOptionsText: updateOptions,
        graphOptions,
      }}
    >
      <Main {...props} />
    </GraphContext.Provider>
  );
}
