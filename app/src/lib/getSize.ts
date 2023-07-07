import { useProcessStyleStore } from "./preprocessCytoscapeStyle";

export type TGetSize = ReturnType<typeof getSize>;

export const fontSizeScalars = {
  "text-sm": 0.75,
  "text-base": 1,
  "text-lg": 1.5,
  "text-xl": 2,
};

// Somehow this corresponds to a healthy cytoscape size but I have no idea how
const MAGIC_SCALAR = 1.27;

// returns getSize based on theme to determine node size
export function getSize(label: string, classes: string[]) {
  const resizer = document.getElementById("resizer");
  const fontData = useProcessStyleStore.getState().fontData;

  if (!resizer) {
    return {
      width: "label",
      height: "label",
    };
  }

  const text = preventCyRenderingBugs(label);
  const isSmall = classes.includes("text-sm");
  const isLarge = classes.includes("text-lg");
  const isXLarge = classes.includes("text-xl");
  const scaleFontSize = isSmall
    ? "text-sm"
    : isLarge
    ? "text-lg"
    : isXLarge
    ? "text-xl"
    : "text-base";

  const fontSize: number = fontData["fontSize"]
    ? typeof fontData["fontSize"] === "number"
      ? fontData["fontSize"]
      : parseInt(fontData["fontSize"], 10)
    : 10;

  // We have to write styles imperatively otherwise we get race conditions
  const style = {
    "max-width": `${getWidth(text.length)}px`,
    ...fontData,
    "font-size": `${
      MAGIC_SCALAR * fontSize * fontSizeScalars[scaleFontSize]
    }px`,
  };
  resizer.setAttribute(
    "style",
    `${Object.entries(style)
      .map(([key, value]) => `${camelToKebabCase(key)}: ${value};`)
      .join(" ")}`
  );

  resizer.innerHTML = text;

  if (resizer.firstChild) {
    const range = document.createRange();
    range.selectNodeContents(resizer.firstChild);
    const width = Array.from(range.getClientRects()).reduce(
      (max, { width }) => (width > max ? width : max),
      0
    );
    const finalSize = {
      width,
      shapeWidth: width,
      height: resizer.clientHeight,
      shapeHeight: resizer.clientHeight,
      textMarginY: 0,
      textMarginX: 0,
    };

    if (classes.includes("circle")) {
      if (finalSize.height > finalSize.width) {
        finalSize.width =
          finalSize.shapeWidth =
          finalSize.shapeHeight =
            finalSize.height;
      } else {
        finalSize.height =
          finalSize.shapeWidth =
          finalSize.shapeHeight =
            finalSize.width;
      }
    } else if (
      classes.includes("triangle") ||
      classes.includes("round-triangle")
    ) {
      finalSize.shapeWidth = 2.2 * finalSize.width;
      finalSize.shapeHeight = 1.25 * finalSize.height;
      finalSize.textMarginY = 0.18 * finalSize.shapeHeight;
    } else if (
      classes.includes("diamond") ||
      classes.includes("round-diamond")
    ) {
      finalSize.shapeWidth = finalSize.width * 1.5;
      finalSize.shapeHeight = finalSize.height * 1.5;
      finalSize.textMarginY = 0;
      finalSize.textMarginX = 0;
    } else if (
      classes.includes("pentagon") ||
      classes.includes("round-pentagon")
    ) {
      finalSize.shapeWidth = 1.35 * finalSize.width;
      finalSize.textMarginY = 0.1 * finalSize.shapeHeight;
    } else if (
      classes.includes("hexagon") ||
      classes.includes("round-hexagon")
    ) {
      finalSize.shapeWidth = 1.5 * finalSize.width;
    } else if (
      classes.includes("heptagon") ||
      classes.includes("round-heptagon")
    ) {
      finalSize.shapeWidth = 1.5 * finalSize.width;
      finalSize.textMarginY = 0.05 * finalSize.shapeHeight;
    } else if (
      classes.includes("octagon") ||
      classes.includes("round-octagon")
    ) {
      finalSize.shapeWidth = 1.25 * finalSize.width;
    } else if (classes.includes("star")) {
      finalSize.textMarginY = 0.13 * finalSize.height;
      finalSize.shapeHeight = finalSize.shapeWidth =
        1.4 *
        (finalSize.shapeHeight > finalSize.shapeWidth
          ? finalSize.shapeHeight
          : finalSize.shapeWidth);
    } else if (classes.includes("vee")) {
      finalSize.shapeWidth = finalSize.width * 2.5;
      finalSize.shapeHeight = finalSize.height * 2.5;
      finalSize.textMarginY = 0.01 * finalSize.shapeHeight;
    } else if (
      classes.includes("rhomboid") ||
      classes.includes("right-rhomboid")
    ) {
      finalSize.shapeWidth = finalSize.width * 2;
    } else if (classes.includes("tag") || classes.includes("round-tag")) {
      finalSize.shapeWidth = finalSize.width * 1.25;
      finalSize.textMarginX = -0.1 * finalSize.shapeWidth;
    } else if (classes.includes("concave-hexagon")) {
      finalSize.shapeWidth = finalSize.width * 1.5;
    }
    return finalSize;
  }
}

const A = -38.614819;
const B = 33.8993;
/**
 * Grow text width based on number of characters
 */
function getWidth(characters: number) {
  return Math.max(64, Math.ceil(B * Math.log(characters) + A));
}

function preventCyRenderingBugs(str: string) {
  return (
    str
      // prevent break on hypen
      .replace(/-/gm, "&#x2011;")
      // prevent break on chinese comma
      .replace(/，/gm, "&#x2011;")
  );
}

function camelToKebabCase(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}
