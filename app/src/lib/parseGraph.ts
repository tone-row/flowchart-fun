import { Graph, parse } from "graph-selector";

/**
 * parse() resolves a "(label)" pointer against nodes AND edges, so an edge
 * label that equals a node label also yields an edge whose endpoint is an
 * edge id. Cytoscape draws such an edge to the origin and exporters have no
 * element to attach it to, so only node-to-node edges leave this function.
 */
export function parseGraph(text: string): Graph {
  const graph = parse(text);
  const nodeIds = new Set(graph.nodes.map((node) => node.data.id));
  return {
    ...graph,
    edges: graph.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    ),
  };
}
