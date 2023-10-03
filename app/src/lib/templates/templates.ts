import { t } from "@lingui/macro";

export type PromptType = "knowledge" | "flowchart";

export const templates: {
  key: string;
  img: string;
  bgColor: string;
  title: () => string;
  promptType: PromptType;
  accentClasses?: string[];
}[] = [
  {
    key: "default",
    img: "template9.png",
    bgColor: "#FFFFFF",
    title: () => `Default`,
    promptType: "flowchart",
  },
  {
    key: "flowchart",
    img: "template11.png",
    bgColor: "#F1F3F5",
    title: () => `Flowchart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green"],
  },
  {
    key: "mindmap",
    img: "template16.png",
    bgColor: "#FFFFFF",
    title: () => `Mind Map`,
    promptType: "knowledge",
    accentClasses: ["size_lg", "color_blue", "color_green", "color_orange"],
  },
  {
    key: "org-chart",
    img: "template17.png",
    bgColor: "#fefdf9",
    title: () => t`Organization Chart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_orange"],
  },
  {
    key: "code-flow",
    img: "template14.png",
    bgColor: "#FFFFFF",
    title: () => t`Process Diagram`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green", "color_purple"],
  },
  {
    key: "knowledge-graph",
    img: "template10.png",
    bgColor: "#EFEFEF",
    title: () => t`Knowledge Graph`,
    promptType: "knowledge",
    accentClasses: [
      "color_blue",
      "color_green",
      "color_orange",
      "color_purple",
      "color_grey",
      "border_dashed",
    ],
  },
];
