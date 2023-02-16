import { parseFlowchart } from "./_parseFlowchart";

describe("parseFlowchart", () => {
  test("it should return a Graph object", () => {
    const result = parseFlowchart("Sun {heats} Ocean");
    expect(result.nodes.length).toEqual(2);
    expect(result.edges.length).toEqual(1);
    expect(result.nodes[0].data.label).toEqual("Sun");
    expect(result.nodes[1].data.label).toEqual("Ocean");
    expect(result.edges[0].data.label).toEqual("heats");
  });
});