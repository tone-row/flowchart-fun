import { ElementDefinition } from "cytoscape";
import { parse, toCytoscapeElements } from "graph-selector";

import { TGetSize } from "./getGetSize";
import { SelectOption } from "./graphOptions";
import { parseText } from "./parseText";
import { useDoc } from "./prepareChart";
import { stripComments } from "./utils";

/** Recognized names for support parsers */
export type Parsers = "v1" | "graph-selector";

const DEFAULT_PARSER = "v1";

/**
 * A function which reads the document and
 * returns the parser if it is set or the default parser
 */
export function useParser(): Parsers {
  const meta = useDoc((state) => state.meta);
  const parser = meta?.parser as Parsers;
  return parser || DEFAULT_PARSER;
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
      return toCytoscapeElements(parse(text)).map((element) => ({
        ...element,
        data: {
          ...element.data,
          ...getSize(
            element?.data?.label,
            (element?.data?.classes ?? "").split(" ")
          ),
        },
      }));
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
