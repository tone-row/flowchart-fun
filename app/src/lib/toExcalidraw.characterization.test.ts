import { toExcalidraw } from "./toExcalidraw";

/**
 * CHARACTERIZATION TESTS for toExcalidraw().
 *
 * toExcalidraw() reads window.__cy (a Cytoscape Core) and serializes the
 * currently-rendered graph into an Excalidraw clipboard JSON string.
 *
 * It only touches a known subset of the Cytoscape API:
 *   - cy.nodes() / cy.edges() -> collections with .forEach
 *   - node.id(), node.position(), node.boundingBox(), node.data(), node.style()
 *   - edge.data(), edge._private.rstyle (internal renderer state)
 *
 * Headless cytoscape does NOT populate node.style() with resolved values nor
 * edge._private.rstyle. Rather than render in a browser, we construct fake
 * node/edge objects implementing exactly that API surface. This isolates the
 * pure transform logic (rgbToHex, geometry math, bindings) that the migration
 * safety net is meant to lock down.
 *
 * These tests pin CURRENT behavior, including bugs. Do not "fix" anything here.
 */

type FakeStyle = Record<string, string>;

function makeNode(opts: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  style: FakeStyle;
}) {
  return {
    id: () => opts.id,
    position: () => ({ x: opts.x, y: opts.y }),
    boundingBox: () => ({ w: opts.w, h: opts.h }),
    data: () => ({ label: opts.label }),
    style: () => opts.style,
  };
}

function makeEdge(opts: {
  source: string;
  target: string;
  label?: string;
  srcX: number;
  srcY: number;
  tgtX: number;
  tgtY: number;
}) {
  return {
    data: () => ({
      source: opts.source,
      target: opts.target,
      label: opts.label,
    }),
    _private: {
      rstyle: {
        srcX: opts.srcX,
        srcY: opts.srcY,
        tgtX: opts.tgtX,
        tgtY: opts.tgtY,
      },
    },
  };
}

function makeCy(nodes: any[], edges: any[]) {
  return {
    nodes: () => ({
      forEach: (cb: (n: any) => void) => nodes.forEach(cb),
    }),
    edges: () => ({
      forEach: (cb: (e: any) => void) => edges.forEach(cb),
    }),
  };
}

// A reasonable, fully-resolved style as a real renderer would return.
function defaultStyle(overrides: Partial<FakeStyle> = {}): FakeStyle {
  return {
    shape: "rectangle",
    "background-color": "rgb(230,57,70)",
    color: "rgb(0,0,0)",
    "border-width": "2px",
    "border-color": "rgb(17,17,17)",
    ...overrides,
  };
}

function setCy(nodes: any[], edges: any[]) {
  (window as any).__cy = makeCy(nodes, edges);
}

afterEach(() => {
  delete (window as any).__cy;
  jest.restoreAllMocks();
});

describe("toExcalidraw characterization", () => {
  it("returns empty string when window.__cy is undefined", () => {
    delete (window as any).__cy;
    expect(toExcalidraw()).toBe("");
  });

  it("returns a JSON string with envelope { type: 'excalidraw/clipboard', elements: [], files: {} }", () => {
    setCy(
      [
        makeNode({
          id: "n1",
          x: 100,
          y: 100,
          w: 80,
          h: 40,
          label: "A",
          style: defaultStyle(),
        }),
      ],
      []
    );
    const out = toExcalidraw();
    expect(typeof out).toBe("string");
    const parsed = JSON.parse(out);
    expect(parsed.type).toBe("excalidraw/clipboard");
    expect(parsed.files).toEqual({});
    expect(Array.isArray(parsed.elements)).toBe(true);
  });

  it("each node emits a shape element followed by a bound text element; text.containerId points back to the shape and shape.boundElements has {type:'text', id:<textId>}", () => {
    setCy(
      [
        makeNode({
          id: "n1",
          x: 100,
          y: 100,
          w: 80,
          h: 40,
          label: "Hello",
          style: defaultStyle(),
        }),
      ],
      []
    );
    const parsed = JSON.parse(toExcalidraw());
    expect(parsed.elements).toHaveLength(2);

    const [shape, text] = parsed.elements;
    expect(shape.type).toBe("rectangle");
    expect(text.type).toBe("text");
    expect(text.text).toBe("Hello");
    expect(text.originalText).toBe("Hello");

    // two-way binding
    expect(text.containerId).toBe(shape.id);
    expect(shape.boundElements).toEqual([{ type: "text", id: text.id }]);
  });

  it("unlabeled edge: emits a single arrow; boundElements on both endpoints reference the arrow id; no edge-label text element", () => {
    const n1 = makeNode({
      id: "n1",
      x: 100,
      y: 100,
      w: 80,
      h: 40,
      label: "A",
      style: defaultStyle(),
    });
    const n2 = makeNode({
      id: "n2",
      x: 300,
      y: 100,
      w: 80,
      h: 40,
      label: "B",
      style: defaultStyle(),
    });
    setCy(
      [n1, n2],
      [
        makeEdge({
          source: "n1",
          target: "n2",
          srcX: 140,
          srcY: 100,
          tgtX: 260,
          tgtY: 100,
        }),
      ]
    );

    const parsed = JSON.parse(toExcalidraw());
    // 2 nodes * (shape + text) = 4, + 1 arrow = 5
    expect(parsed.elements).toHaveLength(5);

    const arrows = parsed.elements.filter((e: any) => e.type === "arrow");
    expect(arrows).toHaveLength(1);
    const arrow = arrows[0];

    const shapes = parsed.elements.filter(
      (e: any) => e.type === "rectangle" || e.type === "diamond"
    );
    const sourceShape = shapes[0];
    const targetShape = shapes[1];

    // arrow binds source -> target via mapped ids
    expect(arrow.startBinding.elementId).toBe(sourceShape.id);
    expect(arrow.endBinding.elementId).toBe(targetShape.id);
    expect(arrow.startBinding.gap).toBe(4);
    expect(arrow.endBinding.gap).toBe(4);
    expect(arrow.endArrowhead).toBe("triangle");
    expect(arrow.startArrowhead).toBe(null);

    // both endpoints reference the arrow id (correct in the unlabeled path)
    const sourceArrowBindings = sourceShape.boundElements.filter(
      (b: any) => b.type === "arrow"
    );
    const targetArrowBindings = targetShape.boundElements.filter(
      (b: any) => b.type === "arrow"
    );
    expect(sourceArrowBindings).toEqual([{ type: "arrow", id: arrow.id }]);
    expect(targetArrowBindings).toEqual([{ type: "arrow", id: arrow.id }]);
  });

  it("LABELED edge: boundElements on endpoints reference the LABEL element id (type 'arrow'), NOT the arrow id", () => {
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // createEdge returns [labelNode, edge] when a label exists, but the caller
    // pushes edgeAndLabel[0].id (the LABEL) into boundElements as type 'arrow'.
    const n1 = makeNode({
      id: "n1",
      x: 100,
      y: 100,
      w: 80,
      h: 40,
      label: "A",
      style: defaultStyle(),
    });
    const n2 = makeNode({
      id: "n2",
      x: 300,
      y: 100,
      w: 80,
      h: 40,
      label: "B",
      style: defaultStyle(),
    });
    setCy(
      [n1, n2],
      [
        makeEdge({
          source: "n1",
          target: "n2",
          label: "EDGE LABEL",
          srcX: 140,
          srcY: 100,
          tgtX: 260,
          tgtY: 100,
        }),
      ]
    );

    const parsed = JSON.parse(toExcalidraw());

    const arrow = parsed.elements.find((e: any) => e.type === "arrow");
    const edgeLabel = parsed.elements.find(
      (e: any) => e.type === "text" && e.text === "EDGE LABEL"
    );
    expect(arrow).toBeDefined();
    expect(edgeLabel).toBeDefined();

    const shapes = parsed.elements.filter(
      (e: any) => e.type === "rectangle" || e.type === "diamond"
    );
    const sourceShape = shapes[0];
    const targetShape = shapes[1];

    const sourceArrowBinding = sourceShape.boundElements.find(
      (b: any) => b.type === "arrow"
    );
    const targetArrowBinding = targetShape.boundElements.find(
      (b: any) => b.type === "arrow"
    );

    // BUG: the pushed id is the LABEL's id, not the arrow's id
    expect(sourceArrowBinding.id).toBe(edgeLabel.id);
    expect(targetArrowBinding.id).toBe(edgeLabel.id);
    expect(sourceArrowBinding.id).not.toBe(arrow.id);

    // edge label's containerId points to the arrow id
    expect(edgeLabel.containerId).toBe(arrow.id);
  });

  it("rgbToHex: normal channels rgb(230,57,70) -> '#e63946' (background) and rgb(17,17,17) -> '#111111' (border)", () => {
    setCy(
      [
        makeNode({
          id: "n1",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          label: "A",
          style: defaultStyle({
            "background-color": "rgb(230,57,70)",
            "border-color": "rgb(17,17,17)",
          }),
        }),
      ],
      []
    );
    const parsed = JSON.parse(toExcalidraw());
    const shape = parsed.elements[0];
    expect(shape.backgroundColor).toBe("#e63946");
    expect(shape.strokeColor).toBe("#111111");
  });

  it("rgbToHex: channel value < 16 is NOT zero-padded; rgb(5,5,5) -> malformed '#555'", () => {
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // No padStart(2,'0'), so channels < 16 emit a single hex digit. Excalidraw
    // interprets '#555' as the 3-char shorthand #555555 (a different gray).
    setCy(
      [
        makeNode({
          id: "n1",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          label: "A",
          style: defaultStyle({
            "background-color": "rgb(5,5,5)",
            color: "rgb(10,200,30)",
          }),
        }),
      ],
      []
    );
    const parsed = JSON.parse(toExcalidraw());
    const [shape, text] = parsed.elements;
    expect(shape.backgroundColor).toBe("#555");
    // rgb(10,200,30) -> 'a' + 'c8' + '1e' = '#ac81e' (5 chars, garbage)
    expect(text.strokeColor).toBe("#ac81e");
  });

  it("node with border-width 0px: strokeColor short-circuits to literal 'transparent' (border-color not converted)", () => {
    setCy(
      [
        makeNode({
          id: "n1",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          label: "A",
          style: defaultStyle({
            "border-width": "0px",
            // intentionally invalid: would throw in rgbToHex if not short-circuited
            "border-color": "rgb(1,2,3)",
          }),
        }),
      ],
      []
    );
    const parsed = JSON.parse(toExcalidraw());
    const shape = parsed.elements[0];
    expect(shape.strokeColor).toBe("transparent");
    expect(shape.strokeWidth).toBe(0);
  });

  it("getNodeType: shape 'diamond' -> 'diamond'; ellipse and hexagon both -> 'rectangle'", () => {
    setCy(
      [
        makeNode({
          id: "d",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          label: "D",
          style: defaultStyle({ shape: "diamond" }),
        }),
        makeNode({
          id: "e",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          label: "E",
          style: defaultStyle({ shape: "ellipse" }),
        }),
        makeNode({
          id: "h",
          x: 0,
          y: 0,
          w: 10,
          h: 10,
          label: "H",
          style: defaultStyle({ shape: "hexagon" }),
        }),
      ],
      []
    );
    const parsed = JSON.parse(toExcalidraw());
    const shapes = parsed.elements.filter((e: any) => e.type !== "text");
    expect(shapes.map((s: any) => s.type)).toEqual([
      "diamond",
      "rectangle",
      "rectangle",
    ]);
  });

  it("geometry: node x/y == 0.9*(pos - dim/2), width/height == 0.9*dim", () => {
    setCy(
      [
        makeNode({
          id: "n1",
          x: 100,
          y: 200,
          w: 80,
          h: 40,
          label: "A",
          style: defaultStyle(),
        }),
      ],
      []
    );
    const parsed = JSON.parse(toExcalidraw());
    const shape = parsed.elements[0];
    expect(shape.x).toBeCloseTo(0.9 * (100 - 80 / 2)); // 0.9 * 60 = 54
    expect(shape.y).toBeCloseTo(0.9 * (200 - 40 / 2)); // 0.9 * 180 = 162
    expect(shape.width).toBeCloseTo(0.9 * 80); // 72
    expect(shape.height).toBeCloseTo(0.9 * 40); // 36
  });

  it("geometry: edge points == [[srcX*0.9, srcY*0.9],[tgtX*0.9, tgtY*0.9]]; arrow element x=y=0", () => {
    const n1 = makeNode({
      id: "n1",
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      label: "A",
      style: defaultStyle(),
    });
    const n2 = makeNode({
      id: "n2",
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      label: "B",
      style: defaultStyle(),
    });
    setCy(
      [n1, n2],
      [
        makeEdge({
          source: "n1",
          target: "n2",
          srcX: 140,
          srcY: 100,
          tgtX: 260,
          tgtY: 220,
        }),
      ]
    );
    const parsed = JSON.parse(toExcalidraw());
    const arrow = parsed.elements.find((e: any) => e.type === "arrow");
    expect(arrow.x).toBe(0);
    expect(arrow.y).toBe(0);
    expect(arrow.points).toEqual([
      [140 * 0.9, 100 * 0.9],
      [260 * 0.9, 220 * 0.9],
    ]);
  });

  it("hardcoded magic constants are present on node shape, node text, and arrow (paste-format pinning)", () => {
    const n1 = makeNode({
      id: "n1",
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      label: "A",
      style: defaultStyle(),
    });
    const n2 = makeNode({
      id: "n2",
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      label: "B",
      style: defaultStyle(),
    });
    setCy(
      [n1, n2],
      [
        makeEdge({
          source: "n1",
          target: "n2",
          srcX: 1,
          srcY: 1,
          tgtX: 2,
          tgtY: 2,
        }),
      ]
    );
    const parsed = JSON.parse(toExcalidraw());
    const shape = parsed.elements.find((e: any) => e.type === "rectangle");
    const text = parsed.elements.find((e: any) => e.type === "text");
    const arrow = parsed.elements.find((e: any) => e.type === "arrow");

    // node shape
    expect(shape.roundness).toEqual({ type: 3 });
    expect(shape.updated).toBe(1698858608230);
    expect(shape.fillStyle).toBe("solid");
    expect(shape.strokeStyle).toBe("solid");
    expect(shape.roughness).toBe(0);
    expect(shape.opacity).toBe(100);

    // node text
    expect(text.backgroundColor).toBe("#f8f9fa");
    expect(text.fontFamily).toBe(1);
    expect(text.fontSize).toBe(16);
    expect(text.roundness).toBe(null);
    expect(text.updated).toBe(1698858603606);
    expect(text.lineHeight).toBe(1.25);

    // arrow
    expect(arrow.roundness).toEqual({ type: 2 });
    expect(arrow.strokeColor).toBe("#1e1e1e");
    expect(arrow.strokeWidth).toBe(2);
    expect(arrow.updated).toBe(1698866637577);
  });

  it("referential integrity + determinism: with Math.random mocked, all bindings/containerIds resolve to real element ids and the full output is a stable snapshot", () => {
    // Deterministic id sequence
    let seed = 0;
    jest.spyOn(Math, "random").mockImplementation(() => {
      // produce distinct, stable values
      seed += 0.00001;
      return 0.123456789 + seed;
    });

    const n1 = makeNode({
      id: "n1",
      x: 100,
      y: 100,
      w: 80,
      h: 40,
      label: "Start",
      style: defaultStyle({ shape: "diamond" }),
    });
    const n2 = makeNode({
      id: "n2",
      x: 300,
      y: 100,
      w: 80,
      h: 40,
      label: "End",
      style: defaultStyle(),
    });
    setCy(
      [n1, n2],
      [
        makeEdge({
          source: "n1",
          target: "n2",
          label: "go",
          srcX: 140,
          srcY: 100,
          tgtX: 260,
          tgtY: 100,
        }),
      ]
    );

    const out = toExcalidraw();
    const parsed = JSON.parse(out);

    // collect all element ids
    const allIds = new Set(parsed.elements.map((e: any) => e.id));
    // ids must be unique
    expect(allIds.size).toBe(parsed.elements.length);

    // every reference must resolve to a real element id
    for (const el of parsed.elements) {
      if (el.containerId != null) {
        expect(allIds.has(el.containerId)).toBe(true);
      }
      if (el.startBinding?.elementId != null) {
        expect(allIds.has(el.startBinding.elementId)).toBe(true);
      }
      if (el.endBinding?.elementId != null) {
        expect(allIds.has(el.endBinding.elementId)).toBe(true);
      }
      if (Array.isArray(el.boundElements)) {
        for (const b of el.boundElements) {
          expect(allIds.has(b.id)).toBe(true);
        }
      }
    }

    // Stable byte-for-byte snapshot of the locked output shape.
    expect(out).toMatchSnapshot();
  });
});
