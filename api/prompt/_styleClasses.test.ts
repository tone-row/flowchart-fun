import fs from "fs";
import path from "path";
import { styleClasses } from "shared";

/**
 * Every style class an AI prompt teaches must be in the catalog
 * (docs/adr/0001-dsl-style-classes-are-a-public-api.md). Scans the prompt
 * sources as text so a prompt added in a new file is covered too.
 */
const promptFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));

const classToken = /(?<=[\s,(]|^)((?:\.[a-z][a-z0-9]*(?:[_-][a-z0-9-]+)+)+)/gim;

const known = new Set(styleClasses.map((c) => c.name));

test.each(promptFiles)("%s teaches only catalog style classes", (file) => {
  const source = fs.readFileSync(path.join(__dirname, file), "utf8");
  const taught = Array.from(source.matchAll(classToken)).flatMap((m) =>
    m[1].split(".").filter(Boolean)
  );
  expect(taught.filter((name) => !known.has(name))).toEqual([]);
});

test("the scan finds the classes the shared prompt teaches", () => {
  const source = fs.readFileSync(path.join(__dirname, "_shared.ts"), "utf8");
  const taught = Array.from(source.matchAll(classToken)).flatMap((m) =>
    m[1].split(".").filter(Boolean)
  );
  expect(taught).toEqual(
    expect.arrayContaining([
      "color_blue",
      "shape_diamond",
      "shape_right-rhomboid",
    ])
  );
});
