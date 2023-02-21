import { toMermaidJS } from "./mermaid";

describe("toMermaidJS", () => {
  test("should return empty string from empty string", () => {
    expect(toMermaidJS({ layout: {}, elements: [] })).toBe("");
  });

  test("renders one object correctly", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [
          {
            classes: "",
            data: {
              id: "N14e",
              label: "one node",
              lineNumber: 1,
              width: 50,
              height: 50,
            },
          },
        ],
      })
    ).toEqual('flowchart\n\tN14e["one node"]');
  });

  test("renders edges", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [
          {
            classes: "",
            data: {
              id: "N14e",
              label: "a",
              lineNumber: 1,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N14e_N14f:0",
              source: "N14e",
              target: "N14f",
              label: "",
              lineNumber: 2,
            },
          },
          {
            classes: "",
            data: {
              id: "N14f",
              label: "b",
              lineNumber: 2,
              width: 50,
              height: 50,
            },
          },
        ],
      })
    ).toEqual('flowchart\n\tN14e["a"]\n\tN14f["b"]\n\tN14e --> N14f');
  });

  test("renders edge labels", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [
          {
            classes: "",
            data: {
              id: "N14e",
              label: "a",
              lineNumber: 1,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N14e_N14f:0",
              source: "N14e",
              target: "N14f",
              label: "to",
              lineNumber: 2,
            },
          },
          {
            classes: "",
            data: {
              id: "N14f",
              label: "b",
              lineNumber: 2,
              width: 50,
              height: 50,
            },
          },
        ],
      })
    ).toEqual('flowchart\n\tN14e["a"]\n\tN14f["b"]\n\tN14e -- "to" --> N14f');
  });

  test("renders empty shapes correctly", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [{ data: { id: "N14e", label: "" } }],
      })
    ).toEqual('flowchart\n\tN14e[" "]');
  });

  test("renders flowchart direction", () => {
    expect(
      toMermaidJS({
        layout: {
          rankDir: "RL",
        },
        elements: [
          {
            classes: "",
            data: {
              id: "N14e",
              label: "a",
              lineNumber: 5,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N14e_N14f:0",
              source: "N14e",
              target: "N14f",
              label: "",
              lineNumber: 6,
            },
          },
          {
            classes: "",
            data: {
              id: "N14f",
              label: "b",
              lineNumber: 6,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N14e_N150:0",
              source: "N14e",
              target: "N150",
              label: "",
              lineNumber: 7,
            },
          },
          {
            classes: "",
            data: {
              id: "N150",
              label: "c",
              lineNumber: 7,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N150_N151:0",
              source: "N150",
              target: "N151",
              label: "",
              lineNumber: 8,
            },
          },
          {
            classes: "",
            data: {
              id: "N151",
              label: "d",
              lineNumber: 8,
              width: 50,
              height: 50,
            },
          },
        ],
      })
    ).toEqual(
      'flowchart RL\n\tN14e["a"]\n\tN14f["b"]\n\tN150["c"]\n\tN151["d"]\n\tN14e --> N14f\n\tN14e --> N150\n\tN150 --> N151'
    );
  });

  test("supports some shapes", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [
          {
            classes: "ellipse",
            data: {
              id: "N14e",
              label: "a",
              lineNumber: 1,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N14e_N14f:0",
              source: "N14e",
              target: "N14f",
              label: "",
              lineNumber: 2,
            },
          },
          {
            classes: "circle",
            data: {
              id: "N14f",
              label: "b",
              lineNumber: 2,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N14e_N150:0",
              source: "N14e",
              target: "N150",
              label: "",
              lineNumber: 3,
            },
          },
          {
            classes: "diamond",
            data: {
              id: "N150",
              label: "c",
              lineNumber: 3,
              width: 50,
              height: 50,
            },
          },
          {
            data: {
              id: "N150_N151:0",
              source: "N150",
              target: "N151",
              label: "",
              lineNumber: 4,
            },
          },
          {
            classes: "hexagon",
            data: {
              id: "N151",
              label: "d",
              lineNumber: 4,
              width: 50,
              height: 50,
            },
          },
        ],
      })
    ).toEqual(
      'flowchart\n\tN14e(["a"])\n\tN14f(("b"))\n\tN150{"c"}\n\tN151{{"d"}}\n\tN14e --> N14f\n\tN14e --> N150\n\tN150 --> N151'
    );
  });

  test("Fixes ID's with spaces", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [
          {
            classes: "",
            data: {
              id: "Id With Spaces",
              label: "a",
            },
          },
        ],
      })
    ).toEqual('flowchart\n\tId_With_Spaces["a"]');
  });

  test("Escapes characters in labels", () => {
    expect(
      toMermaidJS({
        layout: {},
        elements: [
          {
            classes: "",
            data: {
              id: "N14e",
              label: 'has a "quote"',
              lineNumber: 1,
              width: 50,
              height: 50,
            },
          },
        ],
      })
    ).toEqual('flowchart\n\tN14e["has a &quot;quote&quot;"]');
  });
});
