import { CSSProperties } from "react";
import { useQuery } from "react-query";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { useUnmountStore } from "./useUnmountStore";

(async () => {
  try {
    new CSSStyleSheet();
  } catch (err) {
    await import("construct-style-sheets-polyfill");
    console.log("CSSStyleSheet polyfill loaded");
  }
})();

/**
 * Create a zustand store to hold imports requested by styles
 * and any other artifacts of processing styles
 */
export const useProcessStyleStore = create<{
  styleImports: string[];
  fontData: CSSProperties;
  variables: Record<string, string>;
  /**
   * Dynamic Classes that can be added to childless nodes, found in stylesheet
   */
  dynamicClassesChildless: string[];
  /**
   * Dyanmic classes for edges
   */
  dynamicClassesEdges: string[];
  /**
   * Dynamic classes for parent nodes
   */
  dynamicClassesParent: string[];
}>()(
  devtools(
    (_set) => ({
      styleImports: [],
      fontData: {},
      variables: {},
      dynamicClassesChildless: [],
      dynamicClassesEdges: [],
      dynamicClassesParent: [],
    }),
    {
      name: "useStyleImports",
    }
  )
);

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

  const dynamicClassRegex = /^:childless\.(?<class>[a-zA-Z][\w-]*_[\w-]+)/gm;
  const dynamicClassesChildless = [];
  let dynamicClassMatch = dynamicClassRegex.exec(style);
  while (dynamicClassMatch) {
    if (dynamicClassMatch.groups?.class)
      dynamicClassesChildless.push(dynamicClassMatch.groups?.class);
    dynamicClassMatch = dynamicClassRegex.exec(style);
  }

  const dynamicClassRegexEdges = /^edge\.(?<class>[a-zA-Z][\w-]*_[\w-]+)/gm;
  const dynamicClassesEdges = [];
  let dynamicClassMatchEdges = dynamicClassRegexEdges.exec(style);
  while (dynamicClassMatchEdges) {
    if (dynamicClassMatchEdges.groups?.class)
      dynamicClassesEdges.push(dynamicClassMatchEdges.groups?.class);
    dynamicClassMatchEdges = dynamicClassRegexEdges.exec(style);
  }

  const dynamicClassRegexParent = /^:parent\.(?<class>[a-zA-Z][\w-]*_[\w-]+)/gm;
  const dynamicClassesParent = [];
  let dynamicClassMatchParent = dynamicClassRegexParent.exec(style);
  while (dynamicClassMatchParent) {
    if (dynamicClassMatchParent.groups?.class)
      dynamicClassesParent.push(dynamicClassMatchParent.groups?.class);
    dynamicClassMatchParent = dynamicClassRegexParent.exec(style);
  }

  // add the imports to the store
  useProcessStyleStore.setState({ styleImports: imports });

  // get font data
  const fontData = findFontData(style);

  // process variables
  const { updatedScss, variables } = processScss(style);

  // set font data
  useProcessStyleStore.setState({
    fontData,
    variables,
    dynamicClassesChildless,
    dynamicClassesEdges,
    dynamicClassesParent,
  });

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
 * for loading with the FontFace API
 */
function parseFontFaces(cssString: string): FontFaceInput[] {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssString);

  const fontFaces: FontFaceInput[] = [];

  for (const rule of styleSheet.cssRules) {
    if (rule.constructor.name === "CSSFontFaceRule") {
      if (!isCSSStyleRule(rule)) continue;
      const fontFace: FontFaceInput = {
        fontFamily: sanitizeFontFamily(
          rule.style.getPropertyValue("font-family")
        ),
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
async function loadFonts(fonts: FontFaceInput[]) {
  const fontPromises: Promise<FontFace>[] = [];

  for (const font of fonts) {
    const fontFace = new FontFace(font.fontFamily, font.src, font.descriptors);
    fontPromises.push(
      (async () => {
        // Wait for the font to be loaded
        await fontFace.load();
        // Add the font to the document
        document.fonts.add(fontFace);
        return fontFace;
      })()
    );
  }

  return Promise.all(fontPromises);
}

/**
 * Takes a CSS Url and loads the fonts from it
 */
async function loadFontsFromCSS(url: string): Promise<void> {
  const response = await fetch(url);
  const cssString = await response.text();
  const fontFaces = parseFontFaces(cssString);
  await loadFonts(fontFaces);
}

/**
 * A hook which loads all the fonts from the style imports found in the theme css
 */
export function useCytoscapeStyleImports() {
  const { styleImports } = useProcessStyleStore();
  return useQuery({
    queryKey: ["importStyle", ...styleImports],
    queryFn: async () => await Promise.all(styleImports.map(loadFontsFromCSS)),
    suspense: true,
    cacheTime: Infinity,
    staleTime: Infinity,
    onSuccess: () => {
      useUnmountStore.setState({
        unmount: true,
      });
    },
  });
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
  for (const fontDataKey in fontData) {
    const value = fontData[fontDataKey as keyof typeof fontData];

    // sanitize the font family
    if (fontDataKey === "fontFamily") {
      fontData[fontDataKey as keyof typeof fontData] =
        sanitizeFontFamily(value);
    }

    if (value === "") {
      delete fontData[fontDataKey as keyof typeof fontData];
    }
  }

  // Return the font-related data
  return fontData;
}

/**
 * Font Family names are often quoted or even quoted and escaped
 * so we need to remove all of that when we load the font into the
 * document and when we extract the font data for use in our
 * resizer
 */
function sanitizeFontFamily(fontFamily: string) {
  // if there is no single or double quote in the string, return it as is
  if (!/["']/.test(fontFamily)) return fontFamily;

  // Sometimes font fontFamily is quoted like "\"Gloria Hallelujah\""
  // make sure we have an unquoted string
  return JSON.parse(fontFamily).replace(/"/g, "");
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
