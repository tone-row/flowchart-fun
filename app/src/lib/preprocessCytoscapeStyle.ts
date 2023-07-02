import { CSSProperties } from "react";
import { useQueries } from "react-query";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Create a zustand store to hold imports requested by styles
 * and any other artifacts of processing styles
 */
export const useProcessStyleStore = create<{
  styleImports: string[];
  fontData: CSSProperties;
  variables: Record<string, string>;
}>()(
  devtools(
    (_set) => ({
      styleImports: [],
      fontData: {},
      variables: {},
    }),
    {
      name: "useStyleImports",
    }
  )
);

/**
 * a function which adds a style import if it isn't already in the list
 */
export function addStyleImports(urls: string[]) {
  useProcessStyleStore.setState(({ styleImports }) => {
    const newImports = [...styleImports];
    for (const url of urls) {
      if (!newImports.includes(url)) {
        newImports.push(url);
      }
    }
    return { styleImports: newImports };
  });
}

/**
 * Takes the users cytoscape style and pulls off any font imports
 * and makes sure they are enqued to load, before the style hits cytoscape
 */
export function preprocessCytoscapeStyle(style: string) {
  const importRegex = /@import\s+url\(['"]([^'"]+)['"]\);/;
  const imports = [];
  let match = style.match(importRegex);
  while (match) {
    imports.push(match[1]);
    // remove the import from the style
    style = style.replace(match[0], "");
    // find the next import
    match = style.match(importRegex);
  }
  // add the imports to the store
  addStyleImports(imports);

  // get font data
  const fontData = findFontData(style);

  // process variables
  const { updatedScss, variables } = processScss(style);

  // set font data
  useProcessStyleStore.setState({ fontData, variables });

  return { style: updatedScss, imports, variables };
}

interface FontFaceDescriptor {
  [key: string]: string;
}

interface FontFaceInput {
  fontFamily: string;
  src: string;
  descriptors: FontFaceDescriptor;
}

/**
 * Reads a CSS string and parses the font-face rules in it
 */
function parseFontFaces(cssString: string): FontFaceInput[] {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssString);

  const fontFaces: FontFaceInput[] = [];

  for (const rule of styleSheet.cssRules) {
    if (rule.constructor.name === "CSSFontFaceRule") {
      if (!isCSSStyleRule(rule)) continue;
      const fontFace: FontFaceInput = {
        fontFamily: rule.style.getPropertyValue("font-family"),
        src: rule.style.getPropertyValue("src"),
        descriptors: {},
      };

      for (let i = 0; i < rule.style.length; i++) {
        const property = rule.style[i];
        if (property !== "font-family" && property !== "src") {
          fontFace.descriptors[sanitizeDescriptorName(property)] =
            rule.style.getPropertyValue(property);
        }
      }

      fontFaces.push(fontFace);
    }
  }

  return fontFaces;
}

/**
 * The descriptors in a CSS font-face rule are hyphenated, but the
 * FontFace API expects them to be camelCase
 */
function sanitizeDescriptorName(name: string): string {
  if (name.startsWith("font-")) {
    name = name.slice(5);
  }

  return name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

function isCSSStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return "style" in rule;
}

/**
 * Loads fonts using the FontFace API
 */
async function loadFonts(fonts: FontFaceInput[]): Promise<void> {
  const fontPromises: Promise<FontFace>[] = [];

  for (const font of fonts) {
    const fontFace = new FontFace(font.fontFamily, font.src, font.descriptors);
    fontPromises.push(fontFace.load());
  }

  await Promise.all(fontPromises);
}

/**
 * Takes a CSS Url or string and loads the fonts from it
 */
async function loadFontsFromCSS(url: string): Promise<void> {
  const response = await fetch(url);
  const cssString = await response.text();
  const fontFaces = parseFontFaces(cssString);
  await loadFonts(fontFaces);
}

/**
 * A hook which loads all the fonts from the style imports
 */
export function useCytoscapeStyleImports() {
  const { styleImports } = useProcessStyleStore();
  return useQueries(
    styleImports.map((url) => ({
      queryKey: ["styleImport", url],
      queryFn: () => loadFontsFromCSS(url),
      enabled: !!url,
      suspense: true,
      cacheTime: Infinity,
      staleTime: Infinity,
    }))
  );
}

function findFontData(cssString: string) {
  // Create a new CSSStyleSheet and add the CSS rules from the style element
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssString);

  const styleRules = Array.from(sheet.cssRules).filter(
    (r) => r.constructor.name === "CSSStyleRule"
  ) as CSSStyleRule[];

  // Get the CSS rule for the specified selector
  const rule = styleRules.find((r) => r.selectorText === "node");

  if (!rule) return {};

  // Get the font-related properties from the rule
  const fontData = {
    fontFamily: rule.style.fontFamily,
    fontWeight: rule.style.fontWeight,
    fontStyle: rule.style.fontStyle,
    fontSize: rule.style.fontSize,
    lineHeight: rule.style.lineHeight,
    letterSpacing: rule.style.letterSpacing,
    wordSpacing: rule.style.wordSpacing,
    textTransform: rule.style.textTransform,
    textDecoration: rule.style.textDecoration,
    textAlign: rule.style.textAlign,
    whiteSpace: rule.style.whiteSpace,
  };

  // delete any properties that are empty strings
  for (const key in fontData) {
    if (fontData[key as keyof typeof fontData] === "") {
      delete fontData[key as keyof typeof fontData];
    }
  }

  // Return the font-related data
  return fontData;
}

/** Reads any unindented scss-style variables and replaces them throughout the rest of the css */
function processScss(scss: string): {
  updatedScss: string;
  variables: { [key: string]: string };
} {
  // Create an object to store the variables
  const variables: { [key: string]: string } = {};

  // Split the SCSS into lines
  const lines = scss.split("\n");

  // Filter out the variable declarations and store them in the variables object
  const updatedLines = lines.filter((line) => {
    const match = line.match(/^\$([a-z0-9-_]+):\s*(.+);$/i);
    if (match) {
      variables[match[1]] = match[2];
      return false;
    }
    return true;
  });

  // Replace references to the variables with their values
  const updatedScss = updatedLines
    .map((line) => {
      for (const variable in variables) {
        const regex = new RegExp(`\\$${variable}`, "g");
        line = line.replace(regex, variables[variable]);
      }
      return line;
    })
    .join("\n");

  return { updatedScss, variables };
}
