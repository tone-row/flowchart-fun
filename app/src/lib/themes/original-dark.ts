import { defaultFontFamily, Theme } from "./constants";

const originalDark: Theme = {
  value: "original-dark",
  bg: "#0f0f0f",
  styles: [
    {
      selector: "node",
      style: {
        backgroundColor: "#0f0f0f",
        "border-color": "#ffffff",
        color: "#ffffff",
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
        shape: "rectangle",
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
        "text-background-color": "#0f0f0f",
        "line-color": "#ffffff",
        "target-arrow-color": "#ffffff",
        "target-arrow-shape": "triangle",
        "arrow-scale": 1,
        "curve-style": "bezier",
        label: "data(label)",
        color: "#ffffff",
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

export default originalDark;

export {};
