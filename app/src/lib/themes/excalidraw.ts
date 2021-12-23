import { Theme } from "./constants";

const fontFamily = '"Virgil", "Liu Jian Mao Cao"';
const fontSize = 10;
const textMaxWidth = 80;
const backgroundColor = "#ffffff";
const arrowColor = "#cccccc";
const lineHeight = 1.3;
const padding = "8px";

const excalidraw: Theme = {
  font: {
    fontFamily,
    fontSize,
    files: [
      { url: "Virgil.woff2", name: "Virgil" },
      {
        url: "LiuJianMaoCao-Regular.woff2",
        name: "Liu Jian Mao Cao",
        unicodeRange: "U+4E00-9FFF",
      },
    ],
    lineHeight: lineHeight,
  },
  textMaxWidth,
  value: "excalidraw",
  bg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
  styles: [
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": `${textMaxWidth}px`,
        color: "#000000",
        "font-size": fontSize,
        shape: "roundrectangle",
        width: "data(width)", // width and height need to be taken from current font
        height: "data(height)",
        backgroundColor: backgroundColor,
        "background-opacity": 0,
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-height": lineHeight,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: 1,
        "line-color": arrowColor,
        "line-style": "solid",
        label: "data(label)",
        color: "#000000",
        "font-size": fontSize,
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-margin-y": -5,
        "text-margin-x": 5,
        "source-distance-from-node": 4,
        "target-distance-from-node": 4,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "text-rotation": "autorotate",
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": arrowColor,
      },
    },
  ],
};

export default excalidraw;
