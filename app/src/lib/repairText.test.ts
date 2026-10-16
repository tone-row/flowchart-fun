import { repairText } from "./repairText";

describe("repairText", () => {
  test("returns null for valid text", () => {
    expect(repairText("hello world")).toBe(null);
  });
  test("returns text with escaped parentheses for invalid text", () => {
    expect(repairText("hello (world)")).toBe("hello \\(world\\)");
  });

  test("returns escaped for multiple pointers", () => {
    expect(repairText("hello (world) (again)")).toBe(
      "hello \\(world\\) \\(again\\)"
    );
  });

  test("handles colon", () => {
    expect(repairText("hello: world")).toBe("hello\\: world");
  });

  test("Edge missing indentation", () => {
    expect(
      repairText(
        "export function TextEditor({ extendOptions = {}, ...props }: TextEditorProps) {"
      )
    ).toBe(
      "export function TextEditor({ extendOptions = {}, ...props }\\: TextEditorProps) {"
    );
  });

  test("Pointer bug", () => {
    expect(repairText(`export function repairText(text: string) {`)).toBe(
      `export function repairText\\(text\\: string\\) {`
    );
  });

  describe("with the surrounding document", () => {
    test("leaves an edge label pasted under a parent alone", () => {
      expect(
        repairText("Test: test .test", { before: "Parent\n  ", after: "" })
      ).toBe(null);
    });

    test("escapes an edge label pasted with no parent", () => {
      expect(
        repairText("Test: test", { before: "A\n  B\n", after: "\nC" })
      ).toBe("Test\\: test");
    });

    test("leaves the paste alone when the error is on another line", () => {
      expect(
        repairText("Test: test", { before: "Orphan: x\nParent\n  ", after: "" })
      ).toBe(null);
    });

    test("escapes parens pasted under a parent", () => {
      expect(
        repairText("call (foo)", { before: "Parent\n  ", after: "" })
      ).toBe("call \\(foo\\)");
    });
  });
});
