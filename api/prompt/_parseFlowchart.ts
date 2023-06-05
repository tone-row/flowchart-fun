import { Edge, Graph, Node } from "graph-selector";

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

    const from = line.slice(0, line.indexOf(" {")).trim();
    const to = line.slice(line.indexOf("} ") + 2).trim();
    const label = line.slice(line.indexOf(" {") + 2, line.indexOf("} ")).trim();

    if (!nodes.includes(from)) nodes.push(from);
    if (!nodes.includes(to)) nodes.push(to);
    edges.push([from, to, label]);
  }

  const _nodes: Node[] = [];
  let i = 0;
  for (const node of nodes) {
    // check if node contains any non-standard characters
    if (node.match(/[^a-zA-Z0-9 ]/)) {
      _nodes.push({
        data: { id: String.fromCharCode(97 + i++), label: node, classes: "" },
      });
      nodes[i] = node;
    } else {
      _nodes.push({ data: { id: node, label: node, classes: "" } });
    }
  }

  // loop over edges and replace node name with "#"+id where id differs from name
  const _edges: Edge[] = [];
  for (const [from, to, label] of edges) {
    const fromNode = _nodes.find((node) => node.data.label === from);
    const toNode = _nodes.find((node) => node.data.label === to);
    if (!fromNode || !toNode) continue;
    let source = fromNode.data.id,
      target = toNode.data.id;
    if (fromNode.data.id !== from) {
      source = "#" + fromNode.data.id;
    }
    if (toNode.data.id !== to) {
      target = "#" + toNode.data.id;
    }
    _edges.push({ source, target, data: { id: "", classes: "", label } });
  }

  return {
    nodes: _nodes,
    edges: _edges,
  };
}
