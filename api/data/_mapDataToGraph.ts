import { FeatureData, Node, Edge, Graph } from "graph-selector";
import { ImportDataFormType } from "shared";

/**
 * Takes Data and a mapping object and converts it into a graph which can be
 * stringified and returned to the client.
 */
export function mapDataToGraph(
  data: any[],
  mapping: ImportDataFormType
): Graph {
  // Create an empty list of nodes and edges
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // create a function to know whether to create a node or not
  // this only changes if edges are declared
  // in separate rows because then the record may not contain a node
  let isRecordEdgeOnly: (record: any) => boolean;
  if (mapping.edgesDeclared === "separateRows") {
    isRecordEdgeOnly = (record: any) => {
      if (mapping.rowRepresentsEdgeWhenIs === "notEmpty") {
        return record[mapping.rowRepresentsEdgeWhenColumn] !== "";
      } else if (mapping.rowRepresentsEdgeWhenIs === "empty") {
        return record[mapping.rowRepresentsEdgeWhenColumn] === "";
      } else if (mapping.rowRepresentsEdgeWhenIs === "equals") {
        return (
          record[mapping.rowRepresentsEdgeWhenColumn] ===
          mapping.rowRepresentsEdgeWhenValue
        );
      }
      return false;
    };
  } else {
    isRecordEdgeOnly = () => false;
  }

  // Iterate over the data records
  for (const record of data) {
    // Extract the ID, node label, and any additional data for the node
    const id = record[mapping.idColumn];

    const edgeOnly = isRecordEdgeOnly(record);

    // only do node stuff if this doesn't represent an edge when edges are in their own row
    if (!edgeOnly) {
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
    if (mapping.edgesDeclared === "sourceNode") {
      const { targetColumn, targetDelimiter, edgeLabelColumn } = mapping;
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
    } else if (mapping.edgesDeclared === "targetNode") {
      const { sourceColumn, sourceDelimiter, edgeLabelColumn } = mapping;
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
    } else if (mapping.edgesDeclared === "separateRows") {
      if (edgeOnly) {
        const { sourceColumn, targetColumn } = mapping;
        const sourceId = record[sourceColumn];
        const targetId = record[targetColumn];
        const edgeLabel = mapping.nodeLabelColumn
          ? record[mapping.nodeLabelColumn]
          : "";
        const edgeData: FeatureData = {
          // Edge Id's can be empty, they'll be added when stringified
          id: "",
          classes: "",
          label: edgeLabel,
          // ...record,
        };
        const edge: Edge = {
          source: sourceId,
          target: targetId,
          data: edgeData,
        };
        edges.push(edge);
      }
    }
  }

  // Return the resulting Graph object
  return { nodes, edges };
}
