import { defaultFontFamily, Theme } from "./constants";

const original: Theme = {
  value: "original",
  bg: "#ffffff",
  styles: [
    {
      selector: "node",
      style: {
        backgroundColor: "#ffffff",
        "border-color": "#000000",
        color: "#000000",
        label: "data(label)",
        "font-size": 10,
        "text-wrap": "wrap",
        "text-max-width": "80",
        "text-valign": "center",
        "text-halign": "center",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-height": 1.25,
        "border-width": 1,
        shape: "roundrectangle",
        "font-family": defaultFontFamily,
      },
    },
    {
      selector: "node[label!='']",
      style: {
        width: "data(width)",
        height: "data(height)",
      },
    },
    {
      selector: "edge",
      style: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "loop-direction": "0deg",
        "loop-sweep": "20deg",
        width: 1,
        "text-background-opacity": 1,
        "text-background-color": "#ffffff",
        "text-background-padding": "3px",
        "line-color": "#000000",
        "target-arrow-color": "#000000",
        "target-arrow-shape": "triangle",
        "arrow-scale": 1,
        "curve-style": "bezier",
        label: "data(label)",
        color: "#000000",
        "font-size": 10,
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": defaultFontFamily,
        "text-halign": "center",
        "edge-text-rotation": "autorotate",
      },
    },
  ],
};

export default original;
