import { Graph } from "graph-selector";

/**
 * Converts a graph-selector Graph to a CSV string.
 * Asynchronously imports the CSV stringifier.
 */
export async function toCSV(graph: Graph) {
  const writeToString = (await import("fast-csv")).writeToString;

  const { nodes, edges } = graph;
  const rows: Record<string, string>[] = [];
  for (const node of nodes) {
    rows.push({
      ["Process Step ID"]: node.data.id,
      ["Process Step Description"]: node.data.label,
      ["Next Step ID"]: "",
      ["Connector Label"]: "",
    });
  }

  for (const edge of edges) {
    const { source, target, data } = edge;
    const { label } = data;
    // find the source node index
    const sourceIndex = nodes.findIndex((node) => node.data.id === source);

    // add the next step id and connector label to the source node
    rows[sourceIndex]["Next Step ID"] += `,${target}`;
    rows[sourceIndex]["Connector Label"] += `,${label}`;
  }

  // Loop over rows and remove the first comma from the next step id and connector label
  for (const row of rows) {
    row["Next Step ID"] = row["Next Step ID"].slice(1);
    row["Connector Label"] = row["Connector Label"].slice(1);
  }

  return writeToString(rows, {
    headers: true,
    quoteColumns: true,
    quote: true,
    quoteHeaders: true,
  });
}
