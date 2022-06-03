import { cytoscape } from "../lib/cytoscape";

export function getNodePositionsFromCy() {
  if (!window.__cy) return {};
  const nodes = (window.__cy.json() as any).elements
    .nodes as cytoscape.ElementDefinition[];
  const nodePositions: Record<string, cytoscape.Position> = {};
  for (const node of nodes) {
    const { position, data } = node;
    const ID = data.id;
    if (ID && position) {
      nodePositions[ID] = {
        x: position.x,
        y: position.y,
      };
    }
  }
  return nodePositions;
}
