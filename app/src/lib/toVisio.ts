import { Graph } from "graph-selector";

/**
 * Converts a graph-selector Graph to a CSV string.
 * Asynchronously imports the CSV stringifier.
 */
export async function toVisioFlowchart(graph: Graph) {
  const unparse = (await import("papaparse")).unparse;

  const { nodes, edges } = graph;
  const rows: Record<string, string>[] = [];
  for (const node of nodes) {
    let shapeType = "Process";
    const edgesFromNode = edges.filter((edge) => edge.source === node.data.id);
    const edgesToNode = edges.filter((edge) => edge.target === node.data.id);
    const hasParent = !!node.data.parent;
    if (edgesFromNode.length === 0 && edgesToNode.length === 0) {
      shapeType = "Document";
    } else if (edgesFromNode.length === 0) {
      shapeType = "End";
    } else if (edgesToNode.length === 0) {
      shapeType = "Start";
    } else if (edgesFromNode.length > 1) {
      shapeType = "Decision";
    } else if (hasParent) {
      shapeType = "Subprocess";
    }

    rows.push({
      ["Process Step ID"]: node.data.id,
      ["Process Step Description"]: node.data.label,
      ["Next Step ID"]: "",
      ["Connector Label"]: "",
      ["Shape Type"]: shapeType,
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

  return unparse(rows, {
    quotes: true,
    header: true,
    newline: "\r\n",
  });
}

export async function toVisioOrgChart(graph: Graph) {
  const unparse = (await import("papaparse")).unparse;

  const { nodes, edges } = graph;
  const rows: Record<string, string | number | true>[] = [];
  for (const node of nodes) {
    rows.push({
      ["Employee ID"]: node.data.id,
      ["Name"]: node.data.label,
      ["Title"]: node.data["Title"] || node.data.title || "",
      ["Manager ID"]: "",
      ["Role Type"]: node.data["Role Type"] || node.data.roleType || "",
    });
  }

  for (const edge of edges) {
    const { source, target } = edge;

    // find the source node index
    const targetIndex = nodes.findIndex((node) => node.data.id === target);

    // set the manager id
    rows[targetIndex]["Manager ID"] = source;
  }

  return unparse(rows, {
    quotes: true,
    header: true,
    newline: "\r\n",
  });
}
