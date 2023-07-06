import { ElementDefinition } from "cytoscape";
import { parse, toCytoscapeElements } from "graph-selector";

import { getSize } from "./getSize";

/**
 * Takes the text input and the getSize function
 * and returns the elements using the specified parser
 */
export function getElements(text: string): ElementDefinition[] {
  return toCytoscapeElements(parse(text)).map((element) => {
    let size: ReturnType<typeof getSize>;

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
