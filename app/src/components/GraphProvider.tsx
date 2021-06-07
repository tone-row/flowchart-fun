import React, { createContext } from "react";
import { GraphOptionsObject } from "../constants";
import Main, { MainProps } from "./Main";

type GraphContextType = {
  editable: boolean;
  updateGraphOptionsText?: (n: GraphOptionsObject) => void;
  graphOptions: GraphOptionsObject;
};

export const GraphContext = createContext({} as GraphContextType);

export default function GraphProvider({
  editable,
  updateGraphOptionsText,
  graphOptions,
  ...props
}: MainProps & GraphContextType) {
  return (
    <GraphContext.Provider
      value={{
        editable,
        updateGraphOptionsText,
        graphOptions,
      }}
    >
      <Main {...props} />
    </GraphContext.Provider>
  );
}
