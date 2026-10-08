import { parse } from "graph-selector";
import { templates } from "shared";

import { findMisclosedContainers } from "./findMisclosedContainers";

const lines = (text: string) =>
  findMisclosedContainers(text).map(({ lineNumber, kind }) => ({
    lineNumber,
    kind,
  }));

describe("findMisclosedContainers", () => {
  test("a container with no closing brace is flagged on its { line", () => {
    expect(lines("A {\n  B")).toEqual([
      { lineNumber: 1, kind: "never-closed" },
    ]);
  });

  test("a closed container is not flagged", () => {
    expect(lines("A {\n  B\n}")).toEqual([]);
  });

  test("a } pushed to the end of the doc swallows an outdented sibling", () => {
    const text = "Start\n  Build {\n    Compile\n  Test\n    Done\n  }";
    expect(lines(text)).toEqual([
      { lineNumber: 2, kind: "swallows-outdented-lines" },
    ]);
    const test = parse(text).nodes.find((n) => n.data.label === "Test");
    expect(test?.data.parent).toBe("n2");
  });

  test("the marker spans the { line's content", () => {
    expect(findMisclosedContainers("Start\n  Build {\n    Compile")).toEqual([
      {
        lineNumber: 2,
        startColumn: 3,
        endColumn: 10,
        kind: "never-closed",
      },
    ]);
  });

  test("nested containers: the inner } closes only the inner one", () => {
    expect(lines("Outer {\n  Inner {\n    X\n  Y\n}")).toEqual([
      { lineNumber: 1, kind: "never-closed" },
      { lineNumber: 2, kind: "swallows-outdented-lines" },
    ]);
  });

  test("well-formed nested containers are not flagged", () => {
    expect(
      lines("Outer {\n  Inner {\n    X\n  }\n  Y\n}\nZ\n  (Y)\n  (X)")
    ).toEqual([]);
  });

  test("lines indented under a } are edges from the container, not swallowed", () => {
    const text = [
      "Request",
      "  check: Lookup {",
      "    Extract",
      "      fail: (Request)",
      "    Decode",
      "  }",
      "    ok: Continue",
    ].join("\n");
    expect(lines(text)).toEqual([]);
  });

  test("a { inside a comment is not a container", () => {
    expect(lines("A // B {\n  C")).toEqual([]);
  });

  test("a URL on a container line still counts as a container", () => {
    expect(lines("Docs https://example.com {\n  Page")).toEqual([
      { lineNumber: 1, kind: "never-closed" },
    ]);
  });

  test.each(templates)(
    "the %s template's starter content is not flagged",
    (name) => {
      const { content } = require(`./templates/${name}-template`);
      expect(lines(content)).toEqual([]);
    }
  );
});
