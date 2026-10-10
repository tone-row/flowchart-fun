import { NodePositions } from "../components/getNodePositionsFromCy";
import { Direction } from "./FFTheme";
import { getElements } from "./getElements";
import {
  EdgeRef,
  NodeRef,
  resolveNodePositions,
  resolverInput,
} from "./resolveNodePositions";
import { PARENT_PADDING } from "./toTheme";

const node = (id: string, label: string, parent?: string): NodeRef => ({
  id,
  label,
  size: { width: 100, height: 40 },
  ...(parent ? { parent } : {}),
});

const container = (id: string, label: string): NodeRef => ({ id, label });

const chain = (...ids: string[]): EdgeRef[] =>
  ids.slice(1).map((target, i) => ({ source: ids[i], target }));

const frozen: NodePositions = {
  n1: { x: 0, y: 0, label: "A" },
  n2: { x: 0, y: 100, label: "B" },
  n3: { x: 0, y: 200, label: "C" },
};

const resolve = (
  nodes: NodeRef[],
  stored: NodePositions,
  edges: EdgeRef[] = [],
  direction: "DOWN" | "UP" | "LEFT" | "RIGHT" = "DOWN"
) => resolveNodePositions({ nodes, edges, stored, direction });

describe("resolveNodePositions", () => {
  test("an unchanged chart resolves to the stored map", () => {
    const positions = resolve(
      [node("n1", "A"), node("n2", "B"), node("n3", "C")],
      frozen
    );
    expect(positions).toEqual(frozen);
  });

  test("inserting a line keeps every re-keyed node at its own position", () => {
    const positions = resolve(
      [node("n1", "A"), node("n2", "New"), node("n3", "B"), node("n4", "C")],
      frozen,
      chain("n1", "n2")
    );
    expect(positions.n3).toEqual(frozen.n2);
    expect(positions.n4).toEqual(frozen.n3);
    expect(positions.n1).toEqual(frozen.n1);
  });

  test("deleting a line keeps the nodes below it in place and drops the orphan entry", () => {
    const positions = resolve([node("n1", "A"), node("n2", "C")], frozen);
    expect(positions).toEqual({ n1: frozen.n1, n2: frozen.n3 });
  });

  test("renaming a node in place keeps its position under the new label", () => {
    const positions = resolve(
      [node("n1", "A"), node("n2", "Bee"), node("n3", "C")],
      frozen
    );
    expect(positions.n2).toEqual({ x: 0, y: 100, label: "Bee" });
  });

  test("a renamed node keeps its spot when a line is inserted above it before the next drag", () => {
    const stored: NodePositions = {
      n1: { x: 0, y: 0, label: "A" },
      n2: { x: 0, y: 100, label: "B" },
      n3: { x: 0, y: 200, label: "Check" },
      n4: { x: 0, y: 300, label: "D" },
    };
    const positions = resolve(
      [
        node("n1", "A"),
        node("n2", "B"),
        node("n3", "New"),
        node("n4", "Checked"),
        node("n5", "D"),
      ],
      stored
    );
    expect(positions.n4).toMatchObject({ x: 0, y: 200 });
    expect(positions.n5).toMatchObject({ x: 0, y: 300 });
    expect(positions.n3).not.toMatchObject({ x: 0, y: 200 });
  });

  test("typing at the start of a line then Enter (rename, then split) keeps the original node in place", () => {
    const renamed = resolve(
      [node("n1", "IntroA"), node("n2", "B"), node("n3", "C")],
      frozen
    );
    expect(renamed.n1).toEqual({ x: 0, y: 0, label: "IntroA" });
    const positions = resolve(
      [node("n1", "Intro"), node("n2", "A"), node("n3", "B"), node("n4", "C")],
      frozen,
      chain("n1", "n2", "n3", "n4")
    );
    expect(positions.n2).toEqual({ x: 0, y: 0, label: "A" });
    expect(positions.n3).toEqual({ x: 0, y: 100, label: "B" });
    expect(positions.n4).toEqual({ x: 0, y: 200, label: "C" });
    expect(positions.n1).not.toMatchObject({ x: 0, y: 0 });
  });

  test("two nodes with the same label each keep their own position after an insert", () => {
    const stored: NodePositions = {
      n1: { x: 0, y: 0, label: "A" },
      n2: { x: 0, y: 100, label: "B" },
      n3: { x: 0, y: 200, label: "B" },
    };
    const positions = resolve(
      [node("n1", "A"), node("n2", "New"), node("n3", "B"), node("n4", "B")],
      stored
    );
    expect(positions.n3).toEqual(stored.n2);
    expect(positions.n4).toEqual(stored.n3);
  });

  test("a new node is placed below its parent, not at (0,0), and clear of other nodes", () => {
    const positions = resolve(
      [node("n1", "A"), node("n2", "B"), node("n3", "New"), node("n4", "C")],
      frozen,
      chain("n1", "n2", "n3")
    );
    const placed = positions.n3;
    expect(placed).toMatchObject({ label: "New" });
    expect(placed).not.toMatchObject({ x: 0, y: 0 });
    expect(placed.y).toBeGreaterThan(frozen.n2.y);
    for (const other of [positions.n1, positions.n2, positions.n4]) {
      const clear =
        Math.abs(other.x - placed.x) >= 100 ||
        Math.abs(other.y - placed.y) >= 40;
      expect(clear).toBe(true);
    }
  });

  test("a second new sibling does not land on the first", () => {
    const positions = resolve(
      [
        node("n1", "A"),
        node("n2", "B"),
        node("n3", "X"),
        node("n4", "Y"),
        node("n5", "C"),
      ],
      frozen,
      [...chain("n1", "n2", "n3"), { source: "n2", target: "n4" }]
    );
    expect(positions.n3).not.toEqual(positions.n4);
    expect(Math.abs(positions.n3.x - positions.n4.x)).toBeGreaterThanOrEqual(
      100
    );
  });

  test("direction RIGHT places the new node to the right of its parent", () => {
    const positions = resolve(
      [node("n1", "A"), node("n2", "New")],
      { n1: { x: 0, y: 0, label: "A" } },
      chain("n1", "n2"),
      "RIGHT"
    );
    expect(positions.n2.x).toBeGreaterThan(0);
    expect(positions.n2.y).toBe(0);
  });

  test("a new node with no placed neighbor goes past the far edge of the chart", () => {
    const positions = resolve(
      [node("n1", "A"), node("n2", "B"), node("n3", "C"), node("n4", "Loner")],
      frozen
    );
    expect(positions.n4.y).toBeGreaterThan(200);
  });

  test("a placed node with no neighbor stays put when another line is deleted", () => {
    const before = resolve(
      [node("n1", "Loner"), node("n2", "A"), node("n3", "B"), node("n4", "C")],
      frozen
    );
    const after = resolve(
      [node("n1", "Loner"), node("n2", "A"), node("n3", "B")],
      frozen
    );
    expect(after.n1).toEqual(before.n1);
  });

  test("new siblings are placed in line order, whichever order they were typed in", () => {
    const edges = [...chain("n1", "n2"), { source: "n1", target: "n3" }];
    const typedFirst = resolve(
      [node("n1", "A"), node("n3", "P"), node("n2", "Q")],
      { n1: { x: 0, y: 0, label: "A" } },
      edges
    );
    const textOrder = resolve(
      [node("n1", "A"), node("n2", "Q"), node("n3", "P")],
      { n1: { x: 0, y: 0, label: "A" } },
      edges
    );
    expect(typedFirst).toEqual(textOrder);
  });

  test("a node's own container is not an obstacle for its placement", () => {
    const stored: NodePositions = {
      group: { x: 50, y: 50, label: "Group" },
      n2: { x: 50, y: 50, label: "A" },
    };
    const positions = resolve(
      [
        container("group", "Group"),
        node("n2", "A", "group"),
        node("n3", "New", "group"),
      ],
      stored,
      chain("n2", "n3")
    );
    expect(positions.n3.y).toBeGreaterThan(50);
    expect(positions.n3.x).toBe(50);
  });

  test("renaming a node onto a label another node already has moves neither node", () => {
    const stored: NodePositions = {
      n1: { x: 0, y: 0, label: "A" },
      n2: { x: 0, y: 100, label: "B" },
      n3: { x: 0, y: 200, label: "Check" },
      n4: { x: 0, y: 300, label: "D" },
    };
    const positions = resolve(
      [
        node("n1", "Check"),
        node("n2", "B"),
        node("n3", "Check"),
        node("n4", "D"),
      ],
      stored
    );
    expect(positions.n1).toMatchObject({ x: 0, y: 0 });
    expect(positions.n3).toMatchObject({ x: 0, y: 200 });
  });

  test("deleting the first of two duplicate labels leaves the second where it was", () => {
    const stored: NodePositions = {
      n1: { x: 0, y: 0, label: "Check" },
      n2: { x: 0, y: 100, label: "X" },
      n3: { x: 500, y: 500, label: "Check" },
    };
    const positions = resolve([node("n1", "X"), node("n2", "Check")], stored);
    expect(positions.n1).toMatchObject({ x: 0, y: 100 });
    expect(positions.n2).toMatchObject({ x: 500, y: 500 });
  });

  test("swapping two sibling lines keeps both nodes where they were", () => {
    const stored: NodePositions = {
      ...frozen,
      n4: { x: 0, y: 300, label: "D" },
    };
    const positions = resolve(
      [node("n1", "A"), node("n2", "C"), node("n3", "B"), node("n4", "D")],
      stored
    );
    expect(positions.n2).toMatchObject({ x: 0, y: 200 });
    expect(positions.n3).toMatchObject({ x: 0, y: 100 });
  });

  test("resolving is a pure function of the stored map and the text", () => {
    const nodes = [
      node("n1", "New"),
      node("n2", "A"),
      node("n3", "Bee"),
      node("n4", "C"),
      node("n5", "Loner"),
    ];
    const edges = chain("n1", "n2", "n3", "n4");
    expect(resolve(nodes, frozen, edges)).toEqual(
      resolve(nodes, frozen, edges)
    );
  });

  describe("legacy maps (entries without labels, keyed n<line>)", () => {
    const legacy: NodePositions = {
      n1: { x: 0, y: 0 },
      n2: { x: 0, y: 100 },
      n3: { x: 0, y: 200 },
      n9: { x: 9, y: 9 },
    };

    test("an unchanged chart renders from its ids exactly as stored", () => {
      const positions = resolve(
        [node("n1", "A"), node("n2", "B"), node("n3", "C")],
        legacy
      );
      expect(positions).toEqual({
        n1: { x: 0, y: 0, label: "A" },
        n2: { x: 0, y: 100, label: "B" },
        n3: { x: 0, y: 200, label: "C" },
      });
    });

    test("a legacy map resolves by id on insert, as before, and places the node that falls off the end", () => {
      const positions = resolve(
        [node("n1", "New"), node("n2", "A"), node("n3", "B"), node("n4", "C")],
        legacy
      );
      expect(positions.n2).toMatchObject({ x: 0, y: 100 });
      expect(positions.n4).not.toMatchObject({ x: 0, y: 0 });
    });

    test("explicit #ids resolve by id", () => {
      const stored: NodePositions = { galileo: { x: 1, y: 2 } };
      const positions = resolve([node("galileo", "Galileo")], stored);
      expect(positions.galileo).toEqual({ x: 1, y: 2, label: "Galileo" });
    });
  });

  describe("placement depends only on the parse and the stored map", () => {
    const stored: NodePositions = {
      n1: { x: 0, y: 0, label: "A" },
      n2: { x: 500, y: 0, label: "B" },
    };
    const nodes = [node("n1", "A"), node("n2", "B"), node("n3", "C")];
    const AC = { source: "n1", target: "n3" };
    const BC = { source: "n2", target: "n3" };

    test("edge order does not change where a new node is placed", () => {
      const a = resolve(nodes, stored, [AC, BC]);
      const b = resolve(nodes, stored, [BC, AC]);
      expect(b.n3).toEqual(a.n3);
    });

    test("node order does not change the result", () => {
      const a = resolve(nodes, stored, [AC, BC]);
      const b = resolve([...nodes].reverse(), stored, [AC, BC]);
      expect(b).toEqual(a);
    });

    test("a node hanging off a container is placed below the container's children, whatever size the container had before this render", () => {
      const stored: NodePositions = {
        n1: { x: 0, y: 0, label: "Start" },
        n2: { x: 0, y: 100, label: "Box" },
        n3: { x: 0, y: 100, label: "One" },
      };
      const positions = resolve(
        [
          node("n1", "Start"),
          container("n2", "Box"),
          node("n3", "One", "n2"),
          node("n4", "Two", "n2"),
          node("n5", "Three", "n2"),
          node("n6", "After"),
        ],
        stored,
        [...chain("n1", "n2"), { source: "n2", target: "n6" }]
      );
      const children = [positions.n3, positions.n4, positions.n5];
      const bottom = Math.max(...children.map((p) => p.y + 20));
      expect(positions.n6.y - 20).toBeGreaterThan(bottom);
      const xs = children.map((p) => p.x);
      expect(positions.n6.x).toBe((Math.min(...xs) + Math.max(...xs)) / 2);
    });
  });

  describe("containers in placement", () => {
    const graphOf = (text: string) =>
      resolverInput(getElements(text), () => ({ width: 100, height: 40 }));
    type Rect = { x1: number; y1: number; x2: number; y2: number };
    const rects = (nodes: NodeRef[], positions: NodePositions) => {
      const out: Record<string, Rect> = {};
      const rectOf = (n: NodeRef): Rect => {
        const inner = nodes
          .filter((c) => c.parent === n.id)
          .map((c) => rectOf(c));
        if (inner.length === 0) {
          const { x, y } = positions[n.id];
          return { x1: x - 50, x2: x + 50, y1: y - 20, y2: y + 20 };
        }
        return {
          x1: Math.min(...inner.map((r) => r.x1)) - PARENT_PADDING,
          y1: Math.min(...inner.map((r) => r.y1)) - PARENT_PADDING,
          x2: Math.max(...inner.map((r) => r.x2)) + PARENT_PADDING,
          y2: Math.max(...inner.map((r) => r.y2)) + PARENT_PADDING,
        };
      };
      for (const n of nodes) out[n.label] = rectOf(n);
      return out;
    };
    const hits = (a: Rect, b: Rect) =>
      a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
    const drawnOn = (
      text: string,
      stored: NodePositions,
      direction: Direction,
      label: string
    ) => {
      const { nodes, edges } = graphOf(text);
      const r = rects(
        nodes,
        resolveNodePositions({ nodes, edges, stored, direction })
      );
      return Object.keys(r).filter(
        (other) => other !== label && hits(r[other], r[label])
      );
    };

    test("an empty container is drawn as a node, so a new sibling is not placed on it", () => {
      const stored: NodePositions = {
        n1: { x: 0, y: 0, label: "Start" },
        n2: { x: 0, y: 80, label: "Box" },
      };
      expect(
        drawnOn("Start\n  Box {\n  }\n  New", stored, "DOWN", "New")
      ).toEqual([]);
    });

    describe.each<
      [Direction, (along: number, across: number) => { x: number; y: number }]
    >([
      ["DOWN", (along, across) => ({ x: across, y: along })],
      ["UP", (along, across) => ({ x: across, y: -along })],
      ["RIGHT", (along, across) => ({ x: along, y: across })],
      ["LEFT", (along, across) => ({ x: -along, y: across })],
    ])("direction %s", (direction, at) => {
      const rank = direction === "DOWN" || direction === "UP" ? 100 : 160;
      const stored: NodePositions = {
        n1: { ...at(0, 0), label: "Start" },
        n2: { ...at(rank, 0), label: "Box" },
        n3: { ...at(rank, -300), label: "One" },
        n4: { ...at(rank, 300), label: "Two" },
      };

      test("a new node is not placed in the gap between a container's children", () => {
        const text = "Start\n  Box {\n    One\n    Two\n  }\n  New";
        expect(drawnOn(text, stored, direction, "New")).toEqual([]);
      });

      test("a new child of the container is placed inside it, clear of its siblings", () => {
        const text = "Start\n  Box {\n    One\n    New\n    Two\n  }";
        expect(drawnOn(text, stored, direction, "New")).toEqual(["Box"]);
      });
    });
  });

  describe("resolverInput", () => {
    test("takes nodes and edges in parse order, children with their parent, containers with children without a size", () => {
      const sizes: string[] = [];
      const { nodes, edges } = resolverInput(
        getElements(
          "Start\n  Box {\n    One\n  }\n    After\nStart\n  (After)\nEmpty {\n}"
        ),
        (id) => {
          sizes.push(id);
          return { width: 100, height: 40 };
        }
      );
      expect(nodes).toEqual([
        { id: "n1", label: "Start", size: { width: 100, height: 40 } },
        { id: "n2", label: "Box" },
        {
          id: "n3",
          label: "One",
          parent: "n2",
          size: { width: 100, height: 40 },
        },
        { id: "n5", label: "After", size: { width: 100, height: 40 } },
        { id: "n6", label: "Start", size: { width: 100, height: 40 } },
        { id: "n8", label: "Empty", size: { width: 100, height: 40 } },
      ]);
      expect(edges).toEqual([
        { source: "n1", target: "n2" },
        { source: "n2", target: "n5" },
        { source: "n6", target: "n5" },
      ]);
      expect(sizes).toEqual(["n1", "n3", "n5", "n6", "n8"]);
    });
  });

  describe("edit sequences on a map saved at the last drag", () => {
    const graphOf = (text: string) =>
      resolverInput(getElements(text), () => ({ width: 100, height: 40 }));

    const session = (text0: string) => {
      const stored: NodePositions = {};
      graphOf(text0).nodes.forEach((n, i) => {
        stored[n.id] = { x: i * 1000, y: i * 10, label: n.label };
      });
      let live: NodePositions = {};
      const render = (text: string) => {
        const { nodes, edges } = graphOf(text);
        live = resolveNodePositions({
          nodes,
          edges,
          stored,
          direction: "DOWN",
        });
        return live;
      };
      render(text0);
      return {
        render,
        at(label: string) {
          const entry = Object.values(live).find((p) => p.label === label);
          return entry && { x: entry.x, y: entry.y };
        },
        moved(labels: string[]) {
          return labels.filter((label) => {
            const o = Object.values(stored).find((p) => p.label === label);
            const now = this.at(label);
            return now && o && (now.x !== o.x || now.y !== o.y);
          });
        },
      };
    };

    const T = "Start\n  Alpha\n  Beta\n    Gamma\n  Delta\nEnd";
    const ALL = ["Start", "Alpha", "Beta", "Gamma", "Delta", "End"];

    test("delete two lines then undo: every node is back in place", () => {
      const s = session(T);
      s.render("Start\n  Alpha\n  Delta\nEnd");
      s.render(T);
      expect(s.moved(ALL)).toEqual([]);
    });

    test("backspace a label to empty then type a new one: the node keeps its spot", () => {
      const s = session("A\nYes\nC");
      const yes = s.at("Yes");
      for (const t of ["A\nYe\nC", "A\nY\nC", "A\n\nC", "A\nN\nC"]) {
        s.render(t);
      }
      s.render("A\nNo\nC");
      expect(s.at("No")).toEqual(yes);
      expect(s.moved(["A", "C"])).toEqual([]);
    });

    test("cut a block then paste it elsewhere: nothing moves", () => {
      const s = session("A\nB\nC\nD\n  D1\nE");
      s.render("A\nB\nC\nE");
      s.render("D\n  D1\nA\nB\nC\nE");
      expect(s.moved(["A", "B", "C", "D", "D1", "E"])).toEqual([]);
    });

    test("swap two non-adjacent lines", () => {
      const s = session("A\nB\nC\nD\nE");
      s.render("A\nD\nC\nB\nE");
      expect(s.moved(["A", "B", "C", "D", "E"])).toEqual([]);
    });

    test("many duplicate labels: insert at the top, then delete one of them", () => {
      const t0 =
        "Q1\n  Yes\n  No\nQ2\n  Yes\n  No\nQ3\n  Yes\n  No\nQ4\n  Yes\n  No";
      const s = session(t0);
      const keyed = (text: string, live: NodePositions) => {
        const { nodes, edges } = graphOf(text);
        const out: Record<string, string> = {};
        for (const n of nodes) {
          const parent = edges.find((e) => e.target === n.id)?.source;
          const parentLabel = nodes.find((m) => m.id === parent)?.label ?? "";
          out[`${parentLabel}/${n.label}`] = `${live[n.id].x},${live[n.id].y}`;
        }
        return out;
      };
      const before = keyed(`Top\n${t0}`, s.render(`Top\n${t0}`));
      const lines = `Top\n${t0}`.split("\n");
      lines.splice(5, 1);
      const after = keyed(lines.join("\n"), s.render(lines.join("\n")));
      expect(Object.keys(after).filter((k) => before[k] !== after[k])).toEqual(
        []
      );
    });

    test("split a line in two: the first half keeps the spot", () => {
      const s = session("A\nAlpha Beta\nC");
      const spot = s.at("Alpha Beta");
      s.render("A\nAlpha\nBeta\nC");
      expect(s.at("Alpha")).toEqual(spot);
      expect(s.moved(["A", "C"])).toEqual([]);
    });

    test("merge two lines into one: the merged node takes the first spot", () => {
      const s = session("A\nAlpha\nBeta\nC");
      const spot = s.at("Alpha");
      s.render("A\nAlphaBeta\nC");
      expect(s.at("AlphaBeta")).toEqual(spot);
      expect(s.moved(["A", "C"])).toEqual([]);
    });

    test("containers: insert above, then rename the container", () => {
      const s = session("X\nGroup {\n  A\n  B\n}\nY");
      const spot = s.at("Group");
      s.render("New\nX\nGroup {\n  A\n  B\n}\nY");
      s.render("New\nX\nTeam {\n  A\n  B\n}\nY");
      expect(s.at("Team")).toEqual(spot);
      expect(s.moved(["X", "A", "B", "Y"])).toEqual([]);
    });

    test("explicit ids mixed with labels: insert, rename an #id node and a plain node", () => {
      const s = session("A #a\nB\nC #c\nD");
      const [b, c] = [s.at("B"), s.at("C")];
      s.render("New\nA #a\nB\nC #c\nD");
      s.render("New\nA #a\nB2\nCee #c\nD");
      expect(s.at("Cee")).toEqual(c);
      expect(s.at("B2")).toEqual(b);
      expect(s.moved(["A", "D"])).toEqual([]);
    });

    test("renaming a saved node keeps its spot when a line is inserted above it and the line below it is deleted", () => {
      const s = session("Get OU\n  Detect role\n    Get flag\nEnd");
      const spot = s.at("Detect role");
      s.render("Get OU\n  New 2\n  Detect role r14\nEnd");
      expect(s.at("Detect role r14")).toEqual(spot);
      expect(s.moved(["Get OU", "End"])).toEqual([]);
    });

    test("renaming a saved node keeps its spot even when inserted and deleted lines surround it", () => {
      const s = session(
        [
          "Request",
          "  Check for fallback",
          "    Run fallback",
          "  Candidate {",
          "    Extract token",
          "      Decode token",
          "        Get OU",
          "          Detect role",
          "            Get flag",
          "  }",
        ].join("\n")
      );
      const spot = s.at("Detect role");
      s.render(
        [
          "Request r1",
          "  Check for fallback",
          "    Run fallback r15",
          "  Candidate {",
          "    New 2",
          "      New 3",
          "        New 1",
          "        New 5",
          "        Detect role r16",
          "  }",
        ].join("\n")
      );
      expect(s.at("Detect role r16")).toEqual(spot);
    });

    test("typing a new node character by character between two duplicates keeps the first in place and the other two apart", () => {
      const s = session("Check\nX\nCheck");
      let live: NodePositions = {};
      for (const t of ["", "C", "Ch", "Che", "Chec"]) {
        live = s.render(`Check\nX\n${t}\nCheck`);
        expect(live.n1).toMatchObject({ x: 0, y: 0 });
        expect(live.n4).toMatchObject({ x: 2000, y: 20 });
      }
      live = s.render("Check\nX\nCheck\nCheck");
      expect(live.n1).toMatchObject({ x: 0, y: 0 });
      expect(live.n2).toMatchObject({ x: 1000, y: 10 });
      expect([live.n3, live.n4]).toContainEqual(
        expect.objectContaining({ x: 2000, y: 20 })
      );
    });
  });
});
