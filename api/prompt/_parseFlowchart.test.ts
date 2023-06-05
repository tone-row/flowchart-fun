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

  test("It should remove extra spaces around labels", () => {
    const result = parseFlowchart(`People {hear about} Application
People {research} Application
People {try} Application
Application {satisfies} People 
People {use} Application`);
    expect(result.nodes.length).toEqual(2);
  });

  test("If label contains any non-standard characters, it should give it a custom id", () => {
    const result = parseFlowchart(`A {} !!!b!!!
!!!b!!! {👍} (This is C!)`);
    expect(result.nodes.length).toEqual(3);
    expect(result.edges.length).toEqual(2);
    expect(result.nodes[0].data.label).toEqual("A");
    expect(result.nodes[1].data.label).toEqual("!!!b!!!");
    expect(result.nodes[2].data.label).toEqual("(This is C!)");
    expect(result.nodes[1].data.id).toEqual("a");
    expect(result.nodes[2].data.id).toEqual("b");
    expect(result.edges[0].source).toEqual("A");
    expect(result.edges[0].target).toEqual("#a");
    expect(result.edges[1].source).toEqual("#a");
    expect(result.edges[1].target).toEqual("#b");
  });
});
