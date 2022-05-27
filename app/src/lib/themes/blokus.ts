// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Theme } from "./constants";

const blokusColors = {
  red: ["#ba1700", "#d13721", "#fc5b42"],
  orange: ["#bf5900", "#e6954e", "#ff9c45"],
  blue: ["#001194", "#3043d1", "#6172F9"],
  black: ["#171817", "#202a2d", "#242b2e"],
  white: ["#e3dcdc", "#fdfbfb", "#ffffff"],
  green: ["#026F4A", "#019467", "#03B181"],
  yellow: ["#ba9500", "#d4ae17", "#fad545"],
  gray: ["#75736d", "#878378", "#9c9687"],
  purple: ["#4d1db5", "#714bdb", "#9563ff"],
};

const textColor = "#FFFFFF";
const fontFamily = '"Space Mono", monospace';
const lineHeight = 1.4;
const backgroundColor = "#2A294D";
const darkerBackgroundColor = "#060608";
const fontSize = 9;
const padding = "6px";

const edgeWidth = 1.5;
const blokus: Theme = {
  value: "blokus",
  bg: backgroundColor,
  minHeight: 0,
  minWidth: 0,
  font: {
    fontFamily,
    lineHeight,
    fontSize,
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
        "font-family": fontFamily,
        "font-size": fontSize,
        label: "data(label)",
        color: textColor,
        "background-fill": "linear-gradient",
        "background-gradient-stop-colors": "#026F4A #019467 #03B181",
        "background-gradient-direction": "to-top-right",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "line-height": lineHeight,
        "text-justification": "left",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        backgroundColor: darkerBackgroundColor,
        shape: "roundrectangle",
        "underlay-color": "#1d1d38",
        "underlay-opacity": 0.3,
        "underlay-padding": 5,
        "underlay-shape": "roundrectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "unbundled-bezier",
        "font-size": fontSize,
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
        "line-gradient-stop-colors": `#F4F4F5 #EEFCFC`,
        "line-gradient-stop-positions": "0% 100%",
      },
    },
    ...Object.entries(blokusColors).map<Stylesheet>(([color, value]) => ({
      selector: `.${color}`,
      style: {
        "background-gradient-stop-colors": `${value[0]} ${value[1]} ${value[2]}`,
        color: color === "white" ? blokusColors.black[0] : textColor,
      },
    })),
  ],
};

export default blokus;
