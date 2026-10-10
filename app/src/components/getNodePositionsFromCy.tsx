import { cytoscape } from "../lib/cytoscape";

export type StoredPosition = cytoscape.Position & { label?: string };

export type NodePositions = Record<string, StoredPosition>;

export function getNodePositionsFromCy(): NodePositions {
  if (!window.__cy) return {};
  const nodes = (window.__cy.json() as any).elements
    .nodes as cytoscape.ElementDefinition[];
  const nodePositions: NodePositions = {};
  for (const node of nodes) {
    const { position, data } = node;
    const ID = data.id;
    if (ID && position) {
      nodePositions[ID] = {
        x: position.x,
        y: position.y,
        label: typeof data.label === "string" ? data.label : "",
      };
    }
  }
  return nodePositions;
}
