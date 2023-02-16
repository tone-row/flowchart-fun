import { Graph } from "graph-selector";

export function parseFlowchart(text: string): Graph {
  const lines = text.split("\n");

  const nodes: string[] = [];
  const edges: [string, string, string][] = []; // [from, to, label]

  for (const line of lines) {
    if (
      !line.includes(" {") ||
      !line.includes("} ") ||
      line.indexOf(" {") > line.indexOf("} ")
    )
      continue;

    const from = line.slice(0, line.indexOf(" {"));
    const to = line.slice(line.indexOf("} ") + 2);
    const label = line.slice(line.indexOf(" {") + 2, line.indexOf("} "));

    if (!nodes.includes(from)) nodes.push(from);
    if (!nodes.includes(to)) nodes.push(to);
    edges.push([from, to, label]);
  }

  return {
    nodes: nodes.map((label) => ({ data: { id: label, classes: "", label } })),
    edges: edges.map(([from, to, label]) => ({
      source: from,
      target: to,
      data: { id: "", classes: "", label },
    })),
  };
}
