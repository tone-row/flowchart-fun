import { NodePositions } from "../components/getNodePositionsFromCy";
import { useDoc } from "./useDoc";
import { addToUndoStack } from "./undoStack";

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

  const threshold = 40; // Adjust this value to change the alignment sensitivity
  const alignedPositions: NodePositions = {};

  // Store the original positions for undo
  const originalPositions = { ...nodePositions };

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

  // Add the action to the undo stack
  addToUndoStack({
    undo: () => {
      useDoc.setState((state) => ({
        meta: {
          ...state.meta,
          nodePositions: originalPositions,
        },
      }));
    },
    redo: () => {
      useDoc.setState((state) => ({
        meta: {
          ...state.meta,
          nodePositions: alignedPositions,
        },
      }));
    },
  });
}

/**
 * This function horizontally aligns the set of nodes for the given list of node ids
 * by finding the average x position of the nodes and then setting the x position of
 * each node to the average x position.
 */
export function alignNodesHorizontally(nodeIds: string[]) {
  const meta = useDoc.getState().meta;
  const nodePositions = meta.nodePositions as NodePositions;
  if (!nodePositions) return;

  // Store the original positions for undo
  const originalPositions = { ...nodePositions };

  // Calculate the average x position
  let sumX = 0;
  let count = 0;
  for (const nodeId of nodeIds) {
    if (nodePositions[nodeId]) {
      sumX += nodePositions[nodeId].x;
      count++;
    }
  }
  const averageX = count > 0 ? sumX / count : 0;

  // Create a new object with updated positions
  const alignedPositions: NodePositions = { ...nodePositions };

  // Set the x position of each node to the average x position
  for (const nodeId of nodeIds) {
    if (alignedPositions[nodeId]) {
      alignedPositions[nodeId] = {
        ...alignedPositions[nodeId],
        x: averageX,
      };
    }
  }

  // Update the node positions in the document state
  useDoc.setState((state) => ({
    meta: {
      ...state.meta,
      nodePositions: alignedPositions,
    },
  }));

  // Add the action to the undo stack
  addToUndoStack({
    undo: () => {
      useDoc.setState((state) => ({
        meta: {
          ...state.meta,
          nodePositions: originalPositions,
        },
      }));
    },
    redo: () => {
      useDoc.setState((state) => ({
        meta: {
          ...state.meta,
          nodePositions: alignedPositions,
        },
      }));
    },
  });
}

/**
 * This function vertically aligns the set of nodes for the given list of node ids
 * by finding the average y position of the nodes and then setting the y position of
 * each node to the average y position.
 */
export function alignNodesVertically(nodeIds: string[]) {
  const meta = useDoc.getState().meta;
  const nodePositions = meta.nodePositions as NodePositions;
  if (!nodePositions) return;

  // Store the original positions for undo
  const originalPositions = { ...nodePositions };

  // Calculate the average y position
  let sumY = 0;
  let count = 0;
  for (const nodeId of nodeIds) {
    if (nodePositions[nodeId]) {
      sumY += nodePositions[nodeId].y;
      count++;
    }
  }
  const averageY = count > 0 ? sumY / count : 0;

  // Create a new object with updated positions
  const alignedPositions: NodePositions = { ...nodePositions };

  // Set the y position of each node to the average y position
  for (const nodeId of nodeIds) {
    if (alignedPositions[nodeId]) {
      alignedPositions[nodeId] = {
        ...alignedPositions[nodeId],
        y: averageY,
      };
    }
  }

  // Update the node positions in the document state
  useDoc.setState((state) => ({
    meta: {
      ...state.meta,
      nodePositions: alignedPositions,
    },
  }));

  // Add the action to the undo stack
  addToUndoStack({
    undo: () => {
      useDoc.setState((state) => ({
        meta: {
          ...state.meta,
          nodePositions: originalPositions,
        },
      }));
    },
    redo: () => {
      useDoc.setState((state) => ({
        meta: {
          ...state.meta,
          nodePositions: alignedPositions,
        },
      }));
    },
  });
}
