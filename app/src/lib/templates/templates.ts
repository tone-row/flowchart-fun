import { t } from "@lingui/macro";

export type PromptType = "knowledge" | "flowchart";

type Template = {
  key: string;
  img: string;
  bgColor: string;
  title: () => string;
  promptType: PromptType;
  accentClasses?: string[];
};

export const templates: Template[] = [
  {
    key: "default",
    img: "template21.png",
    bgColor: "#FFFFFF",
    title: () => `Default`,
    promptType: "flowchart",
  },
  {
    key: "flowchart",
    img: "template11.png",
    bgColor: "#FFFFFF",
    title: () => `Flowchart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green"],
  },
  {
    key: "org-chart",
    img: "template17.png",
    bgColor: "#FFFFFF",
    title: () => t`Organization Chart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_orange"],
  },
  {
    key: "code-flow",
    img: "template18.png",
    bgColor: "#F8F8F8",
    title: () => t`Process Diagram`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green", "color_purple"],
  },
  {
    key: "mindmap",
    img: "template19.png",
    bgColor: "#FFFFFF",
    title: () => `Mind Map`,
    promptType: "knowledge",
    accentClasses: ["size_lg", "color_blue", "color_green", "color_orange"],
  },
  {
    key: "knowledge-graph",
    img: "template20.png",
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
