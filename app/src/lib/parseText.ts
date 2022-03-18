import cytoscape from "cytoscape";

import { decode } from "./utils";

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
    | undefined
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

  let lineNumber = 1,
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

    // Extract Custom Id, Throw on multiple
    let m: RegExpExecArray | null;
    if ((m = getIdAndClasses(line))) {
      line = line.replace(m[0], "");
    }
    const userSuppliedId = !!m?.groups?.id;
    const id = m?.groups?.id ?? ID(lineNumber);
    const classes = m?.groups?.classes ?? "";

    // Extract Pointers
    const pointers = getPointers(line);
    for (const pointer of pointers) {
      line = line.replace(pointer, "");
      const pointsTo = pointer.slice(1, -1);
      const edgeId = `${parentId}_${pointsTo}:${uniqueEdgeId++}`;
      // create edge to parent
      edgesNoLabel.push({
        data: {
          id: edgeId,
          source: parentId,
          target: pointsTo,
          lineNumber,
        },
      });
      edgeIds.push(edgeId);
    }

    // Label Text
    const [nodeLabel = "", edgeLabel = ""] = line
      .split(/:(.+)/)
      .filter(Boolean)
      .map((s) => s.trim())
      .reverse();

    if (edgeLabel && !parentId)
      throw new Error(`Edge Label without Parent: ${line}`);

    if (nodeLabel || userSuppliedId) {
      // Add Element for Node
      nodes.push({
        classes: classes && classes.split(".").filter(Boolean).join(" "),
        data: {
          id,
          label: decode(nodeLabel),
          lineNumber,
          ...getSize(nodeLabel),
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

function getIdAndClasses(s: string): null | RegExpExecArray {
  const re = /\[(?<id>[^.\]]*)?(?<classes>(?:\.[a-zA-Z]{1}[\w-]*)*)\]/g;
  let match: RegExpExecArray | null;
  const matches: RegExpExecArray[] = [];
  while ((match = re.exec(s)) != null) {
    matches.push(match);
  }
  if (!matches.length) return null;
  if (matches.length > 1) {
    throw new Error(`Multiple IDs found: ${matches}`);
  }
  return matches[0];
}

// An ID (user or generated), an edge id eventually, and the actual text label
function getPointers(s: string): string[] {
  const re = /[(（](?<pointer>[^(（)）]+)[)）]/g;
  let match: RegExpExecArray | null;
  const matches: RegExpExecArray[] = [];
  while ((match = re.exec(s)) != null) {
    matches.push(match);
  }
  if (!matches.length) return [];
  return matches.map((m) => m[0]);
}

function getLineNumber(str: string): null | number {
  const re = /^[1-9]{1}\d*$/;
  const match = re.exec(str);
  if (!match) return null;
  return parseInt(match[0], 10);
}
