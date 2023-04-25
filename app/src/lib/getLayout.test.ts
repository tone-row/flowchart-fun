import { getLayout } from "./getLayout";
import { initialDoc } from "./useDoc";

describe("getLayout", () => {
  test("returns the default layout if nothing passed", () => {
    const doc = { ...initialDoc, meta: {} };
    const layout = getLayout(doc);
    expect(layout).toEqual({
      name: "dagre",
      animate: true,
      spacingFactor: 1.25,
      rankDir: "TB",
    });
  });

  test("returns layout name", () => {
    const doc = { ...initialDoc, meta: { layout: { name: "random" } } };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("random");
  });

  test("moves elk names into elk options", () => {
    const doc = {
      ...initialDoc,
      meta: { layout: { name: "elk-mrtree" } },
    };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("elk");
    expect(layout.elk).toEqual({ algorithm: "mrtree" });
  });

  test("makes layout 'preset' if isFrozen", () => {
    const doc = {
      ...initialDoc,
      meta: {
        layout: { name: "random" },
        nodePositions: { a: { x: 1, y: 2 } },
        isFrozen: true,
      },
    };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("preset");
    expect(layout.positions).toEqual({ a: { x: 1, y: 2 } });
  });
});
