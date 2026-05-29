import { parse, Graph } from "graph-selector";

import { toVisioFlowchart, toVisioOrgChart } from "./toVisio";

// CHARACTERIZATION TESTS — these lock in the CURRENT behavior of toVisio.ts
// before a future framework migration. They are a safety net, not a correctness
// audit. Where behavior looks like a bug it is preserved here and flagged with a
// // CHARACTERIZATION comment, not fixed.

const HEADER_FLOWCHART = `"Process Step ID","Process Step Description","Next Step ID","Connector Label","Shape Type"`;
const HEADER_ORGCHART = `"Employee ID","Name","Title","Manager ID","Role Type"`;

describe("toVisioFlowchart — characterization", () => {
  it("empty graph returns an empty string (NOT header-only)", async () => {
    const graph = parse(``);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: papaparse.unparse([]) with header:true yields "" — there
    // are no rows so no header is emitted either. Surprising: an empty input
    // produces a completely empty file, not a header row.
    expect(csv).toBe("");
  });

  it("isolated node (zero edges) is Document, not Process", async () => {
    const graph = parse(`a`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: a node with no edges in OR out => "Document"
    expect(csv).toBe(`${HEADER_FLOWCHART}\r\n"n1","a","","","Document"`);
  });

  it("middle node of a 3-node chain (1 in, 1 out) is Process", async () => {
    const graph = parse(`a\n\tb\n\t\tc`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: n2 has 1 incoming + 1 outgoing => "Process" (the else fall-through)
    expect(csv).toBe(
      `${HEADER_FLOWCHART}\r\n"n1","a","n2","","Start"\r\n"n2","b","n3","","Process"\r\n"n3","c","","","End"`
    );
  });

  it("top-level node with >1 outgoing is Start (NOT Decision) — Start check wins", async () => {
    const graph = parse(`a\n\tb\n\tc`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: n1 has 0 incoming + 2 outgoing. The if/else cascade checks
    // "no incoming => Start" BEFORE ">1 outgoing => Decision", so a root fan-out
    // node is "Start", not "Decision". Two empty labels join to a single comma.
    expect(csv).toBe(
      `${HEADER_FLOWCHART}\r\n"n1","a","n2,n3",",","Start"\r\n"n2","b","","","End"\r\n"n3","c","","","End"`
    );
  });

  it("node with incoming AND >1 outgoing is Decision", async () => {
    // a -> b ; b -> c ; b -> d  =>  b has 1 incoming + 2 outgoing => Decision
    const graph = parse(`a\n\tb: b\n\t\tc\n\t\td`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: Decision only fires when a node also has incoming edges.
    expect(csv).toContain(`,"Decision"`);
    expect(csv).toMatchSnapshot();
  });

  it("edge label containing a comma is joined with literal commas (ambiguous on re-parse)", async () => {
    const graph = parse(`a\n\thello, world: b`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: a label containing ", " is indistinguishable from the
    // multi-edge comma separator when Visio re-parses. Locked as-is.
    expect(csv).toBe(
      `${HEADER_FLOWCHART}\r\n"n1","a","n2","hello, world","Start"\r\n"n2","b","","","End"`
    );
  });

  it("node label with comma and double quote is papaparse-escaped (quotes doubled)", async () => {
    const graph = parse(`he said "hi", ok`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: papaparse doubles internal double-quotes (" => "") and
    // wraps the whole field in quotes so the comma does not split the column.
    expect(csv).toBe(
      `${HEADER_FLOWCHART}\r\n"n1","he said ""hi"", ok","","","Document"`
    );
  });

  it("multiple outgoing edges where one label is empty", async () => {
    // first edge unlabeled, second edge labeled
    const graph = parse(`a\n\tb\n\tlbl: c`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: Connector Label accumulates ",<empty>,lbl" then slice(1)
    // yields ",lbl" — the leading empty label leaves an embedded leading comma.
    // (n1 is "Start" here, not "Decision", because it has no incoming edges.)
    expect(csv).toBe(
      `${HEADER_FLOWCHART}\r\n"n1","a","n2,n3",",lbl","Start"\r\n"n2","b","","","End"\r\n"n3","c","","","End"`
    );
  });

  it("single edge: source is Start, target is End", async () => {
    const graph = parse(`a\n\tb`);
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: 0-in/1-out => Start; 1-in/0-out => End
    expect(csv).toBe(
      `${HEADER_FLOWCHART}\r\n"n1","a","n2","","Start"\r\n"n2","b","","","End"`
    );
  });

  it("node with 1 outgoing but multiple incoming is Process (not Decision/End)", async () => {
    // a -> c, b -> c, c -> d. c (n3) has 2 incoming + 1 outgoing.
    const graph: Graph = {
      nodes: [
        { data: { id: "n1", label: "a", classes: "" } },
        { data: { id: "n2", label: "b", classes: "" } },
        { data: { id: "n3", label: "c", classes: "" } },
        { data: { id: "n4", label: "d", classes: "" } },
      ],
      edges: [
        {
          source: "n1",
          target: "n3",
          data: { id: "e1", label: "", classes: "" },
        },
        {
          source: "n2",
          target: "n3",
          data: { id: "e2", label: "", classes: "" },
        },
        {
          source: "n3",
          target: "n4",
          data: { id: "e3", label: "", classes: "" },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: n3 has >1 incoming + exactly 1 outgoing => falls through
    // to "Process" (not Decision, not End). Locks the else fall-through.
    expect(csv).toContain(`"n3","c","n4","","Process"`);
    expect(csv).toMatchSnapshot();
  });

  it("Subprocess branch never fires for normally-parsed docs (no data.parent)", async () => {
    const graph = parse(`a\n\tb\n\t\tc`);
    // CHARACTERIZATION: graph-selector does not set data.parent; Subprocess is dead.
    const anyParent = graph.nodes.some(
      (n) => (n.data as Record<string, unknown>).parent != null
    );
    expect(anyParent).toBe(false);
    const csv = await toVisioFlowchart(graph);
    expect(csv).not.toContain("Subprocess");
  });

  it("hand-built graph with data.parent DOES produce Subprocess (dead-branch coverage)", async () => {
    // Manually construct a graph where a node has 1-in/1-out AND data.parent set.
    const graph: Graph = {
      nodes: [
        { data: { id: "n1", label: "a", classes: "" } },
        { data: { id: "n2", label: "b", classes: "", parent: "grp" } },
        { data: { id: "n3", label: "c", classes: "" } },
      ],
      edges: [
        {
          source: "n1",
          target: "n2",
          data: { id: "e1", label: "", classes: "" },
        },
        {
          source: "n2",
          target: "n3",
          data: { id: "e2", label: "", classes: "" },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const csv = await toVisioFlowchart(graph);
    // CHARACTERIZATION: with data.parent + 1-in/1-out, the otherwise-dead branch fires => Subprocess
    expect(csv).toContain(`"n2","b","n3","","Subprocess"`);
  });
});

describe("toVisioOrgChart — characterization", () => {
  it("empty graph returns an empty string (NOT header-only)", async () => {
    const graph = parse(``);
    const csv = await toVisioOrgChart(graph);
    // CHARACTERIZATION: like the flowchart, empty input => "" (no header row).
    expect(csv).toBe("");
  });

  it("flat list has empty Manager ID for all", async () => {
    const graph = parse(`Larry\nCurly\nMoe`);
    const csv = await toVisioOrgChart(graph);
    expect(csv).toBe(
      `${HEADER_ORGCHART}\r\n"n1","Larry","","",""\r\n"n2","Curly","","",""\r\n"n3","Moe","","",""`
    );
  });

  it("roleType camelCase attribute populates Role Type column", async () => {
    const graph = parse(`Larry [roleType=Boss]`);
    const csv = await toVisioOrgChart(graph);
    // CHARACTERIZATION: node.data.roleType falls back into the "Role Type" column
    expect(csv).toBe(`${HEADER_ORGCHART}\r\n"n1","Larry","","","Boss"`);
  });

  it("Title (capitalized) wins over title (lowercase) when both present", async () => {
    // Hand-build node data with both keys to test precedence deterministically.
    const graph: Graph = {
      nodes: [
        {
          data: {
            id: "n1",
            label: "Larry",
            classes: "",
            Title: "BigTitle",
            title: "smallTitle",
          },
        },
      ],
      edges: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const csv = await toVisioOrgChart(graph);
    // CHARACTERIZATION: bracket-spelled "Title" wins over camelCase "title"
    expect(csv).toBe(`${HEADER_ORGCHART}\r\n"n1","Larry","BigTitle","",""`);
  });

  it("Role Type (spaced) wins over roleType (camelCase) when both present", async () => {
    const graph: Graph = {
      nodes: [
        {
          data: {
            id: "n1",
            label: "Larry",
            classes: "",
            ["Role Type"]: "Spaced",
            roleType: "camel",
          },
        },
      ],
      edges: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const csv = await toVisioOrgChart(graph);
    // CHARACTERIZATION: "Role Type" wins over roleType
    expect(csv).toBe(`${HEADER_ORGCHART}\r\n"n1","Larry","","","Spaced"`);
  });

  it("node with two incoming edges keeps the LAST source as Manager ID", async () => {
    const graph: Graph = {
      nodes: [
        { data: { id: "n1", label: "A", classes: "" } },
        { data: { id: "n2", label: "B", classes: "" } },
        { data: { id: "n3", label: "C", classes: "" } },
      ],
      edges: [
        {
          source: "n1",
          target: "n3",
          data: { id: "e1", label: "", classes: "" },
        },
        {
          source: "n2",
          target: "n3",
          data: { id: "e2", label: "", classes: "" },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
    const csv = await toVisioOrgChart(graph);
    // CHARACTERIZATION: last-write-wins — n3's Manager ID is n2 (the last edge),
    // silently dropping n1. Multi-manager input loses data.
    expect(csv).toBe(
      `${HEADER_ORGCHART}\r\n"n1","A","","",""\r\n"n2","B","","",""\r\n"n3","C","","n2",""`
    );
  });

  it("special chars in Name (comma + double quote) are papaparse-escaped", async () => {
    const graph = parse(`Smith, "Bob"`);
    const csv = await toVisioOrgChart(graph);
    // CHARACTERIZATION: quote-doubling + comma contained inside quoted field
    expect(csv).toBe(`${HEADER_ORGCHART}\r\n"n1","Smith, ""Bob""","","",""`);
  });

  it("manager chain over multiple depths", async () => {
    const graph = parse(`Larry\n\tCurly\n\t\tMoe`);
    const csv = await toVisioOrgChart(graph);
    expect(csv).toBe(
      `${HEADER_ORGCHART}\r\n"n1","Larry","","",""\r\n"n2","Curly","","n1",""\r\n"n3","Moe","","n2",""`
    );
  });
});
