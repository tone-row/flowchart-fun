import cytoscape from "cytoscape";
import { parseText } from "./parseText";
import { encode } from "./utils";

const getSize = jest.fn(() => ({ width: 0, height: 0 }));

describe("parseText", () => {
  test("should return an array of elements", () => {
    const result = parseText("", getSize);
    expect(Array.isArray(result)).toBe(true);
  });

  test("creates default node ID", () => {
    const result = parseText("a", getSize);
    expect(result[0].data.id).toBe("N14e");
  });

  test("creates one node per line with label", () => {
    const result = parseText("a\nb\nc", getSize);
    expect(result.length).toEqual(3);
  });

  test("should not create a node if no nodeLabel is present", () => {
    const result = parseText("a\n  (a)", getSize);
    expect(result.filter(nodesOnly).length).toEqual(1);
  });

  test("should create an edge between indented nodes", () => {
    let result = parseText("a\n  b", getSize);
    expect(result.filter(edgesOnly).length).toEqual(1);
    expect(result).toContainEqual({
      data: {
        id: "N14e_N14f:0",
        label: "",
        lineNumber: 2,
        source: "N14e",
        target: "N14f",
      },
    });
  });

  test("should trim node labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`${fakeLabel}     `, getSize);
    const node = result.filter(nodesOnly)[0];
    expect(node.data.label).toEqual(fakeLabel);
  });

  test("should parse edge labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`a\n  ${fakeLabel}: [a]`, getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.label).toEqual(fakeLabel);
  });

  test("should trim edge labels", () => {
    const fakeLabel = `test label`;
    const result = parseText(`a\n  ${fakeLabel}    : [a]`, getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.label).toEqual(fakeLabel);
  });

  test("should allow custom ids", () => {
    const fakeId = `test-id`;
    let result = parseText(`[${fakeId}] a`, getSize);
    let node = result[0];
    expect(node.data.id).toEqual(fakeId);

    result = parseText(`[${fakeId}.djklksj] a`, getSize);
    node = result[0];
    expect(node.data.id).toEqual(fakeId);
  });

  test.todo("Things should be removed from label, customId, etc.");
  test.todo("Throws on multiple id blocks");

  test("should allow for more than one edge to between nodes", () => {
    let result = parseText("a\n  b", getSize);
    const edge = result.filter(edgesOnly)[0];
    expect(edge.data.id).toEqual("N14e_N14f:0");
    result = parseText("a\n  b\n  (2)", getSize);
    const edges = result.filter(edgesOnly);
    expect(edges.length).toEqual(2);
    expect(edges).toContainEqual({
      data: {
        id: "N14e_2:1",
        label: "",
        lineNumber: 3,
        source: "N14e",
        target: "N14f",
      },
    });
  });

  /* Pointers */

  test("should create edge with line number", () => {
    const result = parseText("a\nb\n  (1)", getSize);
    expect(result).toContainEqual({
      data: {
        id: "N14f_1:0",
        label: "",
        lineNumber: 3,
        source: "N14f",
        target: "N14e",
      },
    });
  });

  test("should create edge with id", () => {
    const fakeId = `fake id`;
    const result = parseText(`[${fakeId}] a\nb\n  (${fakeId})`, getSize);
    expect(result).toContainEqual({
      data: {
        id: `N14f_${fakeId}:0`,
        label: "",
        lineNumber: 3,
        source: "N14f",
        target: `${fakeId}`,
      },
    });
  });

  test("should create edge with exact label", () => {
    const label = `exact label`;
    const result = parseText(`${label}\nb\n  (${label})`, getSize);
    expect(result).toContainEqual({
      data: {
        id: `N14f_${label}:0`,
        label: "",
        lineNumber: 3,
        source: "N14f",
        target: "N14e",
      },
    });
  });

  test("should ignore empty lines", () => {
    const result = parseText("a\n\n\n\n\nb", getSize);
    expect(result.length).toEqual(2);
  });

  test("should add an edge to labels that need to be decoded", () => {
    const originalLabel = `my
    fun
    multiline
    label!(*)$(@*#$)`;
    const nodeLabel = encode(originalLabel);
    const text = `${nodeLabel}\n  good times: (${nodeLabel})`;
    const result = parseText(text, getSize);
    // This used to use unencoded labels and I don't know why.
    expect(result.filter(edgesOnly)[0].data.id).toEqual(`N14e_${nodeLabel}:0`);
  });

  test("should only link-by-label to nodes, not edges", () => {
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

  test("pointers should grab explicit ID first, then label, then line number", () => {
    // and the first line has a label 1, second line has id 1
    let testText = `1\n[1] b\nc\n\t(1)`;
    let result = parseText(testText, getSize);
    let edges = result.filter(edgesOnly);
    let firstEdge = edges[0].data;
    let nodes = result.filter(nodesOnly);
    expect(firstEdge.source).toEqual("N150");
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
        id: "N150_1:0",
        label: "",
        lineNumber: 4,
        source: "N150",
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
        id: "N150_1:0",
        label: "",
        lineNumber: 4,
        source: "N150",
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

  test("should error labeled edges with no indent", () => {
    const label = `A\ntest: B`;
    expect(() => parseText(label, getSize)).toThrow(
      'Edge Label without Parent: "test"'
    );
  });

  test("should parse classes for nodes", () => {
    const label = `[.one.two.three] a`;
    const result = parseText(label, getSize);
    expect(result).toEqual([
      {
        classes: "one two three",
        data: { id: "N14e", label: "a", lineNumber: 1 },
      },
    ]);
  });

  test("id or class only should create node", () => {
    const label = `[someId]`;
    const result = parseText(label, getSize);
    expect(result).toContainEqual({
      classes: "",
      data: { id: "someId", label: "", lineNumber: 1 },
    });
  });

  test("Should throw if ID used more than once", () => {
    const getResult = () => parseText(`[hello] hi\n[hello] hi`, getSize);
    expect(getResult).toThrow();
  });

  test("Should throw an error if edge label with no parent", () => {
    const getResult = () =>
      parseText(
        `  [test] hi: (uh oh, this is the right higlighting but)`,
        getSize
      );
    expect(getResult).toThrow();
  });

  test("Should throw an error for pointer with no indent", () => {
    const getResult = () => parseText(`(fun)`, getSize);
    expect(getResult).toThrow();
  });

  test.skip("Should throw an error on line with linked id", () => {
    const getResult = () => parseText(`a\n\tb\n\t[bye] for each: (b)`, getSize);
    expect(getResult).toThrow();
  });

  test("Should work with multiple pointers", () => {
    const result = parseText(`a\nb\n goes to: (a) (b)`, getSize);
    expect(result).toContainEqual({
      data: {
        id: "N14f_a:0",
        label: "goes to",
        lineNumber: 3,
        source: "N14f",
        target: "N14e",
      },
    });
    expect(result).toContainEqual({
      data: {
        id: "N14f_b:1",
        label: "goes to",
        lineNumber: 3,
        source: "N14f",
        target: "N14f",
      },
    });
  });

  test("should throw an error if pointer with no leadingSpace", () => {
    const getResult = () => parseText(`fun\n(fun)`, getSize);
    expect(getResult).toThrow();
  });

  test("should work with chinese colon and parentheses", () => {
    const result = parseText(`中文\n to：（中文）`, getSize);
    expect(result).toEqual([
      { classes: "", data: { id: "N14e", label: "中文", lineNumber: 1 } },
      {
        data: {
          id: "N14e_中文:0",
          label: "to",
          lineNumber: 2,
          source: "N14e",
          target: "N14e",
        },
      },
    ]);
  });

  test("line number should account for yaml length, passed in", () => {
    const edges = parseText(`a\n\t(5)`, getSize, 4).filter(edgesOnly);
    expect(edges).toContainEqual({
      data: {
        id: "N14e_5:0",
        label: "",
        lineNumber: 6,
        source: "N14e",
        target: "N14e",
      },
    });
  });

  test("should produce the same ID's regardless of line number start'", () => {
    const resultA = parseText(`a\nb`, getSize, 0);
    const idsA = resultA.map((n) => n.data.id);
    const resultB = parseText(`a\nb`, getSize, 1);
    const idsB = resultB.map((n) => n.data.id);
    expect(idsA).toEqual(idsB);
  });
});

function nodesOnly(el: cytoscape.ElementDefinition) {
  return !("target" in el.data);
}

function edgesOnly(el: cytoscape.ElementDefinition) {
  return "target" in el.data;
}
