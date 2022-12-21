import { defaultLayout } from "./constants";
import { getLayout } from "./getLayout";
import { initialDoc } from "./prepareChart";

describe("getLayout", () => {
  test("returns the default layout if nothing passed", () => {
    const doc = { ...initialDoc, meta: {} };
    const layout = getLayout(doc);
    expect(layout).toEqual(defaultLayout);
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

  test("moves nodePositions into positions and makes layout 'preset'", () => {
    const doc = {
      ...initialDoc,
      meta: {
        layout: { name: "random" },
        nodePositions: { a: { x: 1, y: 2 } },
      },
    };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("preset");
    expect(layout.positions).toEqual({ a: { x: 1, y: 2 } });
  });
});
