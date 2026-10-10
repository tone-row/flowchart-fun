import { alignNodesHorizontally } from "./alignNodes";
import { prepareChart } from "./prepareChart/prepareChart";
import { renderHook, act } from "@testing-library/react";
import {
  addToUndoStack,
  canRedo,
  canUndo,
  redo,
  undo,
  useIsAiEditNewest,
} from "./undoStack";
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
  while (canRedo()) redo();
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

test("loading a document into the same chart (template, file, #load: link, reload) ends its history", async () => {
  await alignOn(sandbox);
  alignNodesHorizontally(["n1", "n2"]);
  undo();
  expect(canUndo() && canRedo()).toBe(true);

  await prepareChart({ doc: chartBDoc, details: { ...sandbox } });

  expect(canUndo()).toBe(false);
  expect(canRedo()).toBe(false);
  undo();
  redo();
  expect(useDoc.getState().meta.nodePositions).toEqual(bPositions);
});

test("parsing a document without loading it keeps the history", async () => {
  await alignOn(sandbox);
  await prepareChart({ doc: chartBDoc, details: sandbox, set: false });

  expect(canUndo()).toBe(true);
});

const noop = () => {};
const push = (kind: "ai" | "layout") =>
  act(() => addToUndoStack({ kind, undo: noop, redo: noop }));

test("AI undo is offered only while an AI edit is the newest entry", () => {
  const { result } = renderHook(() => useIsAiEditNewest());
  expect(result.current).toBe(false);

  push("ai");
  expect(result.current).toBe(true);

  push("layout");
  expect(result.current).toBe(false);

  act(undo);
  expect(result.current).toBe(true);

  act(undo);
  expect(result.current).toBe(false);

  act(redo);
  expect(result.current).toBe(true);
});

test("redoing a layout change never offers AI undo", () => {
  const { result } = renderHook(() => useIsAiEditNewest());
  push("layout");
  act(undo);
  act(redo);

  expect(result.current).toBe(false);
});
