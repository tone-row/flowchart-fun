import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const blokusColors = {
  red: ["#ba1700", "#d13721", "#fc5b42"],
  orange: ["#bf5900", "#e6954e", "#ff9c45"],
  blue: ["#001194", "#3043d1", "#6172F9"],
  black: ["#171817", "#202a2d", "#242b2e"],
  white: ["#cdc5c5", "#fdfbfb", "#ffffff"],
  green: ["#026F4A", "#019467", "#03B181"],
  yellow: ["#ba9500", "#d4ae17", "#fad545"],
  gray: ["#75736d", "#878378", "#9c9687"],
  purple: ["#4d1db5", "#714bdb", "#9563ff"],
};

const colors = Object.entries(blokusColors).reduce(
  (acc, [color, shades]) => ({
    ...acc,
    [color]: shades[0],
  }),
  {}
);

const textColor = "#FFFFFF";
const fontFamily = '"Space Mono", monospace';
const lineHeight = 1.2;
const backgroundColor = "#1b1b20";
const darkerBackgroundColor = "#060608";
const padding = "6px";

const edgeWidth = 1.5;
const blokus: Theme = {
  value: "blokus",
  bg: backgroundColor,
  fg: textColor,
  minHeight: 0,
  minWidth: 0,
  font: {
    fontFamily,
    lineHeight,
    fontSize: defaultFontSize,
    files: [{ name: fontFamily, url: "SpaceMono-Regular.woff2" }],
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
        color: blokusColors.black[0],
        // @ts-ignore
        "background-fill": "linear-gradient",
        "background-gradient-stop-colors": blokusColors.white.join(" "),
        "background-gradient-direction": "to-top-right",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "line-height": lineHeight,
        "text-justification": "center",
        padding,
        backgroundColor: darkerBackgroundColor,
        shape: "roundrectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "unbundled-bezier",
        opacity: 1,
        width: edgeWidth,
        label: "data(label)",
        color: textColor,
        "arrow-scale": 1,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": "#EEFCFC",
        "target-distance-from-node": 5,
        "source-distance-from-node": 5,
        "text-background-shape": "roundrectangle",
        "text-background-color": backgroundColor,
        "text-background-opacity": 1,
        "text-background-padding": "4px",
        "text-rotation": "autorotate",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // @ts-ignore
        "line-gradient-stop-colors": `#F4F4F5 #EEFCFC`,
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
    ...Object.entries(blokusColors).map<StylesheetStyle>(([color, value]) => ({
      selector: `.${color}`,
      style: {
        "background-gradient-stop-colors": `${value[0]} ${value[1]} ${value[2]}`,
        color: color === "white" ? blokusColors.black[0] : textColor,
      },
    })),
  ],
};

export default blokus;
