import cytoscape from "cytoscape";

import { getElements } from "./getElements";

/**
 * CHARACTERIZATION TESTS for getElements (core pipeline entry).
 *
 * These lock down the CURRENT behavior of getElements (text -> Cytoscape
 * ElementDefinition[]) before a future framework migration. They assert what
 * the code actually does today, not what it ideally should do.
 *
 * Environment note: getSize() depends on a DOM element with id="resizer" plus a
 * zustand font store. In jsdom (this test env) there is no #resizer by default,
 * so getSize() returns the string-literal sizes { width: "label", height:
 * "label" }. Most cases below therefore assert "label", NOT measured pixels.
 * One case injects a #resizer to characterize the measured-size path.
 */

// Helpers to split the heterogeneous element list.
const nodes = (els: ReturnType<typeof getElements>) =>
  els.filter((e) => !("source" in (e.data as any)));
const edges = (els: ReturnType<typeof getElements>) =>
  els.filter((e) => "source" in (e.data as any));

describe("getElements characterization", () => {
  it("empty string returns []", () => {
    expect(getElements("")).toEqual([]);
  });

  it("whitespace-only string returns [] (no phantom nodes)", () => {
    expect(getElements("   \n  \n")).toEqual([]);
  });

  it("simple 3-level nesting produces 3 nodes + 2 edges with stable ids", () => {
    const els = getElements("A\n  B\n    C");
    const ns = nodes(els);
    const es = edges(els);

    expect(ns.map((n) => n.data.id)).toEqual(["n1", "n2", "n3"]);
    expect(es.map((e) => e.data.id)).toEqual(["n1-n2-1", "n2-n3-1"]);
    expect(es.map((e) => [e.data.source, e.data.target])).toEqual([
      ["n1", "n2"],
      ["n2", "n3"],
    ]);
    // node labels survive
    expect(ns.map((n) => n.data.label)).toEqual(["A", "B", "C"]);
  });

  it("nodes carry in_degree/out_degree matching their edges (A->B->C)", () => {
    const els = getElements("A\n  B\n    C");
    const byLabel = (label: string) =>
      nodes(els).find((n) => n.data.label === label)!.data as any;

    // root: no incoming, one outgoing
    expect(byLabel("A").in_degree).toBe(0);
    expect(byLabel("A").out_degree).toBe(1);
    // middle: one in, one out
    expect(byLabel("B").in_degree).toBe(1);
    expect(byLabel("B").out_degree).toBe(1);
    // leaf: one in, none out
    expect(byLabel("C").in_degree).toBe(1);
    expect(byLabel("C").out_degree).toBe(0);
  });

  it("self-loops are counted in BOTH in_degree and out_degree (and parallel self-loops inflate counts)", () => {
    // Two self-loops on A: "A #a" with two "(#a)" children.
    const els = getElements("A #a\n  (#a)\n  (#a)");
    const ns = nodes(els);
    const es = edges(els);

    // node A has id "a" (explicit id)
    expect(ns).toHaveLength(1);
    const a = ns[0].data as any;

    // two self-loop edges produced, distinct ids
    expect(es.map((e) => e.data.id)).toEqual(["a-a-1", "a-a-2"]);
    es.forEach((e) => {
      expect(e.data.source).toBe("a");
      expect(e.data.target).toBe("a");
    });

    // CHARACTERIZATION: each self-loop counts once toward in_degree and once
    // toward out_degree, and parallel duplicates are NOT de-duplicated.
    expect(a.in_degree).toBe(2);
    expect(a.out_degree).toBe(2);
  });

  it("parallel edges (A->B twice) inflate degree counts", () => {
    const els = getElements("A #a\nB #b\n(#a)\n  (#b)\n(#a)\n  (#b)");
    const es = edges(els);
    expect(es.map((e) => e.data.id)).toEqual(["a-b-1", "a-b-2"]);

    const byLabel = (label: string) =>
      nodes(els).find((n) => n.data.label === label)!.data as any;
    expect(byLabel("A").out_degree).toBe(2);
    expect(byLabel("A").in_degree).toBe(0);
    expect(byLabel("B").in_degree).toBe(2);
    expect(byLabel("B").out_degree).toBe(0);
  });

  it("classes are attached and parsed; parser emits a leading space; only the FIRST .class is kept", () => {
    const els = getElements("Hello .color_blue .shape_diamond");
    const n = nodes(els)[0];

    // CHARACTERIZATION: graph-selector 0.13.0 returns classes as a single string
    // with a LEADING SPACE, and in this multi-class form it keeps ONLY the first
    // class (".shape_diamond" is dropped). getElements does not normalize this.
    // This may be a parser quirk/bug but is the current behavior.
    expect(n.classes).toBe(" color_blue");
    // node still gets sizing/degree augmentation
    expect((n.data as any).in_degree).toBe(0);
    expect((n.data as any).out_degree).toBe(0);
    // jsdom: no #resizer -> label fallback
    expect((n.data as any).width).toBe("label");
    expect((n.data as any).height).toBe("label");
  });

  it("edge label is preserved (DSL 'goes to: B' yields edge label 'goes to')", () => {
    const els = getElements("A\n  goes to: B");
    const es = edges(els);
    expect(es).toHaveLength(1);
    expect(es[0].data.label).toBe("goes to");
    // child node label is the text after the colon
    expect(nodes(els).map((n) => n.data.label)).toEqual(["A", "B"]);
  });

  it("edges pass through getElements unchanged (returned by reference, no style/degree added)", () => {
    const els = getElements("A\n  B");
    const edge = edges(els)[0];
    // CHARACTERIZATION: edges are NOT augmented; they have no style/in_degree/out_degree
    expect(edge).not.toHaveProperty("style");
    expect(edge.data).not.toHaveProperty("in_degree");
    expect(edge.data).not.toHaveProperty("out_degree");
    expect(edge.data).not.toHaveProperty("width");
  });

  it("pointer/reference (#id) creates an edge to the referenced node, not a new node", () => {
    // "B" then "(#a)" nested under it -> edge from B to A. A is NOT duplicated.
    const els = getElements("A #a\nB\n  (#a)");
    const ns = nodes(els);
    const es = edges(els);

    expect(ns.map((n) => n.data.id)).toEqual(["a", "n2"]);
    expect(es).toHaveLength(1);
    expect([es[0].data.source, es[0].data.target]).toEqual(["n2", "a"]);
  });

  describe("[w]/[h] data attribute sizing (LANDMINE, backward-compat path)", () => {
    it("node with [w] and [h] uses attribute sizing and sets style['text-max-width']", () => {
      // NOTE: a SPACE before the bracket is required for attribute parsing.
      const els = getElements("Node [w=200] [h=50]");
      const n = nodes(els)[0] as any;

      expect(n.data.width).toBe(200);
      expect(n.data.height).toBe(50);
      // text-max-width is seeded from w
      expect(n.style["text-max-width"]).toBe(200);
      // raw attributes are retained on data
      expect(n.data.w).toBe(200);
      expect(n.data.h).toBe(50);
    });

    it("node with only [w] sets width + text-max-width, leaves height as 'label'", () => {
      const els = getElements("Node [w=200]");
      const n = nodes(els)[0] as any;

      expect(n.data.width).toBe(200);
      // h absent -> height stays the literal 'label' seed
      expect(n.data.height).toBe("label");
      expect(n.style["text-max-width"]).toBe(200);
    });

    it("'Node[w=200]' WITHOUT a space is treated as literal label text (no attribute parsing)", () => {
      const els = getElements("Node[w=200]");
      const n = nodes(els)[0] as any;

      // CHARACTERIZATION: no space => whole thing is the label, no w/h, label fallback sizing
      expect(n.data.label).toBe("Node[w=200]");
      expect(n.data).not.toHaveProperty("w");
      expect(n.data.width).toBe("label");
      expect(n.style).toEqual({});
    });
  });

  it("duplicate explicit node id throws a ParseError that propagates (not caught)", () => {
    // CHARACTERIZATION: getElements has no try/catch. The Graph.tsx error UI
    // depends on this throw-not-catch contract (it checks e.name === 'ParseError').
    let thrown: any;
    try {
      getElements("A #x\nB #x");
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeDefined();
    expect(thrown.name).toBe("ParseError");
  });

  describe("lenient inputs do NOT throw (best-effort parse, backward-compat)", () => {
    it("over-indent jump (0 -> 6 spaces) parses without error", () => {
      expect(() => getElements("A\n      B")).not.toThrow();
      const els = getElements("A\n      B");
      // over-indented child still attaches to nearest valid ancestor
      expect(edges(els)).toHaveLength(1);
      expect([edges(els)[0].data.source, edges(els)[0].data.target]).toEqual([
        "n1",
        "n2",
      ]);
    });

    it("dangling pointer to a non-existent node parses without error (no edge)", () => {
      expect(() => getElements("A\n(DoesNotExist)")).not.toThrow();
      const els = getElements("A\n(DoesNotExist)");
      expect(nodes(els)).toHaveLength(1);
      expect(edges(els)).toHaveLength(0);
    });

    it("unclosed bracket parses without error", () => {
      expect(() => getElements("A [")).not.toThrow();
      const els = getElements("A [");
      expect(nodes(els)).toHaveLength(1);
    });

    it("tab indentation parses without error and creates an edge", () => {
      expect(() => getElements("A\n\tB")).not.toThrow();
      const els = getElements("A\n\tB");
      expect(edges(els)).toHaveLength(1);
    });
  });

  describe("environment-dependent sizing via #resizer", () => {
    it("plain node falls back to width:'label'/height:'label' when no #resizer exists (jsdom default)", () => {
      const els = getElements("Hello");
      const n = nodes(els)[0] as any;
      expect(n.data.width).toBe("label");
      expect(n.data.height).toBe("label");
      // CHARACTERIZATION: no measured numeric sizes in jsdom
    });

    it("with a #resizer present, the measured-size branch is taken but THROWS in jsdom (Range.getClientRects unsupported)", () => {
      const resizer = document.createElement("div");
      resizer.id = "resizer";
      // getSize sets textContent, so resizer.firstChild exists -> it enters the
      // measured branch which calls range.getClientRects().
      document.body.appendChild(resizer);
      try {
        // CHARACTERIZATION: jsdom does not implement Range.getClientRects, so the
        // measured-size path throws here. In a real browser this branch returns
        // numeric width/height/shapeWidth/etc. We pin that the path is reached
        // (i.e. #resizer flips behavior away from the 'label' fallback) and that
        // it currently throws under jsdom rather than degrading gracefully.
        expect(() => getElements("Hello")).toThrow(/getClientRects/);
      } finally {
        document.body.removeChild(resizer);
      }
    });
  });

  it("output is accepted by a headless cytoscape instance (smoke check)", () => {
    const els = getElements("A\n  B\n    C");
    const cy = cytoscape({ headless: true, elements: els as any });
    expect(cy.nodes().length).toBe(3);
    expect(cy.edges().length).toBe(2);
    cy.destroy();
  });
});
