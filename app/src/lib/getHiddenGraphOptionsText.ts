import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";

export const getHiddenGraphOptionsText = <T extends {}>(
  newOptions: T,
  t: string
) => {
  return t + HIDDEN_GRAPH_OPTIONS_DIVIDER + JSON.stringify(newOptions);
};
