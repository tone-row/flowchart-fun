import { withFreshExpiry } from "./getExpirationDate";
import { Doc } from "./useDoc";

const DAY_MS = 24 * 60 * 60 * 1000;

function doc(meta: Record<string, unknown>): Doc {
  return {
    text: "a\n  b",
    meta,
    details: { id: "", title: "", isHosted: false },
  };
}

function hoursAhead(iso: unknown) {
  return (new Date(iso as string).getTime() - Date.now()) / 36e5;
}

describe("withFreshExpiry", () => {
  test("replaces a past expires with one 24h from now", () => {
    const past = new Date(Date.now() - DAY_MS).toISOString();
    const out = withFreshExpiry(doc({ expires: past }));
    expect(out.meta.expires).not.toBe(past);
    expect(hoursAhead(out.meta.expires)).toBeGreaterThan(23.99);
    expect(hoursAhead(out.meta.expires)).toBeLessThanOrEqual(24);
  });

  test("adds expires when the meta has none (mobile Clear writes meta: {})", () => {
    const out = withFreshExpiry(doc({}));
    expect(hoursAhead(out.meta.expires)).toBeGreaterThan(23.99);
  });

  test("keeps text and the other meta keys, and does not mutate the input", () => {
    const input = doc({
      expires: "2020-01-01T00:00:00.000Z",
      themeEditor: { k: 1 },
    });
    const out = withFreshExpiry(input);
    expect(out.text).toBe(input.text);
    expect(out.meta.themeEditor).toEqual({ k: 1 });
    expect(input.meta.expires).toBe("2020-01-01T00:00:00.000Z");
  });
});
