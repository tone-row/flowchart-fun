import { sanitizeOnPaste } from "./sanitizeOnPaste";

describe("sanitizeOnPaste", () => {
  test("returns null for valid text", () => {
    expect(sanitizeOnPaste("hello world")).toBe(null);
  });
  test("returns text with escaped parentheses for invalid text", () => {
    expect(sanitizeOnPaste("hello (world)")).toBe("hello \\(world\\)");
  });

  test("returns escaped for multiple pointers", () => {
    expect(sanitizeOnPaste("hello (world) (again)")).toBe(
      "hello \\(world\\) \\(again\\)"
    );
  });

  test("handles colon", () => {
    expect(sanitizeOnPaste("hello: world")).toBe("hello\\: world");
  });

  test("Edge missing indentation", () => {
    expect(
      sanitizeOnPaste(
        "export function TextEditor({ extendOptions = {}, ...props }: TextEditorProps) {"
      )
    ).toBe(
      "export function TextEditor({ extendOptions = {}, ...props }\\: TextEditorProps) {"
    );
  });

  test("Pointer bug", () => {
    expect(
      sanitizeOnPaste(`export function sanitizeOnPaste(text: string) {`)
    ).toBe(`export function sanitizeOnPaste\\(text\\: string\\) {`);
  });
});
