import cytoscape from "cytoscape";
import { parseText } from "./utils";

describe("parseText", () => {
  it("should return an array of elements", () => {
    const result = parseText("");
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates one node per line", () => {
    const result = parseText("a\nb\nc");
    expect(result.length).toEqual(3);
  });

  it("should not create a node if a pointer is present", () => {
    const result = parseText("a\n  (a)");
    expect(result.filter(nodesOnly).length).toEqual(1);
  });

  it("should create an edge between indented nodes", () => {
    let result = parseText("a\n  (a)");
    expect(result.filter(edgesOnly).length).toEqual(1);

    result = parseText("a\n  b");
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
    const result = parseText(`${fakeLabel}     `);
    const node = result.filter(nodesOnly)[0];
    expect(node.data.label).toEqual(fakeLabel);
  });

  it("should parse edge labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`a\n  ${fakeLabel}: [a]`);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.label).toEqual(fakeLabel);
  });

  it("should trim edge labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`a\n  ${fakeLabel}    : [a]`);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.label).toEqual(fakeLabel);
  });

  it("should allow custom ids", () => {
    const fakeId = `test id`;
    const result = parseText(`[${fakeId}] a`);
    const node = result[0];
    expect(node.data.id).toEqual(fakeId);
  });

  it("should generate & increment edge ids", () => {
    let result = parseText("a\n  b");
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.id).toEqual("1_2:0");
    result = parseText("a\n  b\n  (2)");
    const edges = result.filter(edgesOnly);
    expect(edges.length).toEqual(2);
    expect(edges).toContainEqual({
      data: { id: "1_2:1", label: "", lineNumber: 3, source: "1", target: "2" },
    });
  });

  /* Pointers */

  it("should create edge with line number", () => {
    const result = parseText("a\nb\n  (1)");
    expect(result).toContainEqual({
      data: { id: "2_1:0", label: "", lineNumber: 3, source: "2", target: "1" },
    });
  });

  it("should create edge with id", () => {
    const fakeId = `fake id`;
    const result = parseText(`[${fakeId}] a\nb\n  (${fakeId})`);
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
    const result = parseText(`${label}\nb\n  (${label})`);
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
    const result = parseText("a\n\n\n\n\nb");
    expect(result.length).toEqual(2);
  });

  /* Comments */
  it("should strip comments", () => {
    let result = parseText("a\n/* long comment */b");
    expect(result).toHaveLength(2);

    result = parseText("a// inline comment");
    const node = result[0];
    expect(node.data.label).toBe("a");
  });

  it("should add correct line number to cy element", () => {
    const numReturns = Math.floor(Math.random() * 10);
    const result = parseText(
      `a\n/*multilinecomment${Array(numReturns).fill("\n").join("")}*/\nb`
    );
    const b = result[1];
    expect(b.data.lineNumber).toEqual(numReturns + 3);
  });
});

function nodesOnly(el: cytoscape.ElementDefinition) {
  return !("target" in el.data);
}

function edgesOnly(el: cytoscape.ElementDefinition) {
  return "target" in el.data;
}
