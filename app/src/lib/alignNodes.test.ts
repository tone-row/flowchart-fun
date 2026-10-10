import { alignNodesHorizontally } from "./alignNodes";
import { undo } from "./undoStack";
import { useDoc } from "./useDoc";
import { useGraphStore } from "./useGraphStore";

test("aligning writes the chart as drawn to the doc under the current ids", () => {
  useDoc.setState({
    meta: {
      nodePositions: {
        n1: { x: 0, y: 0, label: "A" },
        n2: { x: 50, y: 100, label: "B" },
      },
    },
  });
  useGraphStore.setState({
    resolvedPositions: {
      n1: { x: 0, y: 0, label: "New" },
      n2: { x: 0, y: 0, label: "A" },
      n3: { x: 50, y: 100, label: "B" },
    },
  });

  alignNodesHorizontally(["n2", "n3"]);
  expect(useDoc.getState().meta.nodePositions).toEqual({
    n1: { x: 0, y: 0, label: "New" },
    n2: { x: 25, y: 0, label: "A" },
    n3: { x: 25, y: 100, label: "B" },
  });

  undo();
  expect(useDoc.getState().meta.nodePositions).toEqual({
    n1: { x: 0, y: 0, label: "New" },
    n2: { x: 0, y: 0, label: "A" },
    n3: { x: 50, y: 100, label: "B" },
  });
});
