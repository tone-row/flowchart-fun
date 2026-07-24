/**
 * Pre-renders each picker font's name as an SVG path so the theme editor can
 * PREVIEW fonts without loading the font files themselves. Run after adding
 * or renaming a picker font in src/lib/fonts.ts:
 *
 *   pnpm -F app font:previews
 *
 * Output: public/font-previews/{slug}.svg (slug matches the /fonts/{slug}.css
 * name used in the font's importSnippet).
 */
import path from "path";
import fs from "fs";
import opentype from "opentype.js";

const __dirname = path.dirname(import.meta.url.slice(7));
const fontsDir = path.join(__dirname, "../public/fonts");
const outDir = path.join(__dirname, "../public/font-previews");

/** display name -> the file whose glyphs best represent the family */
const PREVIEW_SOURCES = {
  Satoshi: "Satoshi-Regular.otf",
  "General Sans": "GeneralSans-Medium.otf",
  "Public Sans": "PublicSans-Medium.otf",
  "Hubot Sans": "HubotSans-Medium.otf",
  "Open Runde": "OpenRunde-Medium.otf",
  "Cabinet Grotesk": "CabinetGrotesk-Medium.otf",
  Switzer: "Switzer-Medium.otf",
  "Shantell Sans": "ShantellSans-wght.ttf",
};

const FONT_SIZE = 28;
const BASELINE = 28;
const HEIGHT = 38;

const r = (n) => (Number.isFinite(n) ? +n.toFixed(2) : 0);
function serialize(commands) {
  return commands
    .map((c) => {
      switch (c.type) {
        case "M":
          return `M${r(c.x)} ${r(c.y)}`;
        case "L":
          return `L${r(c.x)} ${r(c.y)}`;
        case "C":
          return `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}`;
        case "Q":
          return `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`;
        case "Z":
          return "Z";
        default:
          return "";
      }
    })
    .join("");
}

fs.mkdirSync(outDir, { recursive: true });

for (const [name, file] of Object.entries(PREVIEW_SOURCES)) {
  const buf = fs.readFileSync(path.join(fontsDir, file));
  const font = opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  );
  // Compose glyph-by-glyph (charToGlyph + kerning) instead of font.getPath:
  // string shaping can route through GSUB alternates whose charstrings
  // opentype.js fails to extract (observed with handwriting fonts — letters vanished).
  const scale = FONT_SIZE / font.unitsPerEm;
  let x = 1;
  let d = "";
  let prev = null;
  for (const ch of name) {
    const glyph = font.charToGlyph(ch);
    if (prev) x += font.getKerningValue(prev, glyph) * scale;
    const p = glyph.getPath(x, BASELINE, FONT_SIZE);
    // Serialize by hand: opentype's Path.toPathData() can emit a literal
    // NaN at certain coordinate offsets (seen with a handwriting font's "i" dot), and a
    // single invalid token makes SVG parsers drop the REST of the path.
    d += serialize(p.commands);
    x += glyph.advanceWidth * scale;
    prev = glyph;
  }
  const width = Math.ceil(x) + 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${HEIGHT}" height="${HEIGHT}"><path d="${d}" fill="#0f172a"/></svg>\n`;
  const slug = file.replace(/-[^-]+\.(otf|ttf)$/, "").replace(/-/g, "");
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg);
  console.log(`✅ ${name} -> font-previews/${slug}.svg (${width}px)`);
}
