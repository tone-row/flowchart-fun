import { t } from "@lingui/macro";

export type PromptType = "knowledge" | "flowchart";

type Template = {
  key: string;
  title: () => string;
};

export const templates: Template[] = [
  {
    key: "default",
    title: () => `Default`,
  },
  {
    key: "flowchart",
    title: () => `Flowchart`,
  },
  {
    key: "org-chart",
    title: () => t`Organization Chart`,
  },
  {
    key: "code-flow",
    title: () => t`Process Diagram`,
  },
  {
    key: "mindmap",
    title: () => `Mind Map`,
  },
  {
    key: "knowledge-graph",
    title: () => t`Knowledge Graph`,
  },
];
