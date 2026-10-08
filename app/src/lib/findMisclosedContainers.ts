export type MisclosedContainer = {
  lineNumber: number;
  startColumn: number;
  endColumn: number;
  kind: "never-closed" | "swallows-outdented-lines";
};

export function findMisclosedContainers(_text: string): MisclosedContainer[] {
  return [];
}
