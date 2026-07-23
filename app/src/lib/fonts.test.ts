import fs from "fs";
import path from "path";
import { fonts, legacyFonts, allFonts } from "./fonts";
import { toTheme } from "./toTheme";
import { theme as defaultTheme } from "./templates/default-template";

describe("picker fonts", () => {
  test.each(fonts.map((f) => [f.name, f] as const))(
    "%s has a live preview asset and a self-hosted css file",
    (_name, font) => {
      expect(font.preview).toBeDefined();
      const previewPath = path.join(__dirname, "../../public", font.preview!);
      expect(fs.existsSync(previewPath)).toBe(true);

      const cssMatch = font.importSnippet.match(/url\('(\/fonts\/[^']+)'\)/);
      expect(cssMatch).not.toBeNull();
      const cssPath = path.join(__dirname, "../../public", cssMatch![1]);
      expect(fs.existsSync(cssPath)).toBe(true);

      // every binary the css references must exist too
      const css = fs.readFileSync(cssPath, "utf8");
      const srcs = [...css.matchAll(/url\('(\/fonts\/[^']+)'\)/g)].map(
        (m) => m[1]
      );
      expect(srcs.length).toBeGreaterThan(0);
      for (const src of srcs) {
        expect({
          src,
          exists: fs.existsSync(path.join(__dirname, "../../public", src)),
        }).toEqual({ src, exists: true });
      }
    }
  );
});

describe("legacy fonts (backward compatibility)", () => {
  /**
   * Existing customer charts have these font names baked into their
   * meta.themeEditor. They may leave the picker, but the name -> import
   * mapping must keep working or those charts silently change fonts.
   */
  const REQUIRED_LEGACY = [
    "IBM Plex Sans",
    "Inclusive Sans",
    "Space Grotesk",
    "Onest",
    "Overpass",
    "Kalam",
    "Nanum Pen Script",
    "REM",
  ];

  test("every historical font name is still loadable", () => {
    const names = allFonts.map((f) => f.name);
    for (const name of REQUIRED_LEGACY) {
      expect(names).toContain(name);
    }
  });

  test.each(REQUIRED_LEGACY)(
    "toTheme still prepends the @import for %s",
    (name) => {
      const { style } = toTheme({ ...defaultTheme, fontFamily: name });
      expect(style.startsWith("@import url(")).toBe(true);
      expect(style).toContain(
        allFonts.find((f) => f.name === name)!.importSnippet
      );
    }
  );

  test("no duplicate names across picker and legacy lists", () => {
    const names = allFonts.map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("legacy fonts are not offered in the picker", () => {
    const pickerNames = new Set(fonts.map((f) => f.name));
    for (const legacy of legacyFonts) {
      expect(pickerNames.has(legacy.name)).toBe(false);
    }
  });
});
