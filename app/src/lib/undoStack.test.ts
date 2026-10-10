import { alignNodesHorizontally } from "./alignNodes";
import { prepareChart } from "./prepareChart/prepareChart";
import { canRedo, canUndo, redo, undo } from "./undoStack";
import { Details, useDoc } from "./useDoc";
import { useGraphStore } from "./useGraphStore";

const chartA: Details = { id: 1, title: "A", isHosted: true };
const chartB: Details = { id: 2, title: "B", isHosted: true };
const sandbox: Details = { id: "", title: "", isHosted: false };

const bPositions = {
  n1: { x: 0, y: 0, label: "Plan" },
  n2: { x: 220, y: 140, label: "Build" },
};
const chartBDoc = `Plan\n  Build\n=====${JSON.stringify({
  nodePositions: bPositions,
})}=====`;

async function alignOn(details: Details) {
  await prepareChart({ doc: "Alpha\n  Beta\n", details });
  useGraphStore.setState({
    resolvedPositions: {
      n1: { x: 0, y: 0, label: "Alpha" },
      n2: { x: 50, y: 100, label: "Beta" },
    },
  });
  alignNodesHorizontally(["n1", "n2"]);
  expect(canUndo()).toBe(true);
}

afterEach(() => {
  while (canUndo()) undo();
});

test("opening another hosted chart leaves nothing to undo from the previous one", async () => {
  await alignOn(chartA);
  await prepareChart({ doc: chartBDoc, details: chartB });

  expect(canUndo()).toBe(false);
  undo();
  expect(useDoc.getState().meta.nodePositions).toEqual(bPositions);
});

test("opening a hosted chart after the sandbox leaves nothing to undo or redo", async () => {
  await alignOn(sandbox);
  undo();
  expect(canRedo()).toBe(true);
  await prepareChart({ doc: chartBDoc, details: chartB });

  expect(canRedo()).toBe(false);
  redo();
  expect(useDoc.getState().meta.nodePositions).toEqual(bPositions);
});

test("reloading the same chart or loading a template into it keeps its history", async () => {
  await alignOn(chartA);
  await prepareChart({ doc: "Alpha\n  Beta\n", details: { ...chartA } });

  expect(canUndo()).toBe(true);
});
