import { readFileSync } from "fs";
import { join } from "path";

import {
  legacyDefaultTheme as theme,
  legacyDefaultCytoscapeStyle as cytoscapeStyle,
} from "../legacyDefaultTheme";
import { initialDoc, useDoc } from "../useDoc";
import {
  delimiters,
  HIDDEN_GRAPH_OPTIONS_DIVIDER,
  newDelimiters,
} from "../constants";
import { prepareChart } from "./prepareChart";

/**
 * CHARACTERIZATION tests for prepareChart.
 *
 * These lock down the CURRENT behavior of the three-delimiter / layout-migration
 * pipeline before a future framework migration. They capture ACTUAL output, not
 * ideal output. Where current behavior is surprising or buggy it is asserted as-is
 * and flagged with a // CHARACTERIZATION comment.
 *
 * Pure cases use { set: false } so they exercise the delimiter parsing, deep merge,
 * theme backfill, layout migration and text normalization WITHOUT touching jsdom or
 * the zustand store. A small number of { set: true } cases pin the side-effect path.
 *
 * THEME CLONING (see "shared default theme" test): prepareChart backfills
 * `meta.themeEditor` with a CLONE of the default theme ({ ...theme }), not the shared
 * imported object, so legacy-layout migration mutating .layoutName / .spacingFactor no
 * longer leaks into the shared `theme` import or across subsequent prepareChart calls.
 * We capture the pristine default values up-front and assert the shared import stays
 * pristine after a mutating call.
 */

// Capture the PRISTINE default theme values BEFORE any prepareChart call runs, so we
// can assert the shared `theme` import is NOT mutated by prepareChart (it clones).
const PRISTINE_LAYOUT_NAME = theme.layoutName; // "dagre"
const PRISTINE_SPACING_FACTOR = theme.spacingFactor; // 1.1
const PRISTINE_THEME_SNAPSHOT = JSON.parse(JSON.stringify(theme));

function getFixture(name: string) {
  return readFileSync(join(__dirname, "examples", name), "utf8");
}

describe("prepareChart (characterization)", () => {
  // ---------------------------------------------------------------------------
  // Branch (a): no metadata at all -> default theme + default cytoscapeStyle
  // ---------------------------------------------------------------------------
  test("example9: plain text, no delimiters, no metadata -> default theme + cytoscapeStyle backfilled", async () => {
    const result = await prepareChart({
      doc: getFixture("example9"),
      details: initialDoc.details,
      set: false,
    });

    // text: trimmed with exactly one trailing newline
    expect(result.text).toBe(
      `This app works by typing
  Indenting creates a link to the current line
  any text: before a colon creates a label
`
    );

    // meta: ONLY the two backfilled keys, nothing else
    expect(Object.keys(result.meta).sort()).toEqual([
      "cytoscapeStyle",
      "themeEditor",
    ]);
    expect(result.meta.cytoscapeStyle).toBe(cytoscapeStyle);
    // themeEditor is a CLONE of the default theme (not the shared import ref),
    // so it deep-equals the default but is a distinct object
    expect(result.meta.themeEditor).not.toBe(theme);
    expect(result.meta.themeEditor).toEqual(theme);
    expect((result.meta.themeEditor as any).layoutName).toBe(
      PRISTINE_LAYOUT_NAME
    );
    expect((result.meta.themeEditor as any).spacingFactor).toBe(
      PRISTINE_SPACING_FACTOR
    );

    expect(result.details).toBe(initialDoc.details);
  });

  // ---------------------------------------------------------------------------
  // set=false purity: no store write, no DOM side effect
  // ---------------------------------------------------------------------------
  test("set=false returns pure result and does NOT write to the useDoc store", async () => {
    const before = useDoc.getState();

    const result = await prepareChart({
      doc: "alpha\n  beta\n",
      details: initialDoc.details,
      set: false,
    });

    const after = useDoc.getState();

    // store untouched (same reference values as before)
    expect(after.text).toBe(before.text);
    expect(after.meta).toBe(before.meta);
    expect(after.details).toBe(before.details);

    expect(result.text).toBe("alpha\n  beta\n");
  });

  // ---------------------------------------------------------------------------
  // set=true side-effect path: writes the SAME payload into the store
  // ---------------------------------------------------------------------------
  test("set=true writes { text, meta, details } into the useDoc store", async () => {
    const details = { id: "side-effect", title: "t", isHosted: false };
    const result = await prepareChart({
      doc: "alpha\n  beta\n",
      details,
      set: true,
    });

    const state = useDoc.getState();
    expect(state.text).toBe(result.text);
    expect(state.meta).toBe(result.meta);
    expect(state.details).toBe(result.details);
    expect(state.details).toBe(details);
  });

  // ---------------------------------------------------------------------------
  // elk- prefix stripping via slice(4)
  // ---------------------------------------------------------------------------
  test("legacy layout name 'elk-layered' migrates to themeEditor.layoutName 'layered' (slice(4))", async () => {
    const doc = `n1\n  n2\n=====\n${JSON.stringify({
      layout: { name: "elk-layered", spacingFactor: 2 },
      // supply our own themeEditor so we do NOT mutate the shared default theme
      themeEditor: { ...PRISTINE_THEME_SNAPSHOT },
    })}\n=====`;

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    expect((result.meta.themeEditor as any).layoutName).toBe("layered");
    expect((result.meta.themeEditor as any).spacingFactor).toBe(2);
    // old layout key is deleted
    expect(result.meta.layout).toBeUndefined();
  });

  test("elk-radial -> 'radial'; a bare 'elk-' prefix yields empty name so layoutName is left unchanged", async () => {
    const radial = await prepareChart({
      doc: `n\n=====\n${JSON.stringify({
        layout: { name: "elk-radial" },
        themeEditor: { ...PRISTINE_THEME_SNAPSHOT },
      })}\n=====`,
      details: initialDoc.details,
      set: false,
    });
    expect((radial.meta.themeEditor as any).layoutName).toBe("radial");

    // CHARACTERIZATION: name "elk-" -> slice(4) -> "" which is falsy, so layoutName
    // is NOT assigned and the existing themeEditor.layoutName is preserved.
    const bare = await prepareChart({
      doc: `n\n=====\n${JSON.stringify({
        layout: { name: "elk-" },
        themeEditor: { ...PRISTINE_THEME_SNAPSHOT, layoutName: "klay" },
      })}\n=====`,
      details: initialDoc.details,
      set: false,
    });
    expect((bare.meta.themeEditor as any).layoutName).toBe("klay");
  });

  // ---------------------------------------------------------------------------
  // Branch (b): cytoscapeStyle present but no themeEditor
  // ---------------------------------------------------------------------------
  test("branch (b): cytoscapeStyle present, no themeEditor -> default themeEditor AND customCssOnly:true", async () => {
    const doc = `n1\n=====\n${JSON.stringify({
      cytoscapeStyle: "node { background-color: red; }",
    })}\n=====`;

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    // user's cytoscapeStyle preserved (NOT overwritten with default)
    expect(result.meta.cytoscapeStyle).toBe("node { background-color: red; }");
    // default theme backfilled as a CLONE (not the shared `theme` reference)
    expect(result.meta.themeEditor).not.toBe(theme);
    expect(result.meta.themeEditor).toEqual(theme);
    // CHARACTERIZATION: the easy-to-lose customCssOnly flag that disables the
    // backfilled default theme at render time
    expect(result.meta.customCssOnly).toBe(true);
  });

  test("branch (c): themeEditor present -> left as-is, no cytoscapeStyle backfill, no customCssOnly", async () => {
    const customThemeEditor = {
      ...PRISTINE_THEME_SNAPSHOT,
      layoutName: "klay",
      fontFamily: "X",
    };
    const doc = `n1\n=====\n${JSON.stringify({
      themeEditor: customThemeEditor,
    })}\n=====`;

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    expect(result.meta.themeEditor).toEqual(customThemeEditor);
    // no default cytoscapeStyle is added in branch (c)
    expect(result.meta.cytoscapeStyle).toBeUndefined();
    expect(result.meta.customCssOnly).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // deepmerge precedence: last-wins (json < yaml < hidden)
  // gray-matter only parses ~~~ frontmatter at the START of the text, so the
  // realistic layout is: ~~~yaml~~~ first, then content, then ===== / ¼▓╬ blocks.
  // ---------------------------------------------------------------------------
  test("deepmerge precedence: ¼▓╬ (hidden) beats ~~~ (yaml) for a colliding scalar key", async () => {
    const doc = [
      delimiters,
      `customKey: from-yaml`,
      delimiters,
      `node`,
      `${HIDDEN_GRAPH_OPTIONS_DIVIDER}${JSON.stringify({
        customKey: "from-hidden",
      })}`,
    ].join("\n");

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    // merge.all([jsonMeta, parsedData(yaml), hidden]) -> last array element wins
    expect(result.meta.customKey).toBe("from-hidden");
  });

  test("deepmerge precedence: ¼▓╬ (hidden) beats ===== (json) when hidden block precedes the json block", async () => {
    // ===== is split FIRST (only parts[1] kept), so the ¼▓╬ block must appear
    // BEFORE the ===== block to survive. Here it does.
    const doc = [
      `node`,
      `${HIDDEN_GRAPH_OPTIONS_DIVIDER}${JSON.stringify({
        customKey: "from-hidden",
      })}`,
      newDelimiters,
      JSON.stringify({ customKey: "from-json" }),
      newDelimiters,
    ].join("\n");

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    expect(result.meta.customKey).toBe("from-hidden");
  });

  test("deepmerge precedence: ~~~ (yaml) beats ===== (json) when hidden block absent", async () => {
    const doc = [
      delimiters,
      `customKey: from-yaml`,
      delimiters,
      `node`,
      newDelimiters,
      JSON.stringify({ customKey: "from-json" }),
      newDelimiters,
    ].join("\n");

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    expect(result.meta.customKey).toBe("from-yaml");
  });

  test("deepmerge concatenates arrays across blocks (default deepmerge array strategy)", async () => {
    const doc = [
      delimiters,
      `arr:\n  - 1\n  - 2`,
      delimiters,
      `node`,
      `${HIDDEN_GRAPH_OPTIONS_DIVIDER}${JSON.stringify({ arr: [3] })}`,
    ].join("\n");

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    // CHARACTERIZATION: arrays are concatenated (yaml [1,2] then hidden [3]),
    // not replaced
    expect(result.meta.arr).toEqual([1, 2, 3]);
  });

  // ---------------------------------------------------------------------------
  // gray-matter only parses frontmatter at the very start of the text
  // ---------------------------------------------------------------------------
  test("CHARACTERIZATION: ~~~ block NOT at start of text is NOT parsed as YAML (left in text)", async () => {
    // The ~~~ block follows a content line, so gray-matter does not treat it as
    // frontmatter; the data is empty and the ~~~ block remains in the text.
    const doc = [`node`, delimiters, `foo: bar`, delimiters].join("\n");

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    expect(result.meta.foo).toBeUndefined();
    // the ~~~ content stays embedded in the text
    expect(result.text).toContain("~~~");
    expect(result.text).toContain("foo: bar");
  });

  // ---------------------------------------------------------------------------
  // Layout migration data loss: rankDir / direction dropped
  // ---------------------------------------------------------------------------
  test("legacy layout.rankDir is DROPPED; layoutName preserved, spacingFactor overwritten from layout, layout deleted", async () => {
    // No `name` in layout, but rankDir present (like example5/6 'BT'/'LR'),
    // and an explicit spacingFactor on the layout.
    const doc = `n1\n  n2\n=====\n${JSON.stringify({
      layout: { rankDir: "BT", spacingFactor: 3 },
      themeEditor: { ...PRISTINE_THEME_SNAPSHOT, layoutName: "klay" },
    })}\n=====`;

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    const te = result.meta.themeEditor as any;
    // CHARACTERIZATION: rankDir is silently lost (not migrated to `direction`)
    expect(te.rankDir).toBeUndefined();
    expect(te.direction).toBe(PRISTINE_THEME_SNAPSHOT.direction);
    expect(result.meta.layout).toBeUndefined();
    // name was empty so layoutName is preserved from the existing themeEditor
    expect(te.layoutName).toBe("klay");
    // spacingFactor is ALWAYS overwritten from the layout block (3 here)
    expect(te.spacingFactor).toBe(3);
  });

  test("legacy layout with NO spacingFactor defaults spacingFactor to the legacy default theme's spacingFactor", async () => {
    // CHARACTERIZATION + MUTATION HAZARD: the default for spacingFactor is
    // `theme.spacingFactor` read off the shared (possibly-already-mutated) object.
    // We assert it equals whatever theme.spacingFactor is RIGHT NOW.
    const currentDefault = theme.spacingFactor;
    const doc = `n1\n=====\n${JSON.stringify({
      layout: { name: "klay" },
      themeEditor: { ...PRISTINE_THEME_SNAPSHOT, spacingFactor: 99 },
    })}\n=====`;

    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });

    const te = result.meta.themeEditor as any;
    expect(te.layoutName).toBe("klay");
    // existing 99 is clobbered by the layout default (current theme.spacingFactor)
    expect(te.spacingFactor).toBe(currentDefault);
  });

  // ---------------------------------------------------------------------------
  // Unguarded JSON.parse -> promise rejects on malformed metadata
  // ---------------------------------------------------------------------------
  test("malformed ===== JSON block rejects the promise (unguarded JSON.parse)", async () => {
    const doc = `n1\n=====\n{ not valid json }\n=====`;
    await expect(
      prepareChart({ doc, details: initialDoc.details, set: false })
    ).rejects.toThrow();
  });

  test("malformed ¼▓╬ hidden block rejects the promise (unguarded JSON.parse)", async () => {
    const doc = `n1${HIDDEN_GRAPH_OPTIONS_DIVIDER}{ not valid json }`;
    await expect(
      prepareChart({ doc, details: initialDoc.details, set: false })
    ).rejects.toThrow();
  });

  test("trailing ===== with nothing after it parses as empty object (|| '{}' fallback)", async () => {
    // CHARACTERIZATION: parts[1] after the trailing delimiter is '' (falsy) so
    // it falls back to '{}' and does not throw.
    const doc = `n1\n  n2\n=====`;
    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });
    expect(result.text).toBe("n1\n  n2\n");
    // empty meta -> default backfill kicks in
    expect(result.meta.cytoscapeStyle).toBe(cytoscapeStyle);
  });

  // ---------------------------------------------------------------------------
  // parser key always stripped
  // ---------------------------------------------------------------------------
  test("`parser` key is always deleted from meta", async () => {
    const doc = `n1\n=====\n${JSON.stringify({
      parser: "v1",
      themeEditor: { ...PRISTINE_THEME_SNAPSHOT },
    })}\n=====`;
    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });
    expect(result.meta.parser).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Whitespace normalization: trim + exactly one trailing newline
  // ---------------------------------------------------------------------------
  test("many leading/trailing blank lines collapse to a single trailing newline", async () => {
    const doc = `\n\n\n   hello\n  to the: world   \n\n\n\n`;
    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });
    // CHARACTERIZATION: ${text.trim()}\n - leading whitespace and all trailing
    // blank lines removed, exactly one trailing newline added. Note trim()
    // also removes the leading spaces before "hello".
    expect(result.text).toBe(`hello\n  to the: world\n`);
  });

  // ---------------------------------------------------------------------------
  // Delimiter substring inside node text -> truncation landmine
  // ---------------------------------------------------------------------------
  test("CHARACTERIZATION: a node line equal to '=====' truncates the doc and throws when remainder is not JSON", async () => {
    // The string '=====' appears in node text BEFORE any real metadata block.
    // text is split on the first '=====', the remainder is treated as JSON,
    // and since 'after' is not valid JSON the promise REJECTS. This is a real,
    // lossy parsing landmine (a node literally named '=====' breaks the chart).
    const doc = `before\n=====\nafter`;
    await expect(
      prepareChart({ doc, details: initialDoc.details, set: false })
    ).rejects.toThrow();
  });

  test("CHARACTERIZATION: a node line equal to '=====' followed by valid JSON silently drops the trailing text", async () => {
    // Here the remainder after the (mis-detected) delimiter happens to be valid
    // JSON, so it is parsed as metadata and the 'after' content is LOST from text.
    const doc = `before\n=====\n${JSON.stringify({ note: "eaten" })}`;
    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });
    expect(result.text).toBe("before\n");
    expect(result.meta.note).toBe("eaten");
  });

  test("CHARACTERIZATION: a leading '~~~' block in user content is consumed as YAML frontmatter", async () => {
    const doc = `~~~\nfoo: bar\n~~~\nreal content here\n  child`;
    const result = await prepareChart({
      doc,
      details: initialDoc.details,
      set: false,
    });
    // the leading ~~~ block is parsed as YAML frontmatter and stripped from text
    expect(result.text).toBe("real content here\n  child\n");
    expect(result.meta.foo).toBe("bar");
  });

  // ---------------------------------------------------------------------------
  // SHARED DEFAULT THEME — the default-theme backfill now assigns a CLONE of the
  // imported `theme` object, so legacy-layout migration can no longer mutate the
  // shared import or leak across calls.
  // ---------------------------------------------------------------------------
  test("legacy-layout migration does NOT mutate the shared imported default theme and does NOT leak into a later default chart", async () => {
    // Confirm the import is pristine right before we run the migration.
    expect(theme.layoutName).toBe(PRISTINE_LAYOUT_NAME);
    expect(theme.spacingFactor).toBe(PRISTINE_SPACING_FACTOR);

    // Chart 1: legacy `layout` present AND themeEditor defaulted (no themeEditor
    // in meta) -> prepareChart assigns meta.themeEditor = { ...theme } (a CLONE)
    // and then mutates layoutName/spacingFactor only on that clone.
    const chart1 = await prepareChart({
      doc: `n1\n=====\n${JSON.stringify({
        layout: { name: "cose", spacingFactor: 5 },
      })}\n=====`,
      details: initialDoc.details,
      set: false,
    });
    expect((chart1.meta.themeEditor as any).layoutName).toBe("cose");
    expect((chart1.meta.themeEditor as any).spacingFactor).toBe(5);

    // The shared module-level `theme` object is UNCHANGED (still pristine).
    expect(theme.layoutName).toBe(PRISTINE_LAYOUT_NAME);
    expect(theme.spacingFactor).toBe(PRISTINE_SPACING_FACTOR);

    // Chart 2: a plain default chart with no metadata. It assigns a fresh CLONE
    // of the pristine theme, so it gets the default 'dagre' / 1.1 values — the
    // earlier migration did NOT leak across calls.
    const chart2 = await prepareChart({
      doc: `just text`,
      details: initialDoc.details,
      set: false,
    });
    expect((chart2.meta.themeEditor as any).layoutName).toBe(
      PRISTINE_LAYOUT_NAME
    );
    expect((chart2.meta.themeEditor as any).spacingFactor).toBe(
      PRISTINE_SPACING_FACTOR
    );
    // chart1 and chart2 themeEditor are DISTINCT objects (each a fresh clone),
    // and neither is the shared import.
    expect(chart2.meta.themeEditor).not.toBe(chart1.meta.themeEditor);
    expect(chart2.meta.themeEditor).not.toBe(theme);
    expect(chart1.meta.themeEditor).not.toBe(theme);
  });
});
