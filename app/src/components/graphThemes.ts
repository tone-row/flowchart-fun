import { t } from "@lingui/macro";
import { Stylesheet } from "cytoscape";

export type GraphThemes = "original" | "original-dark";
export const allGraphThemes: GraphThemes[] = ["original", "original-dark"];
export const themes: {
  label: () => string;
  value: GraphThemes;
}[] = [
  { label: () => t`Light`, value: "original" },
  { label: () => t`Dark`, value: "original-dark" },
];
export const defaultGraphTheme: GraphThemes = "original";

export const graphThemes: Record<
  GraphThemes,
  { bg: string; styles: Stylesheet[] }
> = {
  original: {
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
          shape: "rectangle",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
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
          "line-color": "#000000",
          "target-arrow-color": "#000000",
          "target-arrow-shape": "vee",
          "arrow-scale": 1,
          "curve-style": "bezier",
          label: "data(label)",
          color: "#000000",
          "font-size": 10,
          "text-valign": "center",
          "text-wrap": "wrap",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          "text-halign": "center",
          "edge-text-rotation": "autorotate",
        },
      },
      {
        selector: ".edgeHovered",
        style: {
          "line-color": "#aaaaaa",
          "target-arrow-color": "#aaaaaa",
          color: "#aaaaaa",
        },
      },
      {
        selector: ".nodeHovered",
        style: {
          backgroundColor: "#f0f0f0",
        },
      },
    ],
  },
  "original-dark": {
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
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
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
          "target-arrow-shape": "vee",
          "arrow-scale": 1,
          "curve-style": "bezier",
          label: "data(label)",
          color: "#ffffff",
          "font-size": 10,
          "text-valign": "center",
          "text-wrap": "wrap",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          "text-halign": "center",
          "edge-text-rotation": "autorotate",
        },
      },
      {
        selector: ".edgeHovered",
        style: {
          "line-color": "#464646",
          "target-arrow-color": "#464646",
          color: "#464646",
        },
      },
      {
        selector: ".nodeHovered",
        style: {
          backgroundColor: "#2e2e2e",
        },
      },
    ],
  },
};
