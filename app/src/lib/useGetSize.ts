/* eslint-disable no-empty */
import { useCallback } from "react";

import { Theme } from "./themes/constants";

export type TGetSize = ReturnType<typeof useGetSize>;

// returns getSize based on theme to determine node size
export function useGetSize(theme: Theme) {
  return useCallback(
    (label: string, classes: string[]) => {
      const resizer = document.getElementById("resizer");
      if (resizer) {
        const text = preventCyRenderingBugs(label);
        // We have to write styles imperatively otherwise we get race conditions
        const style = {
          "max-width": `${getWidth(text.length)}px`,
          "font-size": `${
            theme.font?.fontSize ? 1.27 * theme.font.fontSize : 10
          }px`,
          "line-height": theme.font?.lineHeight,
          "font-family": theme.font?.fontFamily,
        };
        resizer.setAttribute(
          "style",
          `${Object.entries(style)
            .map(([key, value]) => `${key}: ${value};`)
            .join(" ")}`
        );
        resizer.innerHTML = decodeURIComponent(text);

        if (resizer.firstChild) {
          const range = document.createRange();
          range.selectNodeContents(resizer.firstChild);
          const width = Array.from(range.getClientRects()).reduce(
            (max, { width }) => (width > max ? width : max),
            0
          );
          const finalSize: Record<string, any> = {
            width,
            shapeWidth: width,
            height: resizer.clientHeight,
            shapeHeight: resizer.clientHeight,
            textMarginY: 0,
            textMarginX: 0,
          };

          if (classes.includes("circle")) {
            console.log(finalSize);
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
            finalSize.textMarginY = 2;
            finalSize.textMarginX = 4;
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
            finalSize.textMarginY = 0.125 * finalSize.height;
            finalSize.shapeHeight = finalSize.shapeWidth =
              1.4 *
              (finalSize.shapeHeight > finalSize.shapeWidth
                ? finalSize.shapeHeight
                : finalSize.shapeWidth);
          } else if (classes.includes("vee")) {
            finalSize.shapeWidth = finalSize.width * 2.5;
            finalSize.shapeHeight = finalSize.height * 2.5;
            finalSize.textMarginY = 0.01 * finalSize.shapeHeight;
          } else if (classes.includes("rhomboid")) {
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
      return undefined;
    },
    [theme]
  );
}

const A = -38.614819;
const B = 33.8993;
/**
 * Grow text width based on number of characters
 */
export function getWidth(characters: number) {
  return Math.max(64, Math.ceil(B * Math.log(characters) + A));
}

export function preventCyRenderingBugs(str: string) {
  return (
    str
      // prevent break on hypen
      .replace(/-/gm, "&#x2011;")
      // prevent break on chinese comma
      .replace(/，/gm, "&#x2011;")
  );
}
