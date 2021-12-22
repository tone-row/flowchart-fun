import { Theme } from "./constants";

const brightBlue = "#818bff";
const darkBlue = "#626ffe";
const fontFamily = '"Fira Mono", monospace';
const lineHeight = 1.4;
const backgroundColor = "#141418";
const textMaxWidth = 128;
const fontSize = 10;
const padding = "10px";

const monospace: Theme = {
  value: "monospace",
  bg: backgroundColor,
  minHeight: 0,
  minWidth: 0,
  textMaxWidth,
  font: {
    fontFamily,
    files: [{ url: "FiraMono-Regular.ttf", name: "Fira Mono" }],
    lineHeight,
    fontSize,
  },
  styles: [
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        "font-size": fontSize,
        label: "data(label)",
        color: brightBlue,
        "text-valign": "center",
        "text-halign": "center",
        width: "data(width)",
        height: "data(height)",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        backgroundColor: backgroundColor,
        "border-color": brightBlue,
        "border-width": "2px",
        "border-opacity": 1,
        "text-wrap": "wrap",
        "text-max-width": `${textMaxWidth}px`,
        shape: "roundrectangle",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-height": lineHeight,
        "text-justification": "left",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "segments",
        "font-size": "10px",
        opacity: 1,
        width: "2px",
        label: "data(label)",
        color: brightBlue,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": darkBlue,
        "target-distance-from-node": 10,
        "arrow-scale": 1.25,
        "source-distance-from-node": 10,
        "text-background-shape": "roundrectangle",
        "text-background-color": backgroundColor,
        "text-background-opacity": 1,
        "text-background-padding": "4px",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-gradient-stop-colors": `${brightBlue} ${darkBlue}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-gradient-stop-positions": "0% 100%",
      },
    },
  ],
};

export default monospace;
