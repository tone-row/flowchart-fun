import { NodePositions } from "../components/getNodePositionsFromCy";
import { cytoscape } from "./cytoscape";
import { Direction } from "./FFTheme";
import { PARENT_PADDING } from "./toTheme";
import { isEdge } from "./utils";

export type NodeSize = { width: number; height: number };

export type NodeRef = {
  id: string;
  label: string;
  parent?: string;
  size?: NodeSize;
};

export type EdgeRef = { source: string; target: string };

export type ResolverInput = { nodes: NodeRef[]; edges: EdgeRef[] };

export function resolverInput(
  elements: cytoscape.ElementDefinition[],
  sizeOf: (id: string) => NodeSize
): ResolverInput {
  const nodes: NodeRef[] = [];
  const edges: EdgeRef[] = [];
  for (const element of elements) {
    const { data } = element;
    if (isEdge(element)) {
      edges.push({
        source: data.source as string,
        target: data.target as string,
      });
      continue;
    }
    const id = data.id as string;
    nodes.push({
      id,
      label: typeof data.label === "string" ? data.label : "",
      ...(data.parent ? { parent: data.parent as string } : {}),
      ...(data.isParent ? {} : { size: sizeOf(id) }),
    });
  }
  return { nodes, edges };
}

const GAP = 40;

const lineOf = (id: string) => {
  const match = /^n(\d+)$/.exec(id);
  return match ? Number(match[1]) : undefined;
};

const nearestTo = (keys: string[], line: number) => {
  const distance = (key: string) => Math.abs((lineOf(key) ?? line) - line);
  return keys.reduce((a, b) => (distance(b) < distance(a) ? b : a));
};

export function resolveNodePositions({
  nodes,
  edges,
  stored,
  direction,
}: {
  nodes: NodeRef[];
  edges: EdgeRef[];
  stored: NodePositions;
  direction: Direction;
}): NodePositions {
  const positions: NodePositions = {};
  const claimed = new Set<string>();
  const claim = (node: NodeRef, key: string) => {
    claimed.add(key);
    positions[node.id] = {
      x: stored[key].x,
      y: stored[key].y,
      label: node.label,
    };
  };

  for (const node of nodes) {
    const own = stored[node.id];
    if (own && (own.label === undefined || lineOf(node.id) === undefined)) {
      claim(node, node.id);
    }
  }

  const storedSeq = Object.entries(stored)
    .flatMap(([key, { label }]) =>
      claimed.has(key) || label === undefined
        ? []
        : [{ key, label, line: lineOf(key) ?? -1 }]
    )
    .sort(
      (a, b) =>
        (a.line < 0 ? Infinity : a.line) - (b.line < 0 ? Infinity : b.line)
    );
  const lines = new Map(
    nodes.map((node, index) => [node.id, lineOf(node.id) ?? index + 1])
  );
  const currentSeq = nodes
    .map((node) => ({ node, line: lines.get(node.id) as number }))
    .filter(({ node }) => !positions[node.id])
    .sort((a, b) => a.line - b.line);
  const labelled = ({ node, line }: { node: NodeRef; line: number }) => ({
    label: node.label,
    line,
  });
  const pairs = alignByLabel(storedSeq, currentSeq.map(labelled));
  for (const [i, j] of pairs) claim(currentSeq[j].node, storedSeq[i].key);

  const unclaimedByLabel = new Map<string, string[]>();
  for (const { key, label } of storedSeq) {
    if (claimed.has(key)) continue;
    unclaimedByLabel.set(label, [...(unclaimedByLabel.get(label) ?? []), key]);
  }
  for (const { node, line } of currentSeq) {
    if (positions[node.id]) continue;
    const keys = (unclaimedByLabel.get(node.label) ?? []).filter(
      (key) => !claimed.has(key)
    );
    if (keys.length > 0) claim(node, nearestTo(keys, line));
  }

  let si = 0;
  let ci = 0;
  for (const [i, j] of [...pairs, [storedSeq.length, currentSeq.length]]) {
    const gapStored = storedSeq
      .slice(si, i)
      .filter(({ key }) => !claimed.has(key));
    const gapCurrent = currentSeq
      .slice(ci, j)
      .filter(({ node }) => !positions[node.id]);
    const renames = pairAsRenames(gapStored, gapCurrent.map(labelled));
    for (const [a, b] of renames) claim(gapCurrent[b].node, gapStored[a].key);
    si = i + 1;
    ci = j + 1;
  }

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const children = new Map<string, NodeRef[]>();
  for (const node of nodes) {
    if (node.parent) {
      children.set(node.parent, [...(children.get(node.parent) ?? []), node]);
    }
  }
  const adjacent = new Map<string, string[]>();
  for (const { source, target } of edges) {
    adjacent.set(target, [...(adjacent.get(target) ?? []), source]);
    adjacent.set(source, [...(adjacent.get(source) ?? []), target]);
  }
  const axis = direction === "LEFT" || direction === "RIGHT" ? "x" : "y";
  const perp = axis === "x" ? "y" : "x";
  const sign = direction === "LEFT" || direction === "UP" ? -1 : 1;
  const toBox = (size: NodeSize, at: { x: number; y: number }): Box => ({
    along: at[axis],
    across: at[perp],
    alongSize: axis === "x" ? size.width : size.height,
    acrossSize: axis === "x" ? size.height : size.width,
  });
  const boxOf = (id: string): Box | undefined => {
    const node = byId.get(id);
    if (!node) return undefined;
    if (node.size) {
      return positions[id] && toBox(node.size, positions[id]);
    }
    const inner = (children.get(id) ?? []).flatMap((child) => {
      const b = boxOf(child.id);
      return b ? [b] : [];
    });
    if (inner.length === 0) return undefined;
    const lo = Math.min(...inner.map((b) => b.along - b.alongSize / 2));
    const hi = Math.max(...inner.map((b) => b.along + b.alongSize / 2));
    const near = Math.min(...inner.map((b) => b.across - b.acrossSize / 2));
    const far = Math.max(...inner.map((b) => b.across + b.acrossSize / 2));
    return {
      along: (lo + hi) / 2,
      across: (near + far) / 2,
      alongSize: hi - lo + 2 * PARENT_PADDING,
      acrossSize: far - near + 2 * PARENT_PADDING,
    };
  };
  const placed: Box[] = [];
  for (const node of nodes) {
    if (node.size && positions[node.id]) {
      placed.push(toBox(node.size, positions[node.id]));
    }
  }
  const extent = Object.values(stored).reduce(
    (e, at) => ({
      far: sign > 0 ? Math.max(e.far, at[axis]) : Math.min(e.far, at[axis]),
      min: Math.min(e.min, at[perp]),
      max: Math.max(e.max, at[perp]),
    }),
    { far: sign > 0 ? -Infinity : Infinity, min: Infinity, max: -Infinity }
  );
  for (const { node } of currentSeq) {
    if (positions[node.id]) continue;
    const size = node.size ?? { width: 0, height: 0 };
    const neighbor = (adjacent.get(node.id) ?? [])
      .sort((a, b) => (lines.get(a) ?? 0) - (lines.get(b) ?? 0))
      .map(boxOf)
      .find(Boolean);
    const point = placeBox(
      toBox(size, { x: 0, y: 0 }),
      neighbor,
      placed,
      extent,
      sign
    );
    const at = { x: 0, y: 0 };
    at[axis] = point.along;
    at[perp] = point.across;
    positions[node.id] = { ...at, label: node.label };
    if (node.size) placed.push(toBox(node.size, at));
  }

  return positions;
}

type Box = {
  along: number;
  across: number;
  alongSize: number;
  acrossSize: number;
};

type Labelled = { label: string; line: number }[];

function alignByLabel(stored: Labelled, current: Labelled): [number, number][] {
  const eq = (i: number, j: number) => stored[i].label === current[j].label;
  const { head, tail, lo, sHi, cHi } = trimCommonEnds(
    stored.length,
    current.length,
    eq
  );

  const currentLabels = new Set(current.slice(lo, cHi).map((c) => c.label));
  const sIdx: number[] = [];
  for (let i = lo; i < sHi; i++) {
    if (currentLabels.has(stored[i].label)) sIdx.push(i);
  }
  const storedLabels = new Set(sIdx.map((i) => stored[i].label));
  const cIdx: number[] = [];
  for (let j = lo; j < cHi; j++) {
    if (storedLabels.has(current[j].label)) cIdx.push(j);
  }
  const sameLineBonus = 1;
  const matchWeight = (sIdx.length + cIdx.length) * sameLineBonus + 1;
  const middle = monotonePairs(sIdx.length, cIdx.length, (i, j) => {
    if (!eq(sIdx[i], cIdx[j])) return 0;
    const sameLine = stored[sIdx[i]].line === current[cIdx[j]].line;
    return matchWeight + (sameLine ? sameLineBonus : 0);
  }).map(([i, j]): [number, number] => [sIdx[i], cIdx[j]]);
  return [...head, ...middle, ...tail.reverse()];
}

function pairAsRenames(stored: Labelled, current: Labelled) {
  return monotonePairs(stored.length, current.length, (i, j) => {
    const sameLine = stored[i].line === current[j].line;
    return (
      1 +
      4 * labelSimilarity(stored[i].label, current[j].label) +
      (sameLine ? 0.5 : 0)
    );
  });
}

function labelSimilarity(a: string, b: string) {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) {
    prefix++;
  }
  let suffix = 0;
  while (
    suffix < a.length - prefix &&
    suffix < b.length - prefix &&
    a[a.length - 1 - suffix] === b[b.length - 1 - suffix]
  ) {
    suffix++;
  }
  return (prefix + suffix) / longest;
}

function monotonePairs(
  n: number,
  m: number,
  score: (i: number, j: number) => number
): [number, number][] {
  const dp = new Float64Array((n + 1) * (m + 1));
  const at = (i: number, j: number) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const pair = score(i, j);
      dp[at(i, j)] = Math.max(
        pair ? dp[at(i + 1, j + 1)] + pair : 0,
        dp[at(i + 1, j)],
        dp[at(i, j + 1)]
      );
    }
  }
  const pairs: [number, number][] = [];
  for (let i = 0, j = 0; i < n && j < m; ) {
    const pair = score(i, j);
    if (pair && dp[at(i, j)] === dp[at(i + 1, j + 1)] + pair) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (dp[at(i + 1, j)] >= dp[at(i, j + 1)]) {
      i++;
    } else {
      j++;
    }
  }
  return pairs;
}

function trimCommonEnds(
  storedLength: number,
  currentLength: number,
  eq: (i: number, j: number) => boolean
) {
  const head: [number, number][] = [];
  let lo = 0;
  let sHi = storedLength;
  let cHi = currentLength;
  while (lo < sHi && lo < cHi && eq(lo, lo)) {
    head.push([lo, lo]);
    lo++;
  }
  const tail: [number, number][] = [];
  while (sHi > lo && cHi > lo && eq(sHi - 1, cHi - 1)) {
    sHi--;
    cHi--;
    tail.push([sHi, cHi]);
  }
  return { head, tail, lo, sHi, cHi };
}

function placeBox(
  size: Box,
  neighbor: Box | undefined,
  placed: Box[],
  extent: { far: number; min: number; max: number },
  sign: 1 | -1
): { along: number; across: number } {
  let along = 0;
  let across = 0;
  if (neighbor) {
    across = neighbor.across;
    along =
      neighbor.along +
      sign * (neighbor.alongSize / 2 + size.alongSize / 2 + GAP);
  } else if (Number.isFinite(extent.far)) {
    across = (extent.min + extent.max) / 2;
    along = extent.far + sign * (size.alongSize + GAP);
  }

  const inLane = placed.filter(
    (n) =>
      Math.abs(n.along - along) < (n.alongSize + size.alongSize) / 2 + GAP / 2
  );
  const overlaps = (n: Box) =>
    Math.abs(n.across - across) <
    (n.acrossSize + size.acrossSize) / 2 + GAP / 2;
  for (let i = 0; i < 100 && inLane.some(overlaps); i++) {
    across += size.acrossSize + GAP;
  }
  return { along, across };
}
