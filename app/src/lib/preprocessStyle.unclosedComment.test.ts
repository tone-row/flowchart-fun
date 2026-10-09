import { spawnSync } from "child_process";
import {
  getStyleStringFromMeta,
  preprocessStyle,
  stripCssComments,
} from "./preprocessStyle";
import {
  theme as storylineTheme,
  cytoscapeStyle as storylineCss,
} from "./templates/storyline-template";

const PARSE_BUDGET_MS = 3000;

/**
 * cytoscape's string stylesheet parser is run in a child process so that a
 * regression (it backtracks exponentially on an unterminated comment) fails
 * this test at the deadline instead of hanging Jest. A headless cytoscape
 * instance keeps the event loop alive, hence the explicit exit.
 */
function parseWithCytoscape(style: string) {
  const script = `
    const cytoscape = require(${JSON.stringify(require.resolve("cytoscape"))});
    const cy = cytoscape({ headless: true, styleEnabled: true });
    cy.style().fromString(require("fs").readFileSync(0, "utf8"));
    process.stdout.write(String(cy.style().json().length));
    process.exit(0);
  `;
  const result = spawnSync(process.execPath, ["-e", script], {
    input: style,
    encoding: "utf8",
    timeout: PARSE_BUDGET_MS,
  });
  return {
    signal: result.signal,
    status: result.status,
    ruleCount: Number(result.stdout),
  };
}

function finalStyle(meta: Record<string, unknown>) {
  return preprocessStyle(getStyleStringFromMeta(meta)).style;
}

describe("an unclosed comment at the end of the custom CSS", () => {
  it("comments out only the user's CSS: the utility classes still apply and cytoscape parses within budget", () => {
    const closed = parseWithCytoscape(
      finalStyle({ themeEditor: storylineTheme, cytoscapeStyle: storylineCss })
    );
    expect(closed).toMatchObject({ signal: null, status: 0 });

    const style = finalStyle({
      themeEditor: storylineTheme,
      cytoscapeStyle: `${storylineCss}\n/* `,
    });
    expect(style).toContain(":childless.shape_diamond");
    expect(style).toContain("edge[parallel > 1]");

    const unclosed = parseWithCytoscape(style);
    expect(unclosed).toMatchObject({ signal: null, status: 0 });
    expect(unclosed.ruleCount).toBe(closed.ruleCount);
  });

  it("with customCssOnly, cytoscape still parses within budget", () => {
    const unclosed = parseWithCytoscape(
      finalStyle({
        themeEditor: storylineTheme,
        customCssOnly: true,
        cytoscapeStyle: `${storylineCss}\n/* ${" ".repeat(500)}`,
      })
    );
    expect(unclosed).toMatchObject({ signal: null, status: 0 });
  });

  it("removing a comment never splices its neighbours into a new /*", () => {
    const unclosed = parseWithCytoscape(
      finalStyle({
        themeEditor: storylineTheme,
        cytoscapeStyle: `//* x */*\n${storylineCss}`,
      })
    );
    expect(unclosed).toMatchObject({ signal: null, status: 0 });
  });
});

describe("stripCssComments", () => {
  const alphabet = ["/", "*", " ", "a", "\n"];
  const everyString = (length: number): string[] =>
    length === 0
      ? [""]
      : everyString(length - 1).flatMap((s) => alphabet.map((c) => s + c));

  it("leaves no /* in its output for any input up to 7 characters", () => {
    for (let length = 0; length <= 7; length++) {
      for (const input of everyString(length)) {
        expect([input, stripCssComments(input)]).toEqual([
          input,
          expect.not.stringContaining("/*"),
        ]);
      }
    }
  });

  it("cytoscape parses the final stylesheet within budget for splicing and random prefixes", () => {
    let seed = 1;
    const next = () => (seed = (seed * 48271) % 2147483647);
    const random = () =>
      Array.from({ length: 24 }, () => alphabet[next() % alphabet.length]).join(
        ""
      );
    const prefixes = [
      "//* x */*",
      "//**/*",
      ...Array.from({ length: 10 }, random),
    ];
    for (const prefix of prefixes) {
      const style = finalStyle({
        themeEditor: storylineTheme,
        cytoscapeStyle: `${prefix}\n${storylineCss}\n${prefix}`,
      });
      expect([prefix, parseWithCytoscape(style)]).toEqual([
        prefix,
        expect.objectContaining({ signal: null, status: 0 }),
      ]);
    }
  });
});
