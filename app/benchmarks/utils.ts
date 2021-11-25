import Benchmark from "benchmark";
import { readFileSync, writeFileSync } from "fs";
import minimist from "minimist";

import { parseText } from "../src/lib/utils";

const suite = new Benchmark.Suite();
const mockGetSize: Parameters<typeof parseText>[1] = () => ({
  width: 0,
  height: 0,
});

const oneLineText = "hello world";
const oneEdgeText = "hello world\n\tgoodbye world";
const demoText = `This app works by typing
  Indenting creates a link to the current line
  any text: before a colon creates a label
  Create a link directly using the exact label text
    like this: (This app works by typing)
    [custom ID] or
      by adding an [ID] and referencing that
      like this: (custom ID) // You can also use single-line comments
/*
or
multiline
comments

Have fun! 🎉
*/`;

const runResults: Record<string, number> = {};
const argv = minimist(process.argv.slice(2));

const resultsPath = "./benchmarks/utils.results.json";
suite
  .add("parseText - one line", () => {
    parseText(oneLineText, mockGetSize);
  })
  .add("parseText - one edge", () => {
    parseText(oneEdgeText, mockGetSize);
  })
  .add("parseText - demo text", () => {
    parseText(demoText, mockGetSize);
  })
  .on("cycle", (event: any) => {
    runResults[event.target.name] = Math.round(1 / event.target.times.period);
    console.log(String(event.target));
  })
  .on("complete", function () {
    if (!process.env.CI && argv.write) {
      writeFileSync(resultsPath, JSON.stringify(runResults, null, "  "));
    }

    if (process.env.CI) {
      const prevResults = JSON.parse(readFileSync(resultsPath, "utf8"));
      for (const result in runResults) {
        if (result in prevResults) {
          const percentageDiff =
            (runResults[result] - prevResults[result]) / prevResults[result];
          if (percentageDiff < -0.15) {
            console.error(`${result} is 15% slower than expected`);
            process.exit(1);
          }
        }
      }
    }
  })
  .run({ async: true });
