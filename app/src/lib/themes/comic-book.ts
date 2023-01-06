// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Theme } from "./constants";

const colors = {
  black: "#05080C",
  white: "#FEFEFE",
  green: "#CAD553",
  yellow: "#F6D883",
  blue: "#1f75ff",
  orange: "#EC7957",
  purple: "#3e2bef",
  red: "#e33645",
  gray: "#cacaca",
};

const fontFamily = "Permanent Marker";
const fontSize = 10;
const backgroundColor = colors.white;
const arrowColor = "#6BE8F2";
const lineHeight = 1.2;
const padding = 5;
const borderWidth = 1.88;

const comicBook: Theme = {
  value: "comic-book",
  bg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "PermanentMarker-Regular.woff2" }],
  },
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
        "font-size": fontSize,
        "border-color": arrowColor,
        color: colors.black,
        "text-justification": "left",
        "text-margin-y": -1,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "rectangle",
        padding: padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        "border-color": colors.black,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "straight-triangle",
        width: borderWidth * 9,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.black,
        "source-endpoint": "inside-to-node",
        "font-size": fontSize,
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 0,
        // "text-background-color": colors.black, // "#D09A5B",
        // "text-background-color": colors.blue, // "#D09A5B",
        // "text-background-padding": "2px",
        // "text-background-shape": "roundrectangle",
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": 0,
        "target-distance-from-node": 0,
        // "target-arrow-shape": "vee",
        // "target-arrow-color": colors.blue,
        // "source-arrow-shape": "circle",
        // "source-arrow-color": arrowColor,
        // "arrow-scale": 1,
        "edge-distances": "intersection",
        // Edge
        // "underlay-color": "#000000",
        // "underlay-padding": 3.5,
        // "underlay-opacity": 1,
        // "underlay-shape": "roundrectangle",
      },
    },
    {
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": `-${padding}`,
      },
    },
    ...Object.entries(colors).map<Stylesheet>(([color, value]) => ({
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
