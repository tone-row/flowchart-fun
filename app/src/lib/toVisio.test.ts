import { parse } from "graph-selector";

import { toVisioFlowchart, toVisioOrgChart } from "./toVisio";

describe("toVisioFlowchart", () => {
  it("should return a string", async () => {
    const graph = parse(``);
    const csv = await toVisioFlowchart(graph);
    expect(typeof csv).toBe("string");
  });

  it("should include id and label", async () => {
    const graph = parse(`a\nb`);
    const csv = await toVisioFlowchart(graph);
    expect(csv).toBe(
      `"Process Step ID","Process Step Description","Next Step ID","Connector Label","Shape Type"\r\n"n1","a","","","Document"\r\n"n2","b","","","Document"`
    );
  });

  it("should include single edges", async () => {
    const graph = parse(`a\n\tb`);
    const csv = await toVisioFlowchart(graph);
    expect(csv).toBe(
      `"Process Step ID","Process Step Description","Next Step ID","Connector Label","Shape Type"\r\n"n1","a","n2","","Start"\r\n"n2","b","","","End"`
    );
  });

  it("should include single edge labels", async () => {
    const graph = parse(`a\n\tlabel: b`);
    const csv = await toVisioFlowchart(graph);
    expect(csv).toBe(
      `"Process Step ID","Process Step Description","Next Step ID","Connector Label","Shape Type"\r\n"n1","a","n2","label","Start"\r\n"n2","b","","","End"`
    );
  });

  it("should support multiple edges with labels", async () => {
    const graph = parse(`a\n\tto: b\n\talso to: c`);
    const csv = await toVisioFlowchart(graph);
    expect(csv)
      .toBe(`"Process Step ID","Process Step Description","Next Step ID","Connector Label","Shape Type"\r
"n1","a","n2,n3","to,also to","Start"\r
"n2","b","","","End"\r
"n3","c","","","End"`);
  });

  it.todo("should add all other data attributes");
  it.todo("should determine a shape for each node");
});

describe("toVisioOrgChart", () => {
  it("should return a string", async () => {
    const graph = parse(``);
    const csv = await toVisioOrgChart(graph);
    expect(typeof csv).toBe("string");
  });

  it("should include id and label", async () => {
    const graph = parse(`Larry\nCurly\nMoe`);
    const csv = await toVisioOrgChart(graph);
    expect(csv).toBe(`"Employee ID","Name","Title","Manager ID","Role Type"\r
"n1","Larry","","",""\r
"n2","Curly","","",""\r
"n3","Moe","","",""`);
  });

  it("Should include manager edges", async () => {
    const graph = parse(`Larry\n\tCurly\n\tMoe`);
    const csv = await toVisioOrgChart(graph);
    expect(csv).toBe(`"Employee ID","Name","Title","Manager ID","Role Type"\r
"n1","Larry","","",""\r
"n2","Curly","","n1",""\r
"n3","Moe","","n1",""`);
  });

  it("Should include multiple depths", async () => {
    const graph = parse(`Larry\n\tCurly\n\t\tMoe`);
    const csv = await toVisioOrgChart(graph);
    expect(csv).toBe(`"Employee ID","Name","Title","Manager ID","Role Type"\r
"n1","Larry","","",""\r
"n2","Curly","","n1",""\r
"n3","Moe","","n2",""`);
  });

  it("Should include title", async () => {
    const graph = parse(
      `Larry [title=Senior Partner]\n\tCurly [title=Senior Partner]\n\t\ttitle: Moe [title=Junior Partner]`
    );
    const csv = await toVisioOrgChart(graph);
    expect(csv).toBe(`"Employee ID","Name","Title","Manager ID","Role Type"\r
"n1","Larry","Senior Partner","",""\r
"n2","Curly","Senior Partner","n1",""\r
"n3","Moe","Junior Partner","n2",""`);
  });
});
