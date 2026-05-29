/**
 * CHARACTERIZATION TESTS for alignNodes.ts
 *
 * These lock in the CURRENT behavior of the three node-alignment helpers
 * (alignNodes, alignNodesHorizontally, alignNodesVertically) before a future
 * framework / layout-control migration. They are a safety net, NOT a
 * correctness audit. Where current behavior looks surprising or buggy it is
 * pinned as-is and flagged with a CHARACTERIZATION comment.
 *
 * Note: none of these functions take input or return output. They read
 * `useDoc.getState().meta.nodePositions` and write back via `useDoc.setState`,
 * and push an action onto the module-level undo/redo stack in ./undoStack.
 * So each test must SEED useDoc, call the fn, then READ useDoc.
 */

import { NodePositions } from "../components/getNodePositionsFromCy";
import {
  alignNodes,
  alignNodesHorizontally,
  alignNodesVertically,
} from "./alignNodes";
import { useDoc } from "./useDoc";
import { canRedo, canUndo, redo, undo } from "./undoStack";

// Helpers to seed / read the store-backed input/output.
function seed(nodePositions: NodePositions | undefined, otherMeta = {}) {
  useDoc.setState(() => ({
    meta: { ...otherMeta, ...(nodePositions ? { nodePositions } : {}) },
  }));
}

function getPositions(): NodePositions | undefined {
  return useDoc.getState().meta.nodePositions as NodePositions | undefined;
}

// The undo/redo stacks are module-level singletons with no reset export.
// Drain both stacks before each test so length-based assertions are isolated.
function drainStacks() {
  // redo() pops from redoStack; undo() pops from undoStack. Calling them does
  // mutate useDoc, but we re-seed at the start of every test so that's fine.
  while (canRedo()) redo();
  while (canUndo()) undo();
}

beforeEach(() => {
  drainStacks();
  // Reset doc to a clean known state.
  useDoc.setState(() => ({ meta: {} }));
});

describe("alignNodes (auto-align to nearest within threshold 40)", () => {
  test("snaps x to nearest node within threshold; leaves y alone when y diff >= threshold", () => {
    // A and B: x diff = 30 (< 40, snaps), y diff = 50 (>= 40, no snap)
    seed({
      A: { x: 100, y: 0 },
      B: { x: 130, y: 50 },
    });

    alignNodes();

    const out = getPositions()!;
    // A.x snaps to B.x (130); A.y stays (no neighbor within 40 on y)
    expect(out.A).toEqual({ x: 130, y: 0 });
    // B.x snaps to A.x (100); B.y stays
    expect(out.B).toEqual({ x: 100, y: 50 });
  });

  test("x diff of exactly 40 does NOT snap (strict-less-than boundary at magic number 40)", () => {
    // CHARACTERIZATION: threshold uses strict `< 40`. At exactly 40 no snap.
    seed({
      A: { x: 0, y: 0 },
      B: { x: 40, y: 200 },
    });

    alignNodes();

    const out = getPositions()!;
    // No snapping on either axis: positions unchanged.
    expect(out.A).toEqual({ x: 0, y: 0 });
    expect(out.B).toEqual({ x: 40, y: 200 });
  });

  test("x diff of 39 DOES snap (just under the boundary)", () => {
    seed({
      A: { x: 0, y: 0 },
      B: { x: 39, y: 200 },
    });

    alignNodes();

    const out = getPositions()!;
    expect(out.A).toEqual({ x: 39, y: 0 });
    expect(out.B).toEqual({ x: 0, y: 200 });
  });

  test("x and y can snap to TWO DIFFERENT neighbors, producing a coordinate matching no existing node", () => {
    // CHARACTERIZATION: per-axis nearest is computed independently.
    // Target node T is near B on x and near C on y.
    // B = {x:105, y:1000}, C = {x:9000, y:25}, T = {x:100, y:0}
    // T.x diff to B = 5 (< 40) -> nearest x is B.x = 105
    // T.y diff to C = 25 (< 40) -> nearest y is C.y = 25
    // Result T = {x:105, y:25} which equals neither B nor C.
    seed({
      T: { x: 100, y: 0 },
      B: { x: 105, y: 1000 },
      C: { x: 9000, y: 25 },
    });

    alignNodes();

    const out = getPositions()!;
    expect(out.T).toEqual({ x: 105, y: 25 });
  });

  test("comparisons read the ORIGINAL map (non-incremental) so a chain shifts predictably, not cascading", () => {
    // CHARACTERIZATION: each node is compared against the ORIGINAL nodePositions
    // map and results are written to a SEPARATE aligned map. So alignment is NOT
    // applied incrementally / cascading. A naive refactor reading the in-progress
    // map would change these outputs.
    // A=100, C=120 are each 20 from B=110 (within threshold). B is 20 from A and
    // 20 from C. Each computed independently from the originals.
    seed({
      A: { x: 100, y: 0 },
      B: { x: 110, y: 1000 },
      C: { x: 120, y: 2000 },
    });

    alignNodes();

    const out = getPositions()!;
    // A's nearest x: B(diff10) vs C(diff20) -> B(110).
    expect(out.A.x).toBe(110);
    // C's nearest x: B(diff10) vs A(diff20) -> B(110).
    expect(out.C.x).toBe(110);
    // B was compared against ORIGINAL A(100)/C(120), not the just-moved values.
    // y diffs are huge so y is untouched for all.
    expect(out.A.y).toBe(0);
    expect(out.C.y).toBe(2000);
  });

  test("TIE-BREAK on nearest x is ORDER-DEPENDENT: first-encountered equal-distance neighbor wins (strict < on minDiff)", () => {
    // CHARACTERIZATION + LIKELY SURPRISE: when two neighbors are EQUIDISTANT on
    // an axis, the code keeps the FIRST one seen (uses `diff < minDiff`, strict).
    // Iteration order = object insertion order, so output depends on key order.
    // B=110 is equidistant from A=100 (10) and C=120 (10).

    // Insertion order A, C: A is seen before C -> B snaps to A.x.
    seed({
      B: { x: 110, y: 0 },
      A: { x: 100, y: 1000 },
      C: { x: 120, y: 2000 },
    });
    alignNodes();
    expect(getPositions()!.B.x).toBe(100);

    // Reverse the order of the equidistant pair: C before A -> B snaps to C.x.
    seed({
      B: { x: 110, y: 0 },
      C: { x: 120, y: 2000 },
      A: { x: 100, y: 1000 },
    });
    alignNodes();
    expect(getPositions()!.B.x).toBe(120);
  });

  test("node with no neighbor within threshold on either axis keeps BOTH original coordinates", () => {
    seed({
      A: { x: 0, y: 0 },
      Far: { x: 5000, y: 5000 },
    });

    alignNodes();

    const out = getPositions()!;
    expect(out.A).toEqual({ x: 0, y: 0 });
    expect(out.Far).toEqual({ x: 5000, y: 5000 });
  });

  test("nearest x wins when multiple neighbors are within threshold", () => {
    // A at x=100. B at x=130 (diff 30), C at x=110 (diff 10). C is nearest.
    // y values far apart so only x snapping is in play for A.
    seed({
      A: { x: 100, y: 0 },
      B: { x: 130, y: 1000 },
      C: { x: 110, y: 2000 },
    });

    alignNodes();

    const out = getPositions()!;
    // A.x snaps to the nearest x neighbor, which is C (110).
    expect(out.A.x).toBe(110);
    expect(out.A.y).toBe(0);
  });

  test("early-return when meta.nodePositions is undefined: no setState change, no undo push", () => {
    // Seed meta WITHOUT nodePositions.
    useDoc.setState(() => ({ meta: { somethingElse: 123 } }));
    const undoBefore = canUndo();
    const metaBefore = useDoc.getState().meta;

    alignNodes();

    // Guard returns early: meta unchanged, no undo entry added.
    expect(useDoc.getState().meta).toBe(metaBefore);
    expect(canUndo()).toBe(undoBefore);
  });
});

describe("alignNodesHorizontally (sets a SHARED X = average; preserves each Y)", () => {
  test("sets shared X = average of selected ids; Y preserved (despite 'Horizontally' name it makes a vertical column)", () => {
    // CHARACTERIZATION: name is inverted vs intuition. It changes X.
    seed({
      A: { x: 0, y: 10 },
      B: { x: 100, y: 20 },
      C: { x: 200, y: 30 },
    });

    alignNodesHorizontally(["A", "B", "C"]);

    const out = getPositions()!;
    const avgX = (0 + 100 + 200) / 3; // 100
    expect(out.A).toEqual({ x: avgX, y: 10 });
    expect(out.B).toEqual({ x: avgX, y: 20 });
    expect(out.C).toEqual({ x: avgX, y: 30 });
  });

  test("ids not present in the map are ignored in BOTH the average and the write", () => {
    // Pass a mix of existing + nonexistent ids; average excludes the missing.
    seed({
      A: { x: 0, y: 10 },
      B: { x: 100, y: 20 },
      D: { x: 999, y: 999 }, // exists but NOT selected -> untouched
    });

    alignNodesHorizontally(["A", "B", "GHOST"]);

    const out = getPositions()!;
    const avgX = (0 + 100) / 2; // 50, GHOST excluded
    expect(out.A).toEqual({ x: avgX, y: 10 });
    expect(out.B).toEqual({ x: avgX, y: 20 });
    // Non-selected existing node is untouched.
    expect(out.D).toEqual({ x: 999, y: 999 });
    // Ghost id is not added to the map.
    expect(out.GHOST).toBeUndefined();
  });

  test("zero matching ids: averageX fallback of 0 does NOT write x:0 onto any node (write loop skips missing ids)", () => {
    // CHARACTERIZATION: divide-by-zero fallback (count===0 -> averageX=0) is
    // effectively inert because the write loop only touches ids in the map.
    seed({
      A: { x: 7, y: 8 },
      B: { x: 9, y: 10 },
    });

    alignNodesHorizontally(["NOPE1", "NOPE2"]);

    const out = getPositions()!;
    // Nothing zeroed: original positions intact.
    expect(out.A).toEqual({ x: 7, y: 8 });
    expect(out.B).toEqual({ x: 9, y: 10 });
  });

  test("early-return when nodePositions undefined: no undo push", () => {
    useDoc.setState(() => ({ meta: {} }));
    const undoBefore = canUndo();
    alignNodesHorizontally(["A"]);
    expect(canUndo()).toBe(undoBefore);
  });
});

describe("alignNodesVertically (sets a SHARED Y = average; preserves each X)", () => {
  test("sets shared Y = average of selected ids; X preserved (despite 'Vertically' name it makes a horizontal row)", () => {
    // CHARACTERIZATION: name is inverted vs intuition. It changes Y.
    seed({
      A: { x: 10, y: 0 },
      B: { x: 20, y: 100 },
      C: { x: 30, y: 200 },
    });

    alignNodesVertically(["A", "B", "C"]);

    const out = getPositions()!;
    const avgY = (0 + 100 + 200) / 3; // 100
    expect(out.A).toEqual({ x: 10, y: avgY });
    expect(out.B).toEqual({ x: 20, y: avgY });
    expect(out.C).toEqual({ x: 30, y: avgY });
  });

  test("ids not present in the map are ignored in BOTH the average and the write", () => {
    seed({
      A: { x: 10, y: 0 },
      B: { x: 20, y: 100 },
      D: { x: 999, y: 999 },
    });

    alignNodesVertically(["A", "B", "GHOST"]);

    const out = getPositions()!;
    const avgY = (0 + 100) / 2; // 50
    expect(out.A).toEqual({ x: 10, y: avgY });
    expect(out.B).toEqual({ x: 20, y: avgY });
    expect(out.D).toEqual({ x: 999, y: 999 });
    expect(out.GHOST).toBeUndefined();
  });

  test("zero matching ids: averageY fallback of 0 does NOT write y:0 onto any node", () => {
    seed({
      A: { x: 7, y: 8 },
      B: { x: 9, y: 10 },
    });

    alignNodesVertically(["NOPE"]);

    const out = getPositions()!;
    expect(out.A).toEqual({ x: 7, y: 8 });
    expect(out.B).toEqual({ x: 9, y: 10 });
  });
});

describe("undo / redo round-trip (guards the shallow-copy of originalPositions)", () => {
  test("alignNodes: undo() restores exact original coordinates; redo() re-applies aligned", () => {
    const original: NodePositions = {
      A: { x: 100, y: 0 },
      B: { x: 130, y: 5 },
    };
    seed(original);

    alignNodes();
    const aligned = getPositions()!;
    // Sanity: something actually moved.
    expect(aligned.A).not.toEqual(original.A);

    undo();
    const afterUndo = getPositions()!;
    expect(afterUndo.A).toEqual({ x: 100, y: 0 });
    expect(afterUndo.B).toEqual({ x: 130, y: 5 });

    redo();
    const afterRedo = getPositions()!;
    expect(afterRedo.A).toEqual(aligned.A);
    expect(afterRedo.B).toEqual(aligned.B);
  });

  test("alignNodesHorizontally: undo() restores original X values", () => {
    seed({
      A: { x: 0, y: 1 },
      B: { x: 200, y: 2 },
    });

    alignNodesHorizontally(["A", "B"]);
    expect(getPositions()!.A.x).toBe(100);

    undo();
    const afterUndo = getPositions()!;
    expect(afterUndo.A).toEqual({ x: 0, y: 1 });
    expect(afterUndo.B).toEqual({ x: 200, y: 2 });
  });
});

describe("undo-stack pollution: even a NO-OP align pushes an undo entry and clears redo", () => {
  test("a no-op alignNodes still pushes undo and wipes redo history (customer-visible landmine)", () => {
    // CHARACTERIZATION: align functions ALWAYS setState + push undo, even when
    // nothing changes. A no-op align therefore destroys redo history.

    // 1. Do a real align so there's something to undo, then undo it so redo is
    //    available.
    seed({ A: { x: 100, y: 0 }, B: { x: 130, y: 5 } });
    alignNodes();
    undo();
    expect(canRedo()).toBe(true);

    // 2. Now perform a NO-OP align (nodes far apart on both axes -> nothing
    //    snaps). It still pushes an undo entry AND clears the redo stack.
    seed({ A: { x: 0, y: 0 }, Far: { x: 9000, y: 9000 } });
    const undoCountBefore = canUndo();
    alignNodes();

    // redo history wiped by the no-op.
    expect(canRedo()).toBe(false);
    // an undo entry exists from the no-op.
    expect(canUndo()).toBe(true);
    expect(undoCountBefore).toBe(false); // pre-condition: after the undo above, undo stack was empty
  });

  test("alignNodesHorizontally with a single id is a no-op-on-position but still pushes an undo entry", () => {
    seed({ A: { x: 50, y: 7 }, B: { x: 999, y: 8 } });
    // Single id -> averageX = its own x -> A unchanged.
    alignNodesHorizontally(["A"]);

    const out = getPositions()!;
    expect(out.A).toEqual({ x: 50, y: 7 }); // unchanged
    // But an undo entry was still pushed.
    expect(canUndo()).toBe(true);
  });
});
