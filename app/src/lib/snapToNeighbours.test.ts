import { snapToNeighbours } from "./alignNodes";

const positions = {
  parent: { x: 0, y: 100.1, label: "Parent" },
  sibling: { x: 0.3, y: 300, label: "Sibling" },
  dragged: { x: 250, y: 106.3, label: "Dragged" },
};

test("a drop within the threshold of a row lands exactly on it and keeps its x", () => {
  const snapped = snapToNeighbours(
    positions,
    { grabbed: "dragged", moved: ["dragged"] },
    { connected: [], all: ["parent", "sibling"] },
    8
  );
  expect(snapped.dragged).toEqual({ x: 250, y: 100.1, label: "Dragged" });
  expect(snapped.dragged.y - snapped.parent.y).toBe(0);
  expect(snapped.parent).toBe(positions.parent);
  expect(snapped.sibling).toBe(positions.sibling);
});

test("a drop beyond the threshold stays where it was dropped", () => {
  const snapped = snapToNeighbours(
    positions,
    { grabbed: "dragged", moved: ["dragged"] },
    { connected: [], all: ["parent", "sibling"] },
    6
  );
  expect(snapped).toEqual(positions);
});

test("each axis snaps on its own to the nearest node in range", () => {
  const snapped = snapToNeighbours(
    { ...positions, dragged: { x: 4, y: 293, label: "Dragged" } },
    { grabbed: "dragged", moved: ["dragged"] },
    { connected: [], all: ["parent", "sibling"] },
    8
  );
  expect(snapped.dragged).toEqual({ x: 0.3, y: 300, label: "Dragged" });
});

test("a connected node in range wins over a nearer unconnected one", () => {
  const snapped = snapToNeighbours(
    {
      ...positions,
      unrelated: { x: 500, y: 104, label: "Unrelated" },
    },
    { grabbed: "dragged", moved: ["dragged"] },
    { connected: ["parent"], all: ["parent", "sibling", "unrelated"] },
    8
  );
  expect(snapped.dragged.y).toBe(100.1);

  const unrelatedOnly = snapToNeighbours(
    { ...positions, unrelated: { x: 500, y: 104, label: "Unrelated" } },
    { grabbed: "dragged", moved: ["dragged"] },
    { connected: ["sibling"], all: ["parent", "sibling", "unrelated"] },
    8
  );
  expect(unrelatedOnly.dragged.y).toBe(104);
});

test("a group moves by the grabbed node's snap and never snaps to itself", () => {
  const snapped = snapToNeighbours(
    {
      ...positions,
      follower: { x: 250, y: 108, label: "Follower" },
    },
    { grabbed: "dragged", moved: ["dragged", "follower"] },
    { connected: [], all: ["parent", "sibling", "follower"] },
    8
  );
  expect(snapped.dragged).toEqual({ x: 250, y: 100.1, label: "Dragged" });
  expect(snapped.follower.x).toBe(250);
  expect(snapped.follower.y).toBeCloseTo(108 - 6.2, 10);
  expect(snapped.follower.label).toBe("Follower");
});
