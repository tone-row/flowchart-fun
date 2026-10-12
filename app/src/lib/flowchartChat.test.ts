import { inflateRaw } from "pako";

import { flowchartChatUrl } from "./flowchartChat";

function decodeHash(href: string) {
  const { hash } = new URL(href);
  expect(hash.startsWith("#v1=")).toBe(true);
  const payload = hash.slice("#v1=".length);
  const bytes = inflateRaw(Buffer.from(payload, "base64url"));
  return { payload, chart: JSON.parse(Buffer.from(bytes).toString("utf8")) };
}

describe("flowchartChatUrl", () => {
  test("links to flowchart.chat with crosslink UTMs and no hash", () => {
    const url = new URL(flowchartChatUrl("banner"));
    expect(url.origin + url.pathname).toBe("https://flowchart.chat/");
    expect(url.searchParams.get("utm_source")).toBe("flowchart.fun");
    expect(url.searchParams.get("utm_medium")).toBe("banner");
    expect(url.searchParams.get("utm_campaign")).toBe("crosslink");
    expect(url.hash).toBe("");
  });

  test("round-trips the chart text and title through the v1 hash", () => {
    const chart = {
      title: "Café onboarding 🚀",
      text: "Start\n  Señor’s step 🎉\n    Done: 完成\n(Start)",
    };
    const href = flowchartChatUrl("banner", chart);
    expect(new URL(href).searchParams.get("utm_medium")).toBe("banner");
    expect(decodeHash(href).chart).toEqual(chart);
  });

  test("omits the title when none is given", () => {
    const { chart } = decodeHash(
      flowchartChatUrl("banner", { text: "a\n  b" })
    );
    expect(chart).toEqual({ text: "a\n  b" });
  });

  test("uses base64url without padding", () => {
    for (let i = 0; i < 40; i++) {
      const text = "x".repeat(i) + "?>~ü🙂".repeat(i % 7);
      const { payload } = decodeHash(flowchartChatUrl("banner", { text }));
      expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });
});
