import { stripComments } from "./utils";

export type MisclosedContainer = {
  lineNumber: number;
  startColumn: number;
  endColumn: number;
  kind: "never-closed" | "swallows-outdented-lines";
};

type OpenContainer = Omit<MisclosedContainer, "kind"> & {
  indent: number;
  swallows: boolean;
};

const linesAsGraphSelectorReadsThem = (text: string) =>
  stripComments(text.replace(/(https?:)\/\//g, "$1\\/\\/")).split("\n");

export function findMisclosedContainers(text: string): MisclosedContainer[] {
  const lines = linesAsGraphSelectorReadsThem(text);
  const rawLines = text.split("\n");
  const open: OpenContainer[] = [];
  const result: MisclosedContainer[] = [];
  const report = (
    { indent, swallows, ...container }: OpenContainer,
    kind: MisclosedContainer["kind"]
  ) => result.push({ ...container, kind });

  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const indent = line.length - line.trimStart().length;
    if (/^\s*\}/.test(line)) {
      const closed = open.pop();
      if (closed?.swallows) report(closed, "swallows-outdented-lines");
    } else {
      for (const container of open) {
        if (indent <= container.indent) container.swallows = true;
      }
    }
    if (line.endsWith("{")) {
      open.push({
        lineNumber: index + 1,
        startColumn: indent + 1,
        endColumn: rawLines[index].length + 1,
        indent,
        swallows: false,
      });
    }
  });
  for (const container of open) report(container, "never-closed");

  return result.sort((a, b) => a.lineNumber - b.lineNumber);
}
