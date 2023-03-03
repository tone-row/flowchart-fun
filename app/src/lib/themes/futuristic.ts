import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#05080C",
  white: "#E6E6E6",
  green: "#1FAC30",
  yellow: "#E2FC43",
  blue: "#2B6CF0",
  orange: "#F2411A",
  purple: "#AD1342",
  red: "#D01614",
  gray: "#A5B4C8",
};

const colors2 = {
  black: "#303030",
  blue: "#52B6F6",
  red: "#E56B30",
  white: "#FEFEFE",
  green: "#25F55C",
  orange: "#E98423",
  yellow: "#D0F955",
  purple: "#F81581",
  gray: "#C5D4E8",
};

const fontFamily = "Space Mono";
const backgroundColor = colors2.white;
const arrowColor = colors.gray;
const lineHeight = 1.2;
const padding = "8px";
const borderWidth = 1;

const futuristic: Theme = {
  value: "futuristic",
  bg: backgroundColor,
  fg: colors.black,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "SpaceMono-Regular.woff2" }],
  },
  colors: colors2,
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
        // @ts-ignore
        "background-fill": "linear-gradient",
        "background-gradient-stop-colors": `${colors.blue} ${colors2.blue}`,
        "background-gradient-direction": "to-right",
        "font-family": fontFamily,
        "border-color": arrowColor,
        color: colors.black,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "rectangle",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        // @ts-ignore
        "border-color": colors.black,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "taxi",
        width: borderWidth * 1.75,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.black,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "1",
        "text-background-shape": "rectangle",
        "text-margin-y": -11,
        "source-distance-from-node": 0,
        "target-distance-from-node": 0,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        // @ts-ignore
        "target-underlay-color": "#000000",
        "target-underlay-padding": 3.5,
        "target-underlay-opacity": 1,
        "arrow-scale": 1.444,
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
    ...Object.entries(colors).map<StylesheetStyle>(([color, value]) => {
      const color1 = colors[color as keyof typeof colors];
      const color2 = colors2[color as keyof typeof colors2];
      return {
        selector: `node.${color}`,
        style: {
          "background-color": `${value}`,
          ...(Object.keys(colors2).includes(color)
            ? {
                "background-fill": "linear-gradient",
                "background-gradient-stop-colors": `${color1} ${color2}`,
                "background-gradient-direction": "to-right",
              }
            : {
                "background-color": color1,
              }),
          ...(["black"].includes(color)
            ? { color: colors2.white }
            : { color: colors.black }),
        },
      };
    }),
  ],
};

export default futuristic;
