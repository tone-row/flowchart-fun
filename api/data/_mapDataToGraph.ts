import { FeatureData, Node, Edge, Graph } from "graph-selector";
import { MappingObject } from "shared";

/**
 * Takes Data and a mapping object and converts it into a graph which can be
 * stringified and returned to the client.
 */
export function mapDataToGraph(data: any[], mapping: MappingObject): Graph {
  const { inSourceNodeRow, inTargetNodeRow, rowRepresentsEdgeWhen } = mapping;
  if (
    [inSourceNodeRow, inTargetNodeRow, rowRepresentsEdgeWhen].filter(Boolean)
      .length !== 1
  ) {
    throw new Error(
      "If edges are declared, exactly one of 'inSourceNodeRow', 'inTargetNodeRow', or 'rowRepresentsEdgeWhen' must be defined."
    );
  }

  // Create an empty list of nodes and edges
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // create a function to know whether to create a node or not
  // this only changes if edges are declared
  // in separate rows because then the record may not contain a node
  let isRecordEdgeOnly: (record: any) => boolean;
  if (rowRepresentsEdgeWhen) {
    const { column, is } = rowRepresentsEdgeWhen;
    isRecordEdgeOnly = (record: any) => {
      if (is === "notEmpty") {
        return record[column] !== "";
      } else if (is === "empty") {
        return record[column] === "";
      } else {
        return record[column] === is.equals;
      }
    };
  } else {
    isRecordEdgeOnly = () => false;
  }

  // Iterate over the data records
  for (const record of data) {
    // Extract the ID, node label, and any additional data for the node
    const id = record[mapping.idColumn];

    // only do node stuff if this doesn't represent an edge when edges are in their own row
    if (!isRecordEdgeOnly(record)) {
      const nodeLabel = mapping.nodeLabelColumn
        ? record[mapping.nodeLabelColumn]
        : "";
      const nodeData: FeatureData = {
        id,
        classes: "",
        label: nodeLabel,
        // ...record,
      };

      // Create a node object and add it to the list of nodes
      const node: Node = { data: nodeData };
      nodes.push(node);
    }

    // Create edge if there is an edge in this record
    if (inSourceNodeRow) {
      const { targetColumn, targetDelimiter, edgeLabelColumn } =
        inSourceNodeRow;
      // make sure target column isn't an empty string
      if (!targetColumn) continue;

      // Get array of target id's
      let targetIds = targetDelimiter
        ? record[targetColumn].split(targetDelimiter)
        : [record[targetColumn]];

      // Get array of edge labels
      let edgeLabels: string[] = [];
      if (edgeLabelColumn) {
        edgeLabels = targetDelimiter
          ? record[edgeLabelColumn].split(targetDelimiter)
          : [record[edgeLabelColumn]];
      }

      // Remove empty strings from the list of target IDs and edge labels
      targetIds = targetIds.filter(Boolean);
      edgeLabels = edgeLabels.filter(Boolean);

      // Create edges
      for (let i = 0; i < targetIds.length; i++) {
        const targetId = targetIds[i];
        const edgeLabel = edgeLabels[i] ?? "";
        const edgeData: FeatureData = {
          // Edge Id's can be empty, they'll be added when stringified
          id: "",
          classes: "",
          label: edgeLabel,
          // ...record,
        };
        const edge: Edge = {
          source: id,
          target: targetId,
          data: edgeData,
        };
        edges.push(edge);
      }
    } else if (inTargetNodeRow) {
      const { sourceColumn, sourceDelimiter, edgeLabelColumn } =
        inTargetNodeRow;
      // make sure source column isn't an empty string
      if (!sourceColumn) continue;

      // Get array of source id's
      let sourceIds = sourceDelimiter
        ? record[sourceColumn].split(sourceDelimiter)
        : [record[sourceColumn]];

      // Get array of edge labels
      let edgeLabels: string[] = [];
      if (edgeLabelColumn) {
        edgeLabels = sourceDelimiter
          ? record[edgeLabelColumn].split(sourceDelimiter)
          : [record[edgeLabelColumn]];
      }

      // Remove empty strings from the list of source IDs and edge labels
      sourceIds = sourceIds.filter(Boolean);
      edgeLabels = edgeLabels.filter(Boolean);

      // Create edges
      for (let i = 0; i < sourceIds.length; i++) {
        const sourceId = sourceIds[i];
        const edgeLabel = edgeLabels[i] ?? "";
        const edgeData: FeatureData = {
          // Edge Id's can be empty, they'll be added when stringified
          id: "",
          classes: "",
          label: edgeLabel,
          // ...record,
        };
        const edge: Edge = {
          source: sourceId,
          target: id,
          data: edgeData,
        };
        edges.push(edge);
      }
    } else if (rowRepresentsEdgeWhen) {
      continue;
    }

    // // Determine whether the current record represents an edge
    // let representsEdge = false;
    // if (mapping.rowRepresentsEdgeWhen) {
    //   const edgeColumnValue =
    //     record[mapping.inSourceNodeRow?.edgeLabelColumn ?? ""];
    //   if (
    //     (mapping.rowRepresentsEdgeWhen === "notEmpty" &&
    //       edgeColumnValue !== "") ||
    //     (mapping.rowRepresentsEdgeWhen === "empty" &&
    //       edgeColumnValue === "") ||
    //     (typeof mapping.rowRepresentsEdgeWhen === "object" &&
    //       edgeColumnValue === mapping.rowRepresentsEdgeWhen.equals)
    //   ) {
    //     representsEdge = true;
    //   }
    // }

    // // If the record represents an edge, create edge objects and add them to the list of edges
    // if (representsEdge) {
    //   // Extract the source and target nodes for the edge
    //   const sourceNodeId =
    //     record[mapping.inTargetNodeRow?.sourceColumn ?? ""];
    //   const targetNodeIds = record[
    //     mapping.inSourceNodeRow?.targetColumn ?? ""
    //   ].split(mapping.inSourceNodeRow?.targetDelimiter ?? ",");

    //   // Extract the edge label, if specified
    //   const edgeLabelColumn =
    //     mapping.inSourceNodeRow?.edgeLabelColumn ?? mapping.nodeLabelColumn;
    //   const edgeLabel = edgeLabelColumn ? record[edgeLabelColumn] : "";

    //   // Create edge objects and add them to the list of edges
    //   for (const targetNodeId of targetNodeIds) {
    //     const edgeData: FeatureData = {
    //       id: `${sourceNodeId}->${targetNodeId}`,
    //       classes: "",
    //       label: edgeLabel,
    //       ...record,
    //     };
    //     const edge: Edge = {
    //       source: sourceNodeId,
    //       target: targetNodeId,
    //       data: edgeData,
    //     };
    //     edges.push(edge);
    //   }
    // }
  }

  // Return the resulting Graph object
  return { nodes, edges };
}
