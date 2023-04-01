import { mapDataToGraph } from "./_mapDataToGraph";
import simpleLucidChart from "./fixtures/simpleLucidChart.json";

// edge in source node row
const simpleVisioFake = [
  {
    id: "1",
    label: "a",
    nextStepId: "2",
    connectorLabel: "",
    shapeType: "Document",
  },
  {
    id: "2",
    label: "b",
    nextStepId: "",
    connectorLabel: "",
    shapeType: "Document",
  },
];

// edge in target node row
const simpleVisioFake2 = [
  {
    id: "1",
    label: "CEO",
    manager: "",
    connectorLabel: "",
  },
  {
    id: "2",
    label: "VP of Sales",
    manager: "1",
    connectorLabel: "",
  },
  {
    id: "3",
    label: "VP of Marketing",
    manager: "1",
    connectorLabel: "",
  },
];

describe("mapDataToGraph", () => {
  test("returns a graph object when edge in source node", () => {
    const graph = mapDataToGraph(simpleVisioFake, {
      idColumn: "id",
      nodeLabelColumn: "label",
      edgesDeclared: true,
      inSourceNodeRow: {
        targetColumn: "nextStepId",
        targetDelimiter: ",",
        edgeLabelColumn: "connectorLabel",
      },
    });

    expect(graph).toEqual({
      nodes: [
        {
          data: {
            id: "1",
            classes: "",
            label: "a",
          },
        },
        {
          data: {
            id: "2",
            classes: "",
            label: "b",
          },
        },
      ],
      edges: [
        {
          source: "1",
          target: "2",
          data: {
            id: "",
            classes: "",
            label: "",
          },
        },
      ],
    });
  });

  test("returns a graph object when edge in target node", () => {
    const graph = mapDataToGraph(simpleVisioFake2, {
      idColumn: "id",
      nodeLabelColumn: "label",
      edgesDeclared: true,
      inTargetNodeRow: {
        sourceColumn: "manager",
        edgeLabelColumn: "connectorLabel",
      },
    });

    expect(graph.nodes.length).toBe(3);
    expect(graph.edges.length).toBe(2);
    expect(graph).toEqual({
      nodes: [
        {
          data: {
            id: "1",
            classes: "",
            label: "CEO",
          },
        },
        {
          data: {
            id: "2",
            classes: "",
            label: "VP of Sales",
          },
        },
        {
          data: {
            id: "3",
            classes: "",
            label: "VP of Marketing",
          },
        },
      ],
      edges: [
        {
          source: "1",
          target: "2",
          data: {
            id: "",
            classes: "",
            label: "",
          },
        },
        {
          source: "1",
          target: "3",
          data: {
            id: "",
            classes: "",
            label: "",
          },
        },
      ],
    });
  });

  test.only("can parse when edges in separate rows", () => {
    const graph = mapDataToGraph(simpleLucidChart, {
      idColumn: "Id",
      nodeLabelColumn: "Text Area 1",
      edgesDeclared: true,
      rowRepresentsEdgeWhen: {
        column: "Name",
        is: {
          equals: "Line",
        },
        sourceColumn: "Line Source",
        targetColumn: "Line Destination",
      },
    });

    expect(graph).toEqual({});
  });

  test.todo(
    "Can split multiple edge labels that are quoted with delimiter inside"
  );
});
