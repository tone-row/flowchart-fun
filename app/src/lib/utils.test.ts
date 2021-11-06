import cytoscape from "cytoscape";
import { parseText } from "./utils";

const getSize = jest.fn();

describe("parseText", () => {
  it("should return an array of elements", () => {
    const result = parseText("", getSize);
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates one node per line", () => {
    const result = parseText("a\nb\nc", getSize);
    expect(result.length).toEqual(3);
  });

  it("should not create a node if a pointer is present", () => {
    const result = parseText("a\n  (a)", getSize);
    expect(result.filter(nodesOnly).length).toEqual(1);
  });

  it("should create an edge between indented nodes", () => {
    let result = parseText("a\n  (a)", getSize);
    expect(result.filter(edgesOnly).length).toEqual(1);

    result = parseText("a\n  b", getSize);
    expect(result.filter(edgesOnly).length).toEqual(1);
    expect(result).toContainEqual({
      data: {
        id: "14e_14f:0",
        label: "",
        lineNumber: 2,
        source: "14e",
        target: "14f",
      },
    });
  });

  it("should trim node labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`${fakeLabel}     `, getSize);
    const node = result.filter(nodesOnly)[0];
    expect(node.data.label).toEqual(fakeLabel);
  });

  it("should parse edge labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`a\n  ${fakeLabel}: [a]`, getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.label).toEqual(fakeLabel);
  });

  it("should trim edge labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`a\n  ${fakeLabel}    : [a]`, getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.label).toEqual(fakeLabel);
  });

  it("should allow custom ids", () => {
    const fakeId = `test id`;
    const result = parseText(`[${fakeId}] a`, getSize);
    const node = result[0];
    expect(node.data.id).toEqual(fakeId);
  });

  it("should generate & increment (slightly encoded) edge ids", () => {
    let result = parseText("a\n  b", getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.id).toEqual("14e_14f:0");
    result = parseText("a\n  b\n  (2)", getSize);
    const edges = result.filter(edgesOnly);
    expect(edges.length).toEqual(2);
    expect(edges).toContainEqual({
      data: {
        id: "14e_2:0",
        label: "",
        lineNumber: 3,
        source: "14e",
        target: "14e_14f:0",
      },
    });
  });

  /* Pointers */

  it("should create edge with line number", () => {
    const result = parseText("a\nb\n  (1)", getSize);
    expect(result).toContainEqual({
      data: {
        id: "14f_1:0",
        label: "",
        lineNumber: 3,
        source: "14f",
        target: "14e",
      },
    });
  });

  it("should create edge with id", () => {
    const fakeId = `fake id`;
    const result = parseText(`[${fakeId}] a\nb\n  (${fakeId})`, getSize);
    expect(result).toContainEqual({
      data: {
        id: `14f_${fakeId}:0`,
        label: "",
        lineNumber: 3,
        source: "14f",
        target: `${fakeId}`,
      },
    });
  });

  it("should create edge with exact label", () => {
    const label = `exact label`;
    const result = parseText(`${label}\nb\n  (${label})`, getSize);
    expect(result).toContainEqual({
      data: {
        id: `14f_${label}:0`,
        label: "",
        lineNumber: 3,
        source: "14f",
        target: "14e",
      },
    });
  });

  it("should ignore empty lines", () => {
    const result = parseText("a\n\n\n\n\nb", getSize);
    expect(result.length).toEqual(2);
  });

  it("should add an edge to labels that need to be decoded", () => {
    const originalLabel = `my
    fun
    multiline
    label!(*)$(@*#$)`;
    const label = encodeURIComponent(originalLabel);
    const text = `${label}\n  good times: (${label})`;
    const result = parseText(text, getSize);
    expect(result.filter(edgesOnly)[0].data.id).toEqual(
      `14e_${originalLabel}:0`
    );
  });

  it("should only link-by-label to nodes, not edges", () => {
    const label = `A
    test: B
      (test)
    test`;
    const result = parseText(label, getSize);
    const edges = result.filter(edgesOnly);
    const targets = edges.map((e) => e.data.target);
    // Including an underscore means that it points to an edge
    expect(targets.some((target) => target.includes("_"))).toBe(false);
  });

  it("pointers should grab explicit ID first, then label, then line number", () => {
    // and the first line has a label 1, second line has id 1
    let testText = `1\n[1] b\nc\n\t(1)`;
    let result = parseText(testText, getSize);
    let edges = result.filter(edgesOnly);
    let firstEdge = edges[0].data;
    let nodes = result.filter(nodesOnly);
    expect(firstEdge.source).toEqual("150");
    expect(firstEdge.target).toEqual("1");
    expect(nodes.length).toEqual(3);
    // make sure all nodes have unique ids
    let ids = nodes.map((n) => n.data.id);
    expect(
      ids.every((id) => ids.filter((_id) => _id === id).length === 1)
    ).toBe(true);
    // C should link to B even though it's the second line
    expect(edges).toContainEqual({
      data: {
        id: "150_1:0",
        label: "",
        lineNumber: 4,
        source: "150",
        target: "1",
      },
    });

    // prefer label over line number
    // works even with explict id on target node
    testText = `line 1\n[test] 1\nc\n\t(1)`;
    result = parseText(testText, getSize);
    edges = result.filter(edgesOnly);
    expect(edges).toContainEqual({
      data: {
        id: "150_1:0",
        label: "",
        lineNumber: 4,
        source: "150",
        target: "test",
      },
    });

    // uses line number if nothing else
    testText = `line 1\n[to] x\n[from] c\n\t(2)`;
    result = parseText(testText, getSize);
    edges = result.filter(edgesOnly);
    expect(edges).toContainEqual({
      data: {
        id: "from_2:0",
        label: "",
        lineNumber: 4,
        source: "from",
        target: "to",
      },
    });
  });
});

function nodesOnly(el: cytoscape.ElementDefinition) {
  return !("target" in el.data);
}

function edgesOnly(el: cytoscape.ElementDefinition) {
  return "target" in el.data;
}
