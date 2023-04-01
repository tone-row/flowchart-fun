/**
 * A type that represents a mapping of CSV data to a graph, including node and edge information.
 */
export type MappingObject = {
  /** The name of the column containing the unique identifier for each node. */
  idColumn: string;
  /** Whether or not edges have been declared in the CSV. */
  edgesDeclared: boolean;
  /** The name of the column containing the label for each node (optional). */
  nodeLabelColumn?: string;
  /**
   * When a row represents an edge, based on a non-empty or empty cell, or a specific value.
   * @example 'notEmpty'
   * @example 'empty'
   * @example { equals: 'someValue' }
   */
  rowRepresentsEdgeWhen?: {
    column: string;
    is: "notEmpty" | "empty" | { equals: string };
    sourceColumn: string;
    targetColumn: string;
  };
  /**
   * If edges are declared in the CSV, the information about the edge is stored in this object.
   */
  inSourceNodeRow?: {
    /** The name of the column containing the target node(s). */
    targetColumn: string;
    /** The delimiter used to separate multiple target nodes (optional). */
    targetDelimiter?: string;
    /**
     * The name of the column containing the edge label(s)
     */
    edgeLabelColumn?: string;
  };
  /**
   * If edges are declared in the CSV, the information about the edge is stored in this object.
   */
  inTargetNodeRow?: {
    /** The name of the column containing the source node(s). */
    sourceColumn: string;
    /** The delimiter used to separate multiple target nodes (optional). */
    sourceDelimiter?: string;
    /** The name of the column containing the edge label(s) (optional). */
    edgeLabelColumn?: string;
  };
};
