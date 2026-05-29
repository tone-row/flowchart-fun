import { parse } from "graph-selector";

import { repairText } from "./repairText";

/**
 * CHARACTERIZATION TESTS for repairText.
 *
 * These lock down the CURRENT behavior of repairText (and, by extension, the
 * graph-selector v0.13.0 error-message strings it depends on) ahead of a future
 * framework migration. They assert what the code ACTUALLY does today, not what
 * it ideally should do. Several cases document surprising-but-intentional
 * behavior; those are flagged with CHARACTERIZATION comments.
 */
describe("repairText (characterization)", () => {
  describe("inputs that graph-selector already considers valid -> null", () => {
    test("empty string returns null", () => {
      // '' parses cleanly, so newText is never assigned -> null.
      expect(repairText("")).toBe(null);
    });

    test("whitespace-only input returns null", () => {
      expect(repairText("   ")).toBe(null);
    });

    test("newline-only input returns null", () => {
      expect(repairText("\n\n")).toBe(null);
    });

    test("plain valid text returns null", () => {
      expect(repairText("hello world")).toBe(null);
    });

    test("an edge ('a -> b') is valid and returns null", () => {
      expect(repairText("a -> b")).toBe(null);
    });

    test("unmatched / stray parens with no node before them parse fine -> null", () => {
      // CHARACTERIZATION: graph-selector is permissive about bare parens.
      // '((((' does NOT trigger the pointer error and is left untouched.
      expect(repairText("((((")).toBe(null);
      expect(repairText("(a)(b)")).toBe(null);
    });

    test("a leading-colon line (': x') is treated as VALID -> null (no repair)", () => {
      // CHARACTERIZATION: ': x' parses cleanly in graph-selector, so repairText
      // returns null even though a human might read it as malformed. The colon
      // is NOT escaped. Documents the null-means-"was fine" path.
      expect(repairText(": x")).toBe(null);
    });
  });

  describe("idempotency: already-escaped text must not be re-escaped", () => {
    test("already-escaped colon ('a\\: b') returns null and is NOT double-escaped", () => {
      // Protects existing customer charts that legitimately use escaped colons.
      expect(repairText("a\\: b")).toBe(null);
    });

    test("fully-escaped paren+colon result returns null (stable fixed point)", () => {
      // The output of repairing 'hello (world): foo' must itself be valid.
      expect(repairText("hello \\(world\\)\\: foo")).toBe(null);
    });

    test("only the UNescaped offending char is escaped when one is already escaped", () => {
      // CHARACTERIZATION: 'a\: already (paren)' has a pre-escaped colon and a
      // raw paren. Only the paren gets escaped; the existing '\:' is left as-is
      // (the colon-escape branch never runs because no colon error is thrown
      // once parens are fixed). Output: 'a\: already \(paren\)'.
      expect(repairText("a\\: already (paren)")).toBe(
        "a\\: already \\(paren\\)"
      );
    });
  });

  describe("pointer branch (parentheses) — driven by the 'pointer' substring", () => {
    test("single parenthesized pair gets both parens escaped", () => {
      expect(repairText("hello (world)")).toBe("hello \\(world\\)");
    });

    test("multiple parenthesized pairs all get escaped (global replace)", () => {
      expect(repairText("hello (world) (again)")).toBe(
        "hello \\(world\\) \\(again\\)"
      );
    });

    test("the exact graph-selector error message contains the 'pointer' substring", () => {
      // Highest-value migration tripwire: repairText dispatches on
      // error.message.includes("pointer"). Pin the real message so a
      // graph-selector wording change is caught here.
      let message = "";
      try {
        parse("hello (world)");
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toBe(
        "Line 1: Can't create node and pointer on same line"
      );
      expect(message.includes("pointer")).toBe(true);
    });
  });

  describe("label-without-parent branch (colons) — driven by the 'label without parent' substring", () => {
    test("single colon gets escaped", () => {
      expect(repairText("hello: world")).toBe("hello\\: world");
    });

    test("multiple colons on one line all get escaped (global replace)", () => {
      // CHARACTERIZATION: even though only the first colon triggers the error,
      // EVERY colon in the text is escaped because the replace is global.
      expect(repairText("a: b: c")).toBe("a\\: b\\: c");
    });

    test("the exact graph-selector error message contains the 'label without parent' substring", () => {
      let message = "";
      try {
        parse("hello: world");
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toBe("Line 1: Edge label without parent");
      expect(message.includes("label without parent")).toBe(true);
    });

    test("'missing indentation' branch is dead: an object-destructure+type line takes the colon branch", () => {
      // CHARACTERIZATION: the test historically named "Edge missing indentation"
      // actually exercises the 'label without parent' (colon) branch. There is
      // no graph-selector error containing 'missing indentation' in v0.13.0, so
      // the third branch is unreachable (but identical in effect to the second).
      expect(
        repairText(
          "export function TextEditor({ extendOptions = {}, ...props }: TextEditorProps) {"
        )
      ).toBe(
        "export function TextEditor({ extendOptions = {}, ...props }\\: TextEditorProps) {"
      );
    });
  });

  describe("multi-line over-escaping (global replace across all lines)", () => {
    test("a colon on ONLY one line still escapes colons; offending line gets escaped", () => {
      // Here only line 2 has a colon, so only line 2 changes — but the escape
      // is applied to the whole text, so ALL colons (anywhere) would be hit.
      expect(repairText("good line\nbad: line")).toBe("good line\nbad\\: line");
    });

    test("colons on multiple lines ALL get escaped from a single offending error", () => {
      // CHARACTERIZATION: the offending error is reported on the FIRST bad line
      // only, but because the replace is global, the colon on the OTHER
      // (independent) line is ALSO escaped. Documents the over-escaping
      // idiosyncrasy as current intended behavior.
      expect(repairText("first: one\nsecond: two")).toBe(
        "first\\: one\nsecond\\: two"
      );
    });
  });

  describe("combined paren + colon resolves across multiple loop passes", () => {
    test("'hello (world): foo' escapes colon first, then parens (order-dependent)", () => {
      // CHARACTERIZATION: graph-selector surfaces the 'label without parent'
      // (colon) error before the 'pointer' (paren) error, so colons are escaped
      // on the first pass and parens on a later pass. The final string is the
      // same regardless of order, but this pins the parser's error-ordering
      // coupling so a reordering in a future version is detected.
      expect(repairText("hello (world): foo")).toBe("hello \\(world\\)\\: foo");
    });

    test("interleaved parens and colons all get escaped", () => {
      expect(repairText("a (b): (c)")).toBe("a \\(b\\)\\: \\(c\\)");
    });

    test("the original 'Pointer bug' line (parens + colon) escapes both", () => {
      expect(repairText(`export function repairText(text: string) {`)).toBe(
        `export function repairText\\(text\\: string\\) {`
      );
    });
  });

  describe("safety contract: never throws, swallows unhandled errors", () => {
    test("repairText never throws for a wide range of malformed inputs", () => {
      const inputs = [
        "",
        "   ",
        "\n\n\n",
        "(",
        ")",
        "::::",
        "(((:",
        "a #[ weird",
        "/* unterminated",
        "@",
        ".",
        "[",
        "a {invalid",
        "🙂: emoji",
        "tab\tcolon: x",
      ];
      for (const input of inputs) {
        expect(() => repairText(input)).not.toThrow();
      }
    });

    test("result of repairText, when non-null, always re-parses without error (fixed point)", () => {
      // Pins that the loop terminates on a string graph-selector accepts —
      // i.e. it does not leave behind a half-escaped, still-invalid string for
      // these inputs.
      const inputs = [
        "hello (world)",
        "hello: world",
        "a: b: c",
        "hello (world): foo",
        "a (b): (c)",
        "good line\nbad: line",
      ];
      for (const input of inputs) {
        const repaired = repairText(input);
        expect(repaired).not.toBeNull();
        expect(() => parse(repaired as string)).not.toThrow();
      }
    });
  });
});
