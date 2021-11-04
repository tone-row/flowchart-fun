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
        id: "1_2:0",
        label: "",
        lineNumber: 2,
        source: "1",
        target: "2",
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

  it("should generate & increment edge ids", () => {
    let result = parseText("a\n  b", getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.id).toEqual("1_2:0");
    result = parseText("a\n  b\n  (2)", getSize);
    const edges = result.filter(edgesOnly);
    expect(edges.length).toEqual(2);
    expect(edges).toContainEqual({
      data: { id: "1_2:1", label: "", lineNumber: 3, source: "1", target: "2" },
    });
  });

  /* Pointers */

  it("should create edge with line number", () => {
    const result = parseText("a\nb\n  (1)", getSize);
    expect(result).toContainEqual({
      data: { id: "2_1:0", label: "", lineNumber: 3, source: "2", target: "1" },
    });
  });

  it("should create edge with id", () => {
    const fakeId = `fake id`;
    const result = parseText(`[${fakeId}] a\nb\n  (${fakeId})`, getSize);
    expect(result).toContainEqual({
      data: {
        id: `2_${fakeId}:0`,
        label: "",
        lineNumber: 3,
        source: "2",
        target: `${fakeId}`,
      },
    });
  });

  it("should create edge with exact label", () => {
    const label = `exact label`;
    const result = parseText(`${label}\nb\n  (${label})`, getSize);
    expect(result).toContainEqual({
      data: {
        id: `2_${label}:0`,
        label: "",
        lineNumber: 3,
        source: "2",
        target: "1",
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
    expect(result.filter(edgesOnly)[0].data.id).toEqual(`1_${originalLabel}:0`);
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
});

function nodesOnly(el: cytoscape.ElementDefinition) {
  return !("target" in el.data);
}

function edgesOnly(el: cytoscape.ElementDefinition) {
  return "target" in el.data;
}
