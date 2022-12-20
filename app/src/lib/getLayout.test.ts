import { defaultLayout } from "./constants";
import { getLayout } from "./getLayout";

describe("getLayout", () => {
  test("returns the default layout if nothing passed", () => {
    const doc = { meta: {}, text: "" };
    const layout = getLayout(doc);
    expect(layout).toEqual(defaultLayout);
  });

  test("returns layout name", () => {
    const doc = { meta: { layout: { name: "random" } }, text: "" };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("random");
  });

  test("moves elk names into elk options", () => {
    const doc = { meta: { layout: { name: "elk-mrtree" } }, text: "" };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("elk");
    expect(layout.elk).toEqual({ algorithm: "mrtree" });
  });

  test("moves nodePositions into positions and makes layout 'preset'", () => {
    const doc = {
      meta: {
        layout: { name: "random" },
        nodePositions: { a: { x: 1, y: 2 } },
      },
      text: "",
    };
    const layout = getLayout(doc);
    expect(layout.name).toEqual("preset");
    expect(layout.positions).toEqual({ a: { x: 1, y: 2 } });
  });
});
