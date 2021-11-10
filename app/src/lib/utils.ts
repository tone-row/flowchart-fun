import strip from "@tone-row/strip-comments";
import cytoscape, { CytoscapeOptions } from "cytoscape";

// Stores edges by their ID to the node ID they pointed to
export const edgeCache = {
  cache: {} as Record<string, string>,
  reset: () => {
    edgeCache.cache = {};
  },
};

export function parseText(
  text: string,
  getSize: (
    label: string,
    minWidth?: number,
    minHeight?: number
  ) =>
    | {
        width: number;
        height: number;
      }
    | undefined,
  startingLineNumber = 0
): [cytoscape.ElementDefinition[], string | undefined] {
  const elements: CytoscapeOptions["elements"] = [];
  let lineNumber = 1;

  // Whether or not we need to return an updated string
  let shouldReturnString = false;

  // break into lines
  const lines = text.split("\n");

  // Loop over lines
  for (const line of lines) {
    if (line.trim() === "") {
      lineNumber++;
      continue;
    }
    const { linkedId, nodeLabel, edgeLabel, indent, id } = getLineData(
      line,
      lineNumber
    );

    if (indent) {
      let parent;
      let checkLine = lineNumber;

      while (checkLine >= 1) {
        checkLine -= 1;
        const currentLine = lines[checkLine - 1];

        /* Determine whether valid line */
        if (currentLine.trim() === "") {
          continue;
        }

        const { indent: currentLineIndent } = getLineData(
          currentLine,
          checkLine
        );
        if (currentLineIndent.length < indent.length) {
          parent = checkLine;
          break;
        }
      }

      if (!parent) throw new Error("Invalid Indent");

      const { id: source } = getLineData(lines[checkLine - 1], checkLine);
      const target = linkedId || getLineData(line, lineNumber).id;

      // Find a unique id
      let id = `${source}_${target}:0`;
      while (elements.map(({ data: { id } }) => id).includes(id)) {
        let [, count] = id.split(":");
        count = (parseInt(count, 10) + 1).toString();
        id = `${source}_${target}:${count}`;
      }
      elements.push({
        data: {
          id,
          source,
          target,
          label: edgeLabel,
          lineNumber: lineNumber + startingLineNumber,
          // only add rawText if it's a linked id
          rawText: linkedId ? line : undefined,
        },
      });
    }

    if (!linkedId) {
      // Check for custom id
      elements.push({
        data: {
          id,
          label: nodeLabel,
          rawText: line,
          lineNumber: lineNumber + startingLineNumber,
          ...getSize(nodeLabel),
        },
      });
    }
    lineNumber++;
  }

  // Before returning elements, check if user
  // used label text as pointer, and replace with id
  const labelToId = elements.reduce<Record<string, string>>(
    (acc, el) =>
      isEdge(el)
        ? acc
        : {
            ...acc,
            [el.data.label]: el.data.id,
          },
    {}
  );

  // Reassign label, line number targets to IDs
  for (const element of elements) {
    const target = element.data.target;

    if (!isEdge(element)) continue;
    if (!element.data.id) throw new Error("Parsing Error");

    // continue if target is not a label
    if (Object.values(labelToId).includes(target)) continue;

    // check if edge has already been cached
    if (element.data.id in edgeCache.cache) {
      const targetId = edgeCache.cache[element.data.id];
      const targetNode = elements.find((el) => el.data.id === targetId);

      // If node no longer exists, remove edge from cache
      if (!targetNode) {
        delete edgeCache.cache[element.data.id];
        break;
      }

      element.data.target = targetId;

      // check if target label is still correct
      if (targetNode.data.label === target) {
        continue;
      }

      // if not, update the rawText
      element.data.rawText = element.data.rawText.replace(
        /([(（])(.+)([)）])/gi,
        `$1${targetNode.data.label}$3`
      );

      shouldReturnString = true;

      continue;
    }

    if (element.data.id)
      if (target in labelToId) {
        // replace target with id if it's a label
        element.data.target = labelToId[element.data.target];
        // add flag
        element.data.isLinkByLabel = true;

        // store in cache
        if (element.data.target)
          edgeCache.cache[element.data.id] = element.data.target;

        continue;
      }

    // or if it's a valid line number
    if (!isNaN(target)) {
      const lineNumber = parseInt(target, 10);
      const targetElement = elements.find(
        ({ data: { lineNumber: elLineNumber } }) => elLineNumber === lineNumber
      );
      if (targetElement) {
        element.data.target = targetElement.data.id;
      }
    }
  }

  // Need to know if I need to return a different string
  // why would i need to return a different string
  // because there are edges, that link by label, for which the label is now out of date
  // and i know it's out of date because i know what ID it pointed to (because it was cached...)
  // because i have a cache of labels to ids on the last go round
  // and I know that the label for that id has changed
  let returnString;
  if (shouldReturnString) {
    returnString = elements
      .map(({ data: { rawText } }) => rawText)
      .filter(Boolean)
      .join("\n");
  }
  return [elements, returnString];
}

function getLineData(text: string, lineNumber: number) {
  // Whole line description in one regex with named capture groups
  // 1) Indent ^(?<indent>\s*) -- store the indent which is 0 or more whitespace at the start
  // 2) ID (\[(?<id>.*)\])? -- store the ID if it exists after the indent in square brackets
  // 3) Edge Label ((?<edgeLabel>.+): )? -- store the edge label if it exists
  // 4) Node Label (?<nodeLabel>.+?) -- store the node label
  const lineRegex =
    /^(?<indent>\s*)(\[(?<id>.*)\])?((?<edgeLabel>.+)[:：] *)?(?<nodeLabel>.+?)$/;
  const { groups } = text.match(lineRegex) || {};
  const {
    nodeLabel = "",
    edgeLabel = "",
    indent,
    id = betterDefaultId(lineNumber),
  } = groups || {};
  const { groups: labelGroups } =
    nodeLabel.match(/^[(（](?<linkedId>.+)[)）]\s*$/) || {};
  const { linkedId } = labelGroups || {};
  return {
    nodeLabel: decodeURIComponent(nodeLabel.trim()),
    edgeLabel: decodeURIComponent(edgeLabel.trim()),
    indent,
    id,
    linkedId:
      typeof linkedId !== "undefined" ? decodeURIComponent(linkedId) : linkedId,
  };
}

function isEdge(el: cytoscape.ElementDefinition) {
  return "target" in el.data || "source" in el.data;
}

function betterDefaultId(lineNumber: number) {
  return (333 + lineNumber).toString(16);
}

export function stripComments(t: string) {
  return strip(t, { preserveNewlines: true });
}
