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
});
