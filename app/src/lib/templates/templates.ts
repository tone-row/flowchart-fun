import { t } from "@lingui/macro";

export type PromptType = "knowledge" | "flowchart";

type Template = {
  key: string;
  img: string;
  title: () => string;
  promptType: PromptType;
  accentClasses?: string[];
};

export const templates: Template[] = [
  {
    key: "default",
    img: "template21.png",
    title: () => `Default`,
    promptType: "flowchart",
  },
  {
    key: "flowchart",
    img: "template11.png",
    title: () => `Flowchart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green"],
  },
  {
    key: "org-chart",
    img: "template17.png",
    title: () => t`Organization Chart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_orange"],
  },
  {
    key: "code-flow",
    img: "template18.png",
    title: () => t`Process Diagram`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green", "color_purple"],
  },
  {
    key: "mindmap",
    img: "template19.png",
    title: () => `Mind Map`,
    promptType: "knowledge",
    accentClasses: ["size_lg", "color_blue", "color_green", "color_orange"],
  },
  {
    key: "knowledge-graph",
    img: "template20.png",
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
