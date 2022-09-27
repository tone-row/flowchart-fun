import { GraphOptionsObject } from "./constants";

/*
get chart text from server
we get hidden graph options
we store just visible text in some state
we store graph options in some state
we convert graph options back into a string
we create some throttled visibleText state
we merge the visibleText and the graphOptions text back into fullText
we store the lastText in a ref

the idea is that we have a recreated version of the fulltext based on new graphOptions or hiddenGraphOptions,
and we only mutate (throtteled) when the recreated version doesn't match the current fullText

...

we grab mutate and isLoading state from react-query
we create a debounced mutate function


*/

export type UpdateDoc = (
  update:
    | {
        hidden?: object | undefined;
        text?: string | undefined;
      }
    | {
        hidden?: object | undefined;
        options?: GraphOptionsObject | undefined;
      }
) => void;
