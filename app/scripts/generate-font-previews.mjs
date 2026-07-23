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
  Satoshi: "Satoshi-Variable.ttf",
  "General Sans": "GeneralSans-Medium.otf",
  "Public Sans": "PublicSans-Medium.otf",
  "Hubot Sans": "HubotSans-Medium.otf",
  "Open Runde": "OpenRunde-Medium.otf",
  "Cabinet Grotesk": "CabinetGrotesk-Medium.otf",
  Switzer: "Switzer-Medium.otf",
  Skriva: "Skriva-Regular.otf",
};

const FONT_SIZE = 28;
const BASELINE = 28;
const HEIGHT = 38;

fs.mkdirSync(outDir, { recursive: true });

for (const [name, file] of Object.entries(PREVIEW_SOURCES)) {
  const buf = fs.readFileSync(path.join(fontsDir, file));
  const font = opentype.parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  );
  const advance = font.getAdvanceWidth(name, FONT_SIZE);
  const d = font.getPath(name, 1, BASELINE, FONT_SIZE).toPathData(2);
  const width = Math.ceil(advance) + 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${HEIGHT}" height="${HEIGHT}"><path d="${d}" fill="#0f172a"/></svg>\n`;
  const slug = file.replace(/-[^-]+\.(otf|ttf)$/, "").replace(/-/g, "");
  fs.writeFileSync(path.join(outDir, `${slug}.svg`), svg);
  console.log(`✅ ${name} -> font-previews/${slug}.svg (${width}px)`);
}
