import { cytoscape } from "./cytoscape";
import { LayoutName } from "./FFTheme";
import { getElements } from "./getElements";
import { theme as defaultTheme } from "./templates/default-template";
import { layoutsWithoutContainers, toTheme } from "./toTheme";

const ALL_LAYOUTS: Record<LayoutName, null> = {
  dagre: null,
  klay: null,
  layered: null,
  mrtree: null,
  stress: null,
  radial: null,
  cose: null,
  breadthfirst: null,
  concentric: null,
  circle: null,
};

const CONTAINER_DOCS = [
  "Start\n  Build {\n    Compile\n    Lint\n  }\n  Test\n    Deploy\n      Done",
  "Idea\n  Research\n    Phase 1 {\n      Draft\n      Review\n      Revise\n    }\n    Test\n      Deploy\n        Monitor\n  Budget\n    Approve\n      Launch",
  "A\n  B\n    C\n    D\n  E\n    F\n    G\n  Section {\n    H\n    I\n    J\n    K\n  }\n  L\n    M\n    N\n  O",
  "Start\n  Intake {\n    Form\n      Validate\n    Email\n  }\n  Review\n    (Form)\n    Approve\n      (Email)\n    Reject\nArchive",
  "Kickoff\n  Frontend {\n    UI\n    Styles\n  }\n  Backend {\n    API\n    DB\n  }\n  QA\n    Release\n      Retro\n  Docs",
  "Root\n  Outer {\n    Inner {\n      X\n      Y\n    }\n    Z\n  }\n  P\n    Q\n  R\n    S",
  "Start\n  Steps {\n    One\n    Two\n    Three\n    Four\n    Five\n    Six\n  }\n  End\n  Other",
  "Home\n  Shop {\n    Cart\n      Checkout\n  }\n  Account\n    (Cart)\n  Help\n    (Checkout)",
];

const FLAT_DOC =
  "A\n  B\n    C\n    D\n  E\n    F\n    G\n  H\n    I\n    J\n    K\n  L\n    M\n    N\n  O";

const OVERLAPS_ANY_NODE: LayoutName[] = ["stress"];

async function layOut(doc: string, layoutName: LayoutName) {
  const cy = cytoscape({
    headless: true,
    styleEnabled: true,
    elements: getElements(doc).map(({ style, ...element }) => element),
    style: [{ selector: "node", style: { width: 120, height: 40 } }],
  });
  const stopped = new Promise((resolve) => cy.one("layoutstop", resolve));
  const { layout } = toTheme({ ...defaultTheme, layoutName });
  cy.layout({ ...layout, animate: false } as cytoscape.LayoutOptions).run();
  await stopped;
  return cy;
}

function nodesCovered(cy: cytoscape.Core, boxes: cytoscape.NodeCollection) {
  const covered: string[] = [];
  boxes.forEach((box) => {
    const { x1, x2, y1, y2 } = box.boundingBox({});
    cy.nodes(":childless")
      .difference(box.descendants())
      .not(box)
      .forEach((node) => {
        const { x, y } = node.position();
        if (x > x1 && x < x2 && y > y1 && y < y2)
          covered.push(`${box.data("label")} covers ${node.data("label")}`);
      });
  });
  return covered;
}

async function containersCovering(layoutName: LayoutName) {
  const covered: string[] = [];
  for (const doc of CONTAINER_DOCS) {
    const cy = await layOut(doc, layoutName);
    covered.push(...nodesCovered(cy, cy.nodes(":parent")));
    cy.destroy();
  }
  return covered;
}

const supported = (Object.keys(ALL_LAYOUTS) as LayoutName[]).filter(
  (name) =>
    !layoutsWithoutContainers.includes(name) &&
    !OVERLAPS_ANY_NODE.includes(name)
);

test.each(layoutsWithoutContainers)(
  "%s draws a container over a node outside it",
  async (layoutName) => {
    expect(await containersCovering(layoutName)).not.toEqual([]);
  }
);

test.each(supported)(
  "%s keeps every container clear of nodes outside it",
  async (layoutName) => {
    expect(await containersCovering(layoutName)).toEqual([]);
  }
);

test.each(OVERLAPS_ANY_NODE)(
  "%s overlaps nodes in a chart without containers",
  async (layoutName) => {
    const cy = await layOut(FLAT_DOC, layoutName);
    expect(nodesCovered(cy, cy.nodes(":childless"))).not.toEqual([]);
    cy.destroy();
  }
);
