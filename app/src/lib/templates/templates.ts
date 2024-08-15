import { t } from "@lingui/macro";

export type PromptType = "knowledge" | "flowchart";

type Template = {
  key: string;
  title: () => string;
  promptType: PromptType;
  accentClasses?: string[];
};

export const templates: Template[] = [
  {
    key: "default",
    title: () => `Default`,
    promptType: "flowchart",
  },
  {
    key: "flowchart",
    title: () => `Flowchart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green"],
  },
  {
    key: "org-chart",
    title: () => t`Organization Chart`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_orange"],
  },
  {
    key: "code-flow",
    title: () => t`Process Diagram`,
    promptType: "flowchart",
    accentClasses: ["color_blue", "color_green", "color_purple"],
  },
  {
    key: "mindmap",
    title: () => `Mind Map`,
    promptType: "knowledge",
    accentClasses: ["size_lg", "color_blue", "color_green", "color_orange"],
  },
  {
    key: "knowledge-graph",
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
