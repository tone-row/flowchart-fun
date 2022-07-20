// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Theme } from "./constants";

const colors = {
  black: "#333333",
  white: "#FEFFFD",
  green: "#6ADB7C",
  yellow: "#FCFE3B",
  blue: "#1CFEFE",
  orange: "#EC7957",
  purple: "#7842ED",
  red: "#E65BC9",
  gray: "#cacaca",
};

const fontFamily = "Murrx";
const fontSize = 10;
const backgroundColor = "#050A08";
const arrowColor = colors.purple;
const lineHeight = 1.2;
const padding = 1;
const borderWidth = 1.88;

const cyberpunk: Theme = {
  value: "cyberpunk",
  bg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
    // files: [{ name: fontFamily, url: "Sporting_Grotesque-Regular_web.woff2" }],
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
        "background-color": backgroundColor,
        "background-opacity": 0.5,
        "font-family": fontFamily,
        "font-size": fontSize,
        "border-color": arrowColor,
        color: colors.green,
        "text-justification": "left",
        // "text-margin-y": -1,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        // "text-shadow-color": "#ffffff",
        // "text-shadow-blur": 2,
        // "text-shadow-opacity": 0.5,
        // "text-shadow-offset-x": 3,
        // "text-shadow-offset-y": 3,
        shape: "rectangle",
        padding: padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": 0,
        "border-color": backgroundColor,
        // ghost: "yes",
        // "ghost-opacity": 0.5,
        // "ghost-offset-x": 2,
        // "ghost-offset-y": 2,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "taxi",
        width: borderWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.green,
        "source-endpoint": "inside-to-node",
        "font-size": fontSize,
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": colors.black, // "#D09A5B",
        // "text-background-color": colors.blue, // "#D09A5B",
        "text-background-padding": "2px",
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
    ...Object.entries(colors).map<Stylesheet>(([color, value]) => ({
      selector: `node.${color}`,
      style: {
        color: `${value}`,
        // ...(["black", "purple", "blue"].includes(color)
        //   ? { color: colors.white }
        //   : { color: colors.black }),
      },
    })),
  ],
};

export default cyberpunk;
