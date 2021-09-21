import { t } from "@lingui/macro";
import cytoscape from "cytoscape";

export const layouts: {
  label: () => string;
  value: cytoscape.LayoutOptions["name"];
}[] = [
  { label: () => `Dagre`, value: "dagre" },
  { label: () => t`Breadthfirst`, value: "breadthfirst" },
  { label: () => `CoSE`, value: "cose" },
  { label: () => t`Concentric`, value: "concentric" },
  { label: () => t`Circle`, value: "circle" },
  { label: () => t`Random`, value: "random" },
  { label: () => t`Grid`, value: "grid" },
];

export const directions = [
  { label: () => t`Top to Bottom`, value: "TB" },
  { label: () => t`Left to Right`, value: "LR" },
  { label: () => t`Right to Left`, value: "RL" },
  { label: () => t`Bottom to Top`, value: "BT" },
];
