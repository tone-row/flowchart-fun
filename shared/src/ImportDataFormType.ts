/**
 * A type that represents a mapping of CSV data to a graph, including node and edge information.
 */
export type ImportDataFormType = {
  /** The name of the column containing the unique identifier for each node. */
  idColumn: string;
  /** The name of the column containing the label for each node (optional). */
  nodeLabelColumn?: string;
} & (
  | {
      /** No edges are declared in the CSV. */
      edgesDeclared: "none";
    }
  | {
      /** Edges are declared in the source node's row */
      edgesDeclared: "sourceNode";
      /** The name of the column containing the target node(s). */
      targetColumn: string;
      /** The delimiter used to separate multiple target nodes (optional). */
      targetDelimiter?: string;
      /**
       * The name of the column containing the edge label(s)
       */
      edgeLabelColumn?: string;
    }
  | {
      /** Edges are declared in the target node's row */
      edgesDeclared: "targetNode";
      /** The name of the column containing the source node(s). */
      sourceColumn: string;
      /** The delimiter used to separate multiple target nodes (optional). */
      sourceDelimiter?: string;
      /** The name of the column containing the edge label(s) (optional). */
      edgeLabelColumn?: string;
    }
  | ({
      /** Edges are declared in a separate row */
      edgesDeclared: "separateRows";
      /**
       * When a row represents an edge, based on a non-empty or empty cell, or a specific value.
       * @example 'notEmpty'
       * @example 'empty'
       * @example { equals: 'someValue' }
       */
      sourceColumn: string;
      targetColumn: string;
      rowRepresentsEdgeWhenColumn: string;
    } & (
      | {
          rowRepresentsEdgeWhenIs: "empty";
        }
      | {
          rowRepresentsEdgeWhenIs: "notEmpty";
        }
      | {
          rowRepresentsEdgeWhenIs: "equals";
          rowRepresentsEdgeWhenValue: string;
        }
    ))
);
