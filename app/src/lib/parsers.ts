import { ElementDefinition } from "cytoscape";
import { parse, toCytoscapeElements } from "graph-selector";

import { TGetSize } from "./getGetSize";
import { SelectOption } from "./graphOptions";
import { parseText } from "./parseText";
import { useDoc } from "./useDoc";
import { stripComments } from "./utils";

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
 * Takes the current parser, the text input, and any options
 * and returns the elements using the specified parser
 */
export function universalParse(
  parser: Parsers,
  text: string,
  getSize: TGetSize
): ElementDefinition[] {
  switch (parser) {
    case "graph-selector":
      return toCytoscapeElements(parse(text)).map((element) => {
        let size: Record<string, string | number> = {};
        if ("w" in element.data || "h" in element.data) {
          size = {
            width: element.data.w || "label",
            height: element.data.h || "label",
          };
        } else {
          size = getSize(
            element?.data?.label,
            (element?.classes ?? "").split(" ")
          );
        }

        let node = {
          ...element,
          data: {
            ...element.data,
            ...size,
          },
        };

        // if class "fixed" and x & y are set, add position to node
        if (
          element.classes?.includes("fixed") &&
          "x" in element.data &&
          "y" in element.data
        ) {
          node = {
            ...node,
            position: {
              x: element.data.x,
              y: element.data.y,
            },
          };
        }

        return node;
      });
    case "v1":
      return parseText(stripComments(text), getSize);
    default:
      throw new Error(`Unknown parser: ${parser}`);
  }
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
