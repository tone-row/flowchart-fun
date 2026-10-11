const DOC = [
  "Request",
  "  Detect test-load header",
  "    true: (Apply test-loader header)",
  "    false: Check for fallback",
  "      true: Run fallback \\(flag is off)",
  "      false: Throw auth error",
  '    "without bypass": getProducerCodeAccessCandidate {',
  "      Extract token",
  "        fail: (null)",
  "        Decode token",
  "          fail: (null)",
  "          Get OU",
  "            fail: (null)",
  "            Detect role",
  "              fail: (null)",
  "              Get flag \\(by Auth0 user ID)",
  "                fail: (null)",
  "      null",
  "    }",
  "      null: Apply test-loader header",
  "      candidate: Populate producer user code access cache & context",
].join("\n");

const edgeEndpoints = (page) =>
  page.evaluate(() => {
    const cy = window.__cy;
    return cy.edges().map((e) => {
      const t = e.targetEndpoint();
      return {
        id: e.id(),
        label: e.data("label"),
        sourceIsNode: e.source().isNode(),
        targetIsNode: e.target().isNode(),
        targetLabel: e.target().data("label"),
        targetEndpoint: { x: Math.round(t.x), y: Math.round(t.y) },
      };
    });
  });

const nodeBox = (page, label) =>
  page.evaluate((l) => {
    const n = window.__cy.nodes().filter((n) => n.data("label") === l)[0];
    const b = n.boundingBox();
    const r = n.renderedPosition();
    return { x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2, rendered: { x: r.x, y: r.y } };
  }, label);

const touches = (p, box, slack = 4) =>
  p.x >= box.x1 - slack && p.x <= box.x2 + slack && p.y >= box.y1 - slack && p.y <= box.y2 + slack;

export default async ({ page, ff, step, expect }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  step("type a chart whose edge label equals a referenced node label");
  await ff.open("/");
  await ff.typeDoc(DOC);
  // Monaco auto-closes the "{" on line 7, leaving one extra "}" after the doc.
  expect((await ff.editorText()).trimEnd().startsWith(DOC)).toBe(true);
  const g = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Request"));
  expect(g.nodes.length).toBe(14);
  await ff.shot("initial", ff.canvas());

  step("every edge connects two nodes (no edge targets an edge)");
  const before = await edgeEndpoints(page);
  const offNode = before.filter((e) => !e.sourceIsNode || !e.targetIsNode);
  ff.note({ edges: before.length, offNode: offNode.map((e) => e.id) });
  expect(offNode).toEqual([]);
  const failEdges = before.filter((e) => e.label === "fail");
  expect(failEdges.length).toBe(5);
  expect(failEdges.every((e) => e.targetLabel === "null")).toBe(true);

  step("drag the shared 'null' destination; all of its incoming edges follow");
  const canvas = await ff.canvas().boundingBox();
  const start = (await nodeBox(page, "null")).rendered;
  const x = canvas.x + start.x;
  const y = canvas.y + start.y;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x + 12 * i, y + 16 * i);
  await page.mouse.up();
  await ff.waitForGraph();
  const box = await nodeBox(page, "null");
  const after = await edgeEndpoints(page);
  const incoming = after.filter((e) => e.targetLabel === "null");
  const stranded = incoming.filter((e) => !touches(e.targetEndpoint, box));
  ff.note({ nullBox: box, incoming: incoming.map((e) => [e.id, e.targetEndpoint]), stranded: stranded.map((e) => e.id) });
  expect(incoming.length).toBe(5);
  expect(stranded).toEqual([]);
  await ff.shot("after-drag", ff.canvas());
};
