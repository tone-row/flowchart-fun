import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#05080C",
  white: "#FEFEFE",
  green: "#CAD553",
  yellow: "#F6D883",
  blue: "#1f75ff",
  orange: "#EC7957",
  purple: "#946ded",
  red: "#e33645",
  gray: "#cacaca",
};

const fontFamily = "Permanent Marker";
const backgroundColor = colors.white;
const arrowColor = "rgb(163, 184, 186)";
const lineHeight = 1.2;
const padding = 5;
const borderWidth = 1.88;

const comicBook: Theme = {
  value: "comic-book",
  bg: backgroundColor,
  fg: colors.black,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "PermanentMarker-Regular.woff2" }],
  },
  colors,
  styles: [
    {
      selector: "node[label!='']",
      style: {
        width: "data(shapeWidth)",
        height: "data(shapeHeight)",
        "text-margin-y": "data(textMarginY)" as any,
        "text-margin-x": "data(textMarginX)" as any,
      },
    },
    {
      selector: "node",
      style: {
        "background-color": colors.yellow,
        "font-family": fontFamily,
        color: colors.black,
        "text-margin-y": -1,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "rectangle",
        // @ts-ignore
        padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        "border-color": colors.black,
      },
    },
    {
      selector: "edge",
      style: {
        // @ts-ignore
        "curve-style": "straight-triangle",
        width: borderWidth * 9,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.black,
        "line-opacity": 0.5,
        "source-endpoint": "inside-to-node",
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 0,
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": 0,
        "target-distance-from-node": 0,
        "edge-distances": "intersection",
      },
    },
    {
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-halign": "center",
        // @ts-ignore
        "text-margin-y": `-${padding}`,
        "text-wrap": "none",
      },
    },
    ...Object.entries(colors).map<StylesheetStyle>(([color, value]) => ({
      selector: `node.${color}`,
      style: {
        "background-color": `${value}`,
        ...(["black", "purple", "blue"].includes(color)
          ? { color: colors.white }
          : { color: colors.black }),
      },
    })),
  ],
};

export default comicBook;
