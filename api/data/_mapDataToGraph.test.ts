import { mapDataToGraph } from "./_mapDataToGraph";
import simpleLucidChart from "./fixtures/simpleLucidChart.json";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";

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
      edgesDeclared: "sourceNode",
      targetColumn: "nextStepId",
      targetDelimiter: ",",
      edgeLabelColumn: "connectorLabel",
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
      edgesDeclared: "targetNode",
      sourceColumn: "manager",
      edgeLabelColumn: "connectorLabel",
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

  test("can parse when edges in separate rows", () => {
    const graph = mapDataToGraph(simpleLucidChart, {
      idColumn: "Id",
      nodeLabelColumn: "Text Area 1",
      edgesDeclared: "separateRows",
      rowRepresentsEdgeWhenColumn: "Name",
      rowRepresentsEdgeWhenIs: "equals",
      rowRepresentsEdgeWhenValue: "Line",
      sourceColumn: "Line Source",
      targetColumn: "Line Destination",
    });

    expect(graph).toEqual({
      edges: [
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: 4,
          target: 5,
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: 4,
          target: 6,
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: 7,
          target: 6,
        },
      ],
      nodes: [
        {
          data: {
            classes: "",
            id: 1,
            label: "Blank diagram",
          },
        },
        {
          data: {
            classes: "",
            id: 2,
            label: "Page 1",
          },
        },
        {
          data: {
            classes: "",
            id: 3,
            label: "gsd",
          },
        },
        {
          data: {
            classes: "",
            id: 4,
            label: "sdfsdfsdfsdfsdfsdfsdfsdfsdf",
          },
        },
        {
          data: {
            classes: "",
            id: 5,
            label: "b",
          },
        },
        {
          data: {
            classes: "",
            id: 6,
            label: "c",
          },
        },
        {
          data: {
            classes: "",
            id: 7,
            label: "",
          },
        },
      ],
    });
  });

  test("can split basic delimiter", () => {
    const graph = mapDataToGraph(
      [
        {
          id: "1",
          label: "a",
          nextStepId: "2,3",
          connectorLabel: "label one,label two",
        },
        {
          id: "2",
          label: "b",
          nextStepId: "",
          connectorLabel: "",
        },
        {
          id: "3",
          label: "c",
          nextStepId: "",
          connectorLabel: "",
        },
      ],
      {
        idColumn: "id",
        nodeLabelColumn: "label",
        edgesDeclared: "sourceNode",
        targetDelimiter: ",",
        targetColumn: "nextStepId",
        edgeLabelColumn: "connectorLabel",
      }
    );

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
        {
          data: {
            id: "3",
            classes: "",
            label: "c",
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
            label: "label one",
          },
        },
        {
          source: "1",
          target: "3",
          data: {
            id: "",
            classes: "",
            label: "label two",
          },
        },
      ],
    });
  });

  test("can split on delimiter", () => {
    // const records = parse()
    const relative = "data/fixtures/example-visio-process.csv";
    const dir = process.cwd();
    const fullPath = `${dir}/${relative}`;
    const csv = readFileSync(fullPath, "utf8");
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      relax_column_count: true,
      trim: true,
    });
    const graph = mapDataToGraph(records, {
      idColumn: "Process Step ID",
      nodeLabelColumn: "Process Step Description",
      edgesDeclared: "sourceNode",
      targetDelimiter: ",",
      targetColumn: "Next Step ID",
      edgeLabelColumn: "Connector Label",
    });

    expect(graph).toEqual({
      edges: [
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n1",
          target: "n2",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n2",
          target: "n3",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "label",
          },
          source: "n3",
          target: "n4",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n3",
          target: "n6",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n3",
          target: "n9",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n4",
          target: "n10",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n6",
          target: "n7",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n7",
          target: "n8",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n9",
          target: "n10",
        },
        {
          data: {
            classes: "",
            id: "",
            label: "",
          },
          source: "n10",
          target: "n8",
        },
      ],
      nodes: [
        {
          data: {
            classes: "",
            id: "n1",
            label: "Start",
          },
        },
        {
          data: {
            classes: "",
            id: "n2",
            label: "Step 1",
          },
        },
        {
          data: {
            classes: "",
            id: "n3",
            label: "Step 2",
          },
        },
        {
          data: {
            classes: "",
            id: "n4",
            label: "Step 3",
          },
        },
        {
          data: {
            classes: "",
            id: "n6",
            label: "Step 4",
          },
        },
        {
          data: {
            classes: "",
            id: "n7",
            label: "Step 6",
          },
        },
        {
          data: {
            classes: "",
            id: "n8",
            label: "Finish",
          },
        },
        {
          data: {
            classes: "",
            id: "n9",
            label: "Step 5",
          },
        },
        {
          data: {
            classes: "",
            id: "n10",
            label: "Step 7",
          },
        },
      ],
    });
  });

  test("Does not try to find edge label column if 'none' is passed", () => {
    const graph = mapDataToGraph(
      [
        {
          id: "1",
          label: "a",
          nextStepId: "2",
          connectorLabel: "label one",
        },
        {
          id: "2",
          label: "b",
          nextStepId: "",
          connectorLabel: "",
        },
      ],
      {
        idColumn: "id",
        nodeLabelColumn: "label",
        edgesDeclared: "sourceNode",
        targetDelimiter: ",",
        targetColumn: "nextStepId",
        edgeLabelColumn: "",
      }
    );

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

  test.todo(
    "Can split multiple edge labels that are quoted with delimiter inside"
  );
});
