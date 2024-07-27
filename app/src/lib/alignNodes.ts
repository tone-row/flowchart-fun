import { NodePositions } from "../components/getNodePositionsFromCy";
import { useDoc } from "./useDoc";

/**
 * This function tries to align nodes vertical and horiontal on their center
 * axis by iterating over all the nodes, finding their centers, looking for other
 * nodes that are close to them, and then moving them to the center of the
 * closest node.
 */
export function alignNodes() {
  const meta = useDoc.getState().meta;
  const nodePositions = meta.nodePositions as NodePositions;
  if (!nodePositions) return;

  const threshold = 20; // Adjust this value to change the alignment sensitivity
  const alignedPositions: NodePositions = {};

  // Iterate through all nodes
  Object.entries(nodePositions).forEach(([nodeId, position]) => {
    let closestHorizontal: cytoscape.Position | null = null;
    let closestVertical: cytoscape.Position | null = null;
    let minHorizontalDiff = Infinity;
    let minVerticalDiff = Infinity;

    // Compare with other nodes
    for (const [otherNodeId, otherPosition] of Object.entries(nodePositions)) {
      if (nodeId !== otherNodeId) {
        const horizontalDiff = Math.abs(position.x - otherPosition.x);
        const verticalDiff = Math.abs(position.y - otherPosition.y);

        // Check for horizontal alignment
        if (horizontalDiff < threshold && horizontalDiff < minHorizontalDiff) {
          closestHorizontal = otherPosition;
          minHorizontalDiff = horizontalDiff;
        }

        // Check for vertical alignment
        if (verticalDiff < threshold && verticalDiff < minVerticalDiff) {
          closestVertical = otherPosition;
          minVerticalDiff = verticalDiff;
        }
      }
    }

    // Align the node
    alignedPositions[nodeId] = {
      x: closestHorizontal ? closestHorizontal.x : position.x,
      y: closestVertical ? closestVertical.y : position.y,
    };
  });

  // Update the node positions in the document state
  useDoc.setState((state) => ({
    meta: {
      ...state.meta,
      nodePositions: alignedPositions,
    },
  }));
}
