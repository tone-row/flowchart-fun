import { stripComments } from "./utils";

export type MisclosedContainer = {
  lineNumber: number;
  startColumn: number;
  endColumn: number;
  kind: "never-closed" | "swallows-outdented-lines";
};

type Body = "empty" | "indented" | "flush" | "swallowing";

type OpenContainer = {
  range: Omit<MisclosedContainer, "kind">;
  indent: number;
  body: Body;
};

const nextBody = (body: Body, deeper: boolean): Body => {
  if (body === "empty") return deeper ? "indented" : "flush";
  if (body === "indented" && !deeper) return "swallowing";
  return body;
};

const linesAsGraphSelectorReadsThem = (text: string) =>
  stripComments(text.replace(/(https?:)\/\//g, "$1\\/\\/")).split("\n");

export function findMisclosedContainers(text: string): MisclosedContainer[] {
  const lines = linesAsGraphSelectorReadsThem(text);
  const rawLines = text.split("\n");
  const open: OpenContainer[] = [];
  const result: MisclosedContainer[] = [];
  const report = ({ range }: OpenContainer, kind: MisclosedContainer["kind"]) =>
    result.push({ ...range, kind });

  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const indent = line.length - line.trimStart().length;
    if (/^\s*\}/.test(line)) {
      const closed = open.pop();
      if (closed?.body === "swallowing")
        report(closed, "swallows-outdented-lines");
    } else {
      for (const container of open) {
        container.body = nextBody(container.body, indent > container.indent);
      }
    }
    if (line.endsWith("{")) {
      open.push({
        range: {
          lineNumber: index + 1,
          startColumn: indent + 1,
          endColumn: rawLines[index].length + 1,
        },
        indent,
        body: "empty",
      });
    }
  });
  for (const container of open) report(container, "never-closed");

  return result.sort((a, b) => a.lineNumber - b.lineNumber);
}
