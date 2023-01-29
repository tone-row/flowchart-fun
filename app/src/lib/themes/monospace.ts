import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  red: "#ff1457",
  orange: "#FC7427",
  blue: "#9CADFF",
  black: "#14141C",
  white: "#ffffff",
  green: "#58ac39",
  yellow: "#efe60b",
  gray: "#dfe7cf",
  purple: "#b87aff",
};

const darkBlue = "#9AADFD";
const fontFamily = '"Fira Mono", monospace';
const lineHeight = 1.1;
const padding = "5px";

const edgeWidth = 2;
const monospace: Theme = {
  value: "monospace",
  bg: colors.black,
  fg: colors.blue,
  minHeight: 0,
  minWidth: 0,
  font: {
    fontFamily,
    files: [{ url: "FiraMono-Regular.woff2", name: "Fira Mono" }],
    lineHeight,
    fontSize: defaultFontSize,
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
        "font-family": fontFamily,
        label: "data(label)",
        color: colors.blue,
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "line-height": lineHeight,
        "text-justification": "center",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        backgroundColor: colors.black,
        "border-color": colors.blue,
        "border-width": edgeWidth,
        "border-opacity": 1,
        shape: "rectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "segments",
        opacity: 1,
        width: edgeWidth,
        label: "data(label)",
        color: colors.blue,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": colors.blue,
        "target-distance-from-node": 5,
        "source-distance-from-node": 5,
        "arrow-scale": 1.25,
        "text-background-shape": "roundrectangle",
        "text-background-color": colors.black,
        "text-background-opacity": 1,
        "text-background-padding": "2px",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // @ts-ignore
        "line-gradient-stop-colors": `${darkBlue} ${colors.blue}`,
        // @ts-ignore
        "line-gradient-stop-positions": "0% 100%",
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
      selector: `.${color}`,
      style: {
        "border-color": `${value}`,
        color: color === "black" ? colors.white : `${value}`,
      },
    })),
  ],
};

export default monospace;
