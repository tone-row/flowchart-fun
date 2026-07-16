import cytoscape from "cytoscape";

import { toJSONCanvas } from "./toJSONCanvas";

/**
 * CHARACTERIZATION tests for toJSONCanvas.
 *
 * These lock in the CURRENT behavior of the Cytoscape -> Obsidian JSON Canvas
 * exporter so a future framework/engine migration can't silently change the
 * exported file format. They assert ACTUAL output, not ideal output.
 *
 * Environment notes (discovered by running, not assumed):
 * - A headless cytoscape instance built with `styleEnabled: true` + an explicit
 *   stylesheet DOES resolve `node.renderedStyle().backgroundColor` to a concrete
 *   `rgb(...)` string in jsdom. So rgbToHex does not crash here. The
 *   non-null-assertion crash in rgbToHex is still a latent landmine if a future
 *   engine returns undefined/empty for renderedStyle (see notes/surprises).
 * - Manual `position:` on element definitions is NOT reliably honored on a
 *   headless instance without a layout, so positions are set explicitly via
 *   `node.position({x,y})` AFTER construction. This is the only way to drive the
 *   side-scoring heuristic deterministically.
 * - `width`/`height` from the stylesheet ARE applied: e.g. style width:40 ->
 *   exported width Math.round(40 + 46) = 86.
 */

type CyOpts = cytoscape.CytoscapeOptions;

const NODE_STYLE = [
  {
    selector: "node",
    style: {
      "background-color": "rgb(227,242,253)", // -> #e3f2fd
      width: 40,
      height: 20,
    },
  },
];

function buildCy(opts: Omit<NonNullable<CyOpts>, "headless">) {
  return cytoscape({
    headless: true,
    styleEnabled: true,
    ...opts,
  } as CyOpts);
}

describe("toJSONCanvas characterization", () => {
  it("empty graph returns { nodes: [], edges: [] } (always-present arrays)", () => {
    const cy = buildCy({ elements: [], style: NODE_STYLE });
    const out = toJSONCanvas(cy);

    // CHARACTERIZATION: documents current behavior. The JSONCanvas type marks
    // both arrays optional, but the code always initializes them, so an empty
    // graph yields explicit empty arrays, not {}.
    expect(out).toEqual({ nodes: [], edges: [] });
    expect(Array.isArray(out.nodes)).toBe(true);
    expect(Array.isArray(out.edges)).toBe(true);
  });

  it("single leaf node maps to a 'text' node with +46 padded, rounded width/height, label as text, and color hex", () => {
    const cy = buildCy({
      elements: [{ data: { id: "a", label: "Hello" } }],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 10, y: 20 });

    const out = toJSONCanvas(cy);

    expect(out.nodes).toEqual([
      {
        id: "a",
        type: "text",
        x: 10,
        y: 20,
        // Math.round(40 + 46) and Math.round(20 + 46) -- HEIGHT_PAD=46 is added
        // to BOTH width and height despite its name.
        width: 86,
        height: 66,
        text: "Hello",
        // rgb(227,242,253) -> #e3f2fd
        color: "#e3f2fd",
      },
    ]);
    expect(out.edges).toEqual([]);
  });

  it("node with rgb(255,255,255) background OMITS the color key", () => {
    const cy = buildCy({
      elements: [{ data: { id: "a", label: "White" } }],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "rgb(255,255,255)",
            width: 40,
            height: 20,
          },
        },
      ],
    });
    cy.getElementById("a").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);

    // CHARACTERIZATION: white (#ffffff) is silently dropped -- no color key.
    expect(out.nodes).toHaveLength(1);
    expect(out.nodes![0]).not.toHaveProperty("color");
    expect(out.nodes![0]).toEqual({
      id: "a",
      type: "text",
      x: 0,
      y: 0,
      width: 86,
      height: 66,
      text: "White",
    });
  });

  it("a style of background-color:'transparent' resolves to rgb(0,0,0) and DOES emit color '#000000'", () => {
    const cy = buildCy({
      elements: [{ data: { id: "a", label: "Transparent" } }],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "transparent",
            width: 40,
            height: 20,
          },
        },
      ],
    });
    cy.getElementById("a").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);

    // CHARACTERIZATION (likely-bug-adjacent): the source only skips color when
    // renderedStyle().backgroundColor === the literal string "transparent".
    // But cytoscape resolves the "transparent" style to an rgb() value (here
    // rgb(0,0,0)) in renderedStyle, so the string check NEVER matches and the
    // node gets color "#000000" instead of being skipped. The `!== "transparent"`
    // guard is effectively dead for styled nodes. No crash occurs because a
    // concrete rgb() is returned.
    expect(out.nodes).toHaveLength(1);
    expect(out.nodes![0].color).toBe("#000000");
  });

  it("a non-default colored node DOES emit a color hex", () => {
    const cy = buildCy({
      elements: [{ data: { id: "a", label: "Red" } }],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "rgb(255,0,0)",
            width: 40,
            height: 20,
          },
        },
      ],
    });
    cy.getElementById("a").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out.nodes![0].color).toBe("#ff0000");
  });

  it("rgbToHex zero-pads single hex digits (e.g. rgb(1,2,3) -> #010203)", () => {
    const cy = buildCy({
      elements: [{ data: { id: "a", label: "Dark" } }],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "rgb(1,2,3)",
            width: 40,
            height: 20,
          },
        },
      ],
    });
    cy.getElementById("a").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);
    // CHARACTERIZATION: padStart(2,"0") on each channel.
    expect(out.nodes![0].color).toBe("#010203");
  });

  it("parent (compound) node is typed 'group' but still carries a `text` field (TextNode shape)", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "parent", label: "ParentLabel" } },
        { data: { id: "child", label: "Child", parent: "parent" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("child").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);

    const parent = out.nodes!.find((n) => n.id === "parent") as any;
    const child = out.nodes!.find((n) => n.id === "child") as any;

    // CHARACTERIZATION: isParent() => type 'group', but the emitted object is
    // still TextNode-shaped (has `text`, NOT `label`/`background`).
    expect(parent.type).toBe("group");
    expect(parent.text).toBe("ParentLabel");
    expect(parent).not.toHaveProperty("label");
    expect(parent).not.toHaveProperty("background");

    expect(child.type).toBe("text");
    expect(child.text).toBe("Child");
  });

  it("two horizontally-separated nodes => fromSide 'right' / toSide 'left'", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "e", source: "a", target: "b", label: "edge" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 0, y: 0 });
    cy.getElementById("b").position({ x: 200, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out.edges![0].fromSide).toBe("right");
    expect(out.edges![0].toSide).toBe("left");
  });

  it("two vertically-separated nodes (target below) => fromSide 'bottom' / toSide 'top'", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "e", source: "a", target: "b", label: "edge" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 0, y: 0 });
    cy.getElementById("b").position({ x: 0, y: 200 });

    const out = toJSONCanvas(cy);
    expect(out.edges![0].fromSide).toBe("bottom");
    expect(out.edges![0].toSide).toBe("top");
  });

  it("target to the left => fromSide 'left' / toSide 'right'", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "e", source: "a", target: "b", label: "edge" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 300, y: 0 });
    cy.getElementById("b").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out.edges![0].fromSide).toBe("left");
    expect(out.edges![0].toSide).toBe("right");
  });

  it("target above => fromSide 'top' / toSide 'bottom'", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "e", source: "a", target: "b", label: "edge" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 0, y: 300 });
    cy.getElementById("b").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out.edges![0].fromSide).toBe("top");
    expect(out.edges![0].toSide).toBe("bottom");
  });

  it("perfectly overlapping nodes (all scores equal) tie-break resolves to 'down' => bottom/top", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "e", source: "a", target: "b", label: "edge" } },
      ],
      style: NODE_STYLE,
    });
    // identical positions => all four direction scores equal => Object.keys
    // order (down, left, right, up) makes 'down' win.
    cy.getElementById("a").position({ x: 0, y: 0 });
    cy.getElementById("b").position({ x: 0, y: 0 });

    const out = toJSONCanvas(cy);
    // CHARACTERIZATION: tie-break is deterministic via object key literal order.
    expect(out.edges![0].fromSide).toBe("bottom");
    expect(out.edges![0].toSide).toBe("top");
  });

  it("edge mapping copies id, source->fromNode, target->toNode, label; fromEnd/toEnd pass through data()", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        {
          data: {
            id: "edge1",
            source: "a",
            target: "b",
            label: "my edge",
            fromEnd: "none",
            toEnd: "arrow",
          },
        },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 0, y: 0 });
    cy.getElementById("b").position({ x: 200, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out.edges![0]).toEqual({
      id: "edge1",
      fromNode: "a",
      toNode: "b",
      label: "my edge",
      fromSide: "right",
      toSide: "left",
      fromEnd: "none",
      toEnd: "arrow",
    });
  });

  it("edge without fromEnd/toEnd keeps the keys present-but-undefined in memory; JSON.stringify drops them", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "e", source: "a", target: "b", label: "lbl" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 0, y: 0 });
    cy.getElementById("b").position({ x: 200, y: 0 });

    const out = toJSONCanvas(cy);
    const edge = out.edges![0];

    // CHARACTERIZATION: raw object has the keys with undefined values...
    expect("fromEnd" in edge).toBe(true);
    expect("toEnd" in edge).toBe(true);
    expect(edge.fromEnd).toBeUndefined();
    expect(edge.toEnd).toBeUndefined();

    // ...but the serialized form (what actually gets written to the file) drops
    // undefined keys.
    const serialized = JSON.parse(JSON.stringify(out));
    expect(serialized.edges[0]).not.toHaveProperty("fromEnd");
    expect(serialized.edges[0]).not.toHaveProperty("toEnd");
    expect(serialized.edges[0]).toEqual({
      id: "e",
      fromNode: "a",
      toNode: "b",
      label: "lbl",
      fromSide: "right",
      toSide: "left",
    });
  });

  it("node ordering in output follows cytoscape element order (parent before child here)", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "first", label: "First" } },
        { data: { id: "second", label: "Second" } },
        { data: { id: "third", label: "Third" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("first").position({ x: 0, y: 0 });
    cy.getElementById("second").position({ x: 100, y: 0 });
    cy.getElementById("third").position({ x: 200, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out.nodes!.map((n) => n.id)).toEqual(["first", "second", "third"]);
  });

  it("DEFAULT stylesheet (no custom style): node still gets a color (default bg resolves to a concrete rgb)", () => {
    // No `style` provided -> cytoscape default stylesheet applies.
    const cy = buildCy({
      elements: [{ data: { id: "a", label: "Default" } }],
    });
    cy.getElementById("a").position({ x: 0, y: 0 });

    // CHARACTERIZATION: With styleEnabled headless + the DEFAULT cytoscape
    // stylesheet, renderedStyle().backgroundColor returns a concrete rgb()
    // string, so rgbToHex does NOT throw. The default cytoscape node background
    // is "#999" => rgb(153,153,153) => "#999999". This documents that the
    // naive-headless rgbToHex crash hazard does NOT trigger here; it would only
    // trigger if a future engine returned undefined/empty for backgroundColor.
    const out = toJSONCanvas(cy);
    expect(out.nodes).toHaveLength(1);
    expect(out.nodes![0].color).toBe("#999999");
  });

  it("full structural snapshot for a representative two-node + edge graph", () => {
    const cy = buildCy({
      elements: [
        { data: { id: "a", label: "Start" } },
        { data: { id: "b", label: "End" } },
        { data: { id: "e", source: "a", target: "b", label: "goes to" } },
      ],
      style: NODE_STYLE,
    });
    cy.getElementById("a").position({ x: 0, y: 0 });
    cy.getElementById("b").position({ x: 200, y: 0 });

    const out = toJSONCanvas(cy);
    expect(out).toMatchSnapshot();
  });
});
