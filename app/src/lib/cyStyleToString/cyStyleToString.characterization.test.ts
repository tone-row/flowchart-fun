import { cyStyleToString } from "./cyStyleToString";
import fixture from "./fixture.json";

// Characterization tests for cyStyleToString.
// These lock in the CURRENT serialization behavior (exact strings, ordering,
// merge semantics, and edge-case handling) ahead of a future framework
// migration. They assert ACTUAL output, not ideal output.

// Helper to build a minimally-typed Style declaration. The real input shape
// comes from cytoscape's cy.style().json(); only selector.inputText and
// properties[].name / .strValue are read by the module.
function decl(inputText: string, properties: any): any {
  return {
    selector: { inputText },
    properties,
    index: 0,
  };
}

describe("cyStyleToString characterization", () => {
  test("empty array input returns empty string", () => {
    expect(cyStyleToString([] as any)).toBe("");
  });

  test("single selector with single property formats as `sel { name: value; }`", () => {
    // Pins exact spacing: space inside braces, semicolon after value,
    // no trailing newline.
    const result = cyStyleToString([
      decl("node", [{ name: "color", strValue: "red" }]),
    ]);
    expect(result).toBe("node { color: red; }");
  });

  test("declaration with properties:null is skipped entirely", () => {
    const result = cyStyleToString([
      decl("node", null),
      decl("edge", [{ name: "width", strValue: "1px" }]),
    ]);
    // The null-properties declaration produces no block at all.
    expect(result).toBe("edge { width: 1px; }");
  });

  test("declaration with properties:undefined is skipped entirely", () => {
    const result = cyStyleToString([
      decl("node", undefined),
      decl("edge", [{ name: "width", strValue: "1px" }]),
    ]);
    expect(result).toBe("edge { width: 1px; }");
  });

  test("declaration with properties:[] (empty array) emits `sel {  }` and is NOT skipped", () => {
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // An empty array is truthy, so the guard `if (!properties) continue;`
    // does not skip it. It serializes to selector + space + "{ " + "" + " }",
    // i.e. two spaces between the braces.
    const result = cyStyleToString([decl("node", [])]);
    expect(result).toBe("node {  }");
  });

  test("duplicate selector merges differing properties in first-seen order at first occurrence position", () => {
    // The merged block stays at the FIRST occurrence's position, and property
    // order follows first-seen key insertion order across all merged decls.
    const result = cyStyleToString([
      decl("node", [{ name: "color", strValue: "red" }]),
      decl("edge", [{ name: "width", strValue: "1px" }]),
      decl("node", [{ name: "shape", strValue: "ellipse" }]),
    ]);
    expect(result).toBe(
      "node { color: red; shape: ellipse; }\nedge { width: 1px; }"
    );
  });

  test("duplicate selector with same property name: later declaration overrides earlier (last-write-wins)", () => {
    // The most migration-fragile path. Spread order means the later
    // declaration's value wins, but the key keeps its first-seen position.
    const result = cyStyleToString([
      decl("node", [{ name: "color", strValue: "red" }]),
      decl("node", [{ name: "color", strValue: "blue" }]),
    ]);
    expect(result).toBe("node { color: blue; }");
  });

  test("uses strValue and ignores value/pfValue/units/mapped/mappedProperties", () => {
    // Construct a declaration where value/pfValue differ from strValue, with a
    // populated mappedProperties array. Only strValue must survive.
    const result = cyStyleToString([
      {
        selector: { inputText: "node" },
        properties: [
          {
            name: "background-color",
            value: [238, 238, 238],
            strValue: "rgb(238,238,238)",
            pfValue: [238, 238, 238],
            units: null,
            mapped: { mapping: false, regex: "" },
          },
        ],
        mappedProperties: [
          { name: "label", strValue: "SHOULD_NOT_APPEAR", value: null },
        ],
        index: 0,
      } as any,
    ]);
    expect(result).toBe("node { background-color: rgb(238,238,238); }");
    expect(result).not.toContain("SHOULD_NOT_APPEAR");
    expect(result).not.toContain("238,238,238,238"); // value array not joined in
  });

  test("mapped/data() property passes through verbatim via strValue", () => {
    const result = cyStyleToString([
      decl("node", [
        { name: "label", strValue: "data(label)" },
        { name: "text-max-width", strValue: "data(width)" },
      ]),
    ]);
    expect(result).toBe(
      "node { label: data(label); text-max-width: data(width); }"
    );
  });

  test("multiple selectors preserve insertion order, joined by single newline with no trailing newline", () => {
    const result = cyStyleToString([
      decl("a", [{ name: "p1", strValue: "v1" }]),
      decl("b", [{ name: "p2", strValue: "v2" }]),
      decl("c", [{ name: "p3", strValue: "v3" }]),
    ]);
    expect(result).toBe("a { p1: v1; }\nb { p2: v2; }\nc { p3: v3; }");
    expect(result.endsWith("\n")).toBe(false);
    expect(result.split("\n")).toHaveLength(3);
  });

  test("multiple properties within one selector are joined by single space", () => {
    const result = cyStyleToString([
      decl("node", [
        { name: "color", strValue: "red" },
        { name: "shape", strValue: "ellipse" },
        { name: "width", strValue: "10px" },
      ]),
    ]);
    expect(result).toBe("node { color: red; shape: ellipse; width: 10px; }");
  });

  test("values are concatenated verbatim with no escaping", () => {
    // CHARACTERIZATION: documents current behavior, may be a bug.
    // No sanitization: a value containing a semicolon or brace is emitted
    // as-is, which would corrupt downstream CSS. Locks the no-escaping contract.
    const result = cyStyleToString([
      decl("node", [{ name: "content", strValue: "a; color: red } evil" }]),
    ]);
    expect(result).toBe("node { content: a; color: red } evil; }");
  });

  test("full fixture.json exact snapshot", () => {
    // Real-world end-to-end lock (84-entry cytoscape stylesheet). Mirrors the
    // existing inline-string test but as a snapshot baseline. Exercises the
    // duplicate-selector merge path (:parent, edge, node) and data() mappings.
    expect(cyStyleToString(fixture as any)).toMatchSnapshot();
  });
});
