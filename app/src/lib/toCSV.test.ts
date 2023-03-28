import { parse } from "graph-selector";

import { toCSV } from "./toCSV";

describe("toCSV", () => {
  it("should return a string", async () => {
    const graph = parse(``);
    const csv = await toCSV(graph);
    expect(typeof csv).toBe("string");
  });

  it("should include id and label", async () => {
    const graph = parse(`a\nb`);
    const csv = await toCSV(graph);
    expect(csv).toBe(
      `"Process Step ID","Process Step Description","Next Step ID","Connector Label"\n"n1","a","",""\n"n2","b","",""`
    );
  });

  it("should include single edges", async () => {
    const graph = parse(`a\n\tb`);
    const csv = await toCSV(graph);
    expect(csv).toBe(
      `"Process Step ID","Process Step Description","Next Step ID","Connector Label"\n"n1","a","n2",""\n"n2","b","",""`
    );
  });

  it("should include single edge labels", async () => {
    const graph = parse(`a\n\tlabel: b`);
    const csv = await toCSV(graph);
    expect(csv).toBe(
      `"Process Step ID","Process Step Description","Next Step ID","Connector Label"\n"n1","a","n2","label"\n"n2","b","",""`
    );
  });

  it("should support multiple edges with labels", async () => {
    const graph = parse(`a\n\tto: b\n\talso to: c`);
    const csv = await toCSV(graph);
    expect(csv)
      .toBe(`"Process Step ID","Process Step Description","Next Step ID","Connector Label"
"n1","a","n2,n3","to,also to"
"n2","b","",""
"n3","c","",""`);
  });

  it.todo("should add all other data attributes");
  it.todo("should determine a shape for each node");
});
