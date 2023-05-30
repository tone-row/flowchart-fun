import { ElementDefinition } from "cytoscape";
import { parse, toCytoscapeElements } from "graph-selector";

import { TGetSize } from "./getGetSize";
import { SelectOption } from "./graphOptions";
import { useDoc } from "./useDoc";

/** Recognized names for support parsers */
export type Parsers = "v1" | "graph-selector";

const DEFAULT_PARSER = "graph-selector";

/**
 * A function which reads the document and
 * returns the parser if it is set or the default parser
 */
export function useParser(): Parsers {
  return useDoc((state) => {
    return state.meta?.parser || DEFAULT_PARSER;
  }) as Parsers;
}

/**
 * Takes the text input and the getSize function
 * and returns the elements using the specified parser
 */
export function getElements(
  text: string,
  getSize: TGetSize
): ElementDefinition[] {
  return toCytoscapeElements(parse(text)).map((element) => {
    let size: Record<string, string | number> = {};
    if ("w" in element.data || "h" in element.data) {
      size = {
        width: element.data.w || "label",
        height: element.data.h || "label",
      };
    } else {
      size = getSize(element?.data?.label, (element?.classes ?? "").split(" "));
    }

    return {
      ...element,
      data: {
        ...element.data,
        ...size,
      },
    };
  });
}

export const parsers: SelectOption[] = [
  {
    label: () => "v1",
    value: "v1",
  },
  {
    label: () => "graph-selector",
    value: "graph-selector",
  },
];
