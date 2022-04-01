import cytoscape from "cytoscape";

import { TGetSize } from "./useGetSize";
import { decode } from "./utils";

export function parseText(
  text: string,
  getSize: TGetSize,
  lineNumberStart = 0
): cytoscape.ElementDefinition[] {
  const lines = text.split("\n");

  const nodes: cytoscape.ElementDefinition[] = [];
  const edges: cytoscape.ElementDefinition[] = [];

  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  const nodeLabels: { [label: string]: string } = {};
  // Not Using Edge Labels Yet, Because I would need to store ALL Edges ID's with label, so it would need to be a map
  // const edgeLabels: string[] = [];
  const lineNumbers: { [lineNumber: number]: string } = {};

  let lineNumber = lineNumberStart + 1,
    uniqueEdgeId = 0,
    indentation: string[] = [];
  for (let line of lines) {
    /**
     * Splitting the line into edgeLabel and nodeLabel is
     * the last thing we'll do, so we need to store edges
     * we create without a label in the meantime.
     */
    const edgesNoLabel = [];
    const leadingSpace = getLeadingSpaceLength(line);
    line = line.slice(leadingSpace);

    // Find parent
    const parentId = findParentId(leadingSpace, indentation);

    const {
      id = ID(lineNumber),
      classes,
      pointers,
      userSuppliedId,
      newLine,
    } = getSymbols(line);

    line = newLine;

    if (pointers.length && !parentId) {
      throw new Error(`Pointers found without parent: ${pointers}`);
    }

    for (const pointer of pointers) {
      const edgeId = `${parentId}_${pointer}:${uniqueEdgeId++}`;
      // create edge to parent
      edgesNoLabel.push({
        data: {
          id: edgeId,
          source: parentId,
          target: pointer,
          lineNumber,
        },
      });
      edgeIds.push(edgeId);
    }

    // Label Text
    const labelSeparator = /[:：]/.exec(line);
    let nodeLabel = "",
      edgeLabel = "";
    if (labelSeparator) {
      edgeLabel = line.slice(0, labelSeparator.index).trim();
      nodeLabel = line.slice(labelSeparator.index + 1).trim();
    } else {
      nodeLabel = line.trim();
    }

    if (edgeLabel && !parentId)
      throw new Error(`Edge Label without Parent: "${edgeLabel}"`);

    if (nodeLabel || userSuppliedId) {
      // Add Element for Node
      nodes.push({
        classes: classes && classes.split(".").filter(Boolean).join(" "),
        data: {
          id,
          label: decode(nodeLabel),
          lineNumber,
          ...getSize(nodeLabel, classes.split(".")),
        },
      });
      if (nodeIds.includes(id)) throw new Error(`Duplicate ID: ${id}`);
      nodeIds.push(id);
      nodeLabels[nodeLabel] = id;
      lineNumbers[lineNumber] = id;

      // Update array of ancestors
      indentation[leadingSpace] = id;
      indentation = indentation.slice(0, leadingSpace + 1);

      // create Edge if parent ID
      if (parentId) {
        const edgeId = `${parentId}_${id}:${uniqueEdgeId++}`;
        edgesNoLabel.push({
          data: {
            id: edgeId,
            source: parentId,
            target: id,
            lineNumber,
          },
        });
        edgeIds.push(edgeId);
      }
    }

    // Create Edges
    edges.push(
      ...edgesNoLabel.map((edge) => ({
        ...edge,
        data: { ...edge.data, label: edgeLabel },
      }))
    );

    lineNumber++;
  }

  // Resolve Edge Pointers in this order: Node or Edge ID, Node Label, Line Number
  for (let i = 0; i < edges.length; i++) {
    const target = edges[i].data.target;
    if (nodeIds.includes(target)) continue;
    // if (edgeIds.includes(target)) continue; // this won't work currently
    if (target in nodeLabels) {
      edges[i].data.target = nodeLabels[target];
      continue;
    }
    const targetLineNumber = getLineNumber(target);
    if (targetLineNumber && targetLineNumber in lineNumbers) {
      edges[i].data.target = lineNumbers[targetLineNumber];
      continue;
    }
    throw new Error(`Could not resolve edge target: ${target}`);
  }

  return [...nodes, ...edges];
}

function findParentId(
  leadingSpace: number,
  indentation: string[]
): string | null {
  let parent = null;
  let i = leadingSpace - 1;
  while (!parent && i >= 0) {
    parent = indentation[i];
    i--;
  }
  return parent;
}

function getLeadingSpaceLength(s: string) {
  const match = s.match(/^\s*/);
  return match ? match[0].length : 0;
}

function ID(lineNumber: number) {
  return `N${(333 + lineNumber).toString(16)}`;
}

function getLineNumber(str: string): null | number {
  const re = /^[1-9]{1}\d*$/;
  const match = re.exec(str);
  if (!match) return null;
  return parseInt(match[0], 10);
}

/**
 * Gets poiters, node ids, and edge ids
 */
function getSymbols(line: string): {
  pointers: string[];
  id: string | undefined;
  classes: string;
  userSuppliedId: boolean;
  newLine: string;
} {
  const pointers: string[] = [];
  let id = undefined;
  let classes = "";

  const toReplace: string[] = [];
  const re =
    /(?<replace>([(（](?<pointer>[^(（)）]+)[)）])|(\[(?<id>[^.\]]*)?(?<classes>(?:\.[a-zA-Z]{1}[\w-]*)*)\]))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) != null) {
    if (!match.groups) continue;
    if (match.groups.replace) {
      toReplace.push(match.groups.replace);
    }
    if (match.groups.pointer) pointers.push(match.groups.pointer);
    if (match.groups.id) id = match.groups.id;
    if (match.groups.classes) classes = match.groups.classes;
  }

  // Remove all toReplace from line
  for (const replace of toReplace) {
    line = line.replace(replace, "");
  }

  return {
    pointers,
    id,
    classes,
    userSuppliedId: Boolean(id),
    newLine: line,
  };
}
