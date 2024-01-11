import { t } from "@lingui/macro";
import { CSSProperties } from "react";

export const DEFAULT_GRAPH_PADDING = 20;

export interface SelectOption {
  value: string;
  label: () => string;
  /** Style for this particular element */
  style?: CSSProperties; // TODO: is this still used?
}

export const layouts: SelectOption[] = [
  { label: () => `Dagre`, value: "dagre" },
  { label: () => `Klay`, value: "klay" },
  { label: () => t`Breadthfirst`, value: "breadthfirst" },
  { label: () => `CoSE`, value: "cose" },
  { label: () => t`Concentric`, value: "concentric" },
  { label: () => t`Circle`, value: "circle" },
  { label: () => t`Random`, value: "random" },
  { label: () => t`Grid`, value: "grid" },
  // Elk layouts
  { label: () => "Box", value: "elk-box" },
  { label: () => "Force", value: "elk-force" },
  { label: () => "Layered", value: "elk-layered" },
  { label: () => "Tree", value: "elk-mrtree" },
  { label: () => "Stress", value: "elk-stress" },
];

export const directions: SelectOption[] = [
  { label: () => t`Top to Bottom`, value: "TB" },
  { label: () => t`Left to Right`, value: "LR" },
  { label: () => t`Right to Left`, value: "RL" },
  { label: () => t`Bottom to Top`, value: "BT" },
];

export const elkDirections: SelectOption[] = [
  { label: () => t`Top to Bottom`, value: "DOWN" },
  { label: () => t`Left to Right`, value: "RIGHT" },
  { label: () => t`Right to Left`, value: "LEFT" },
  { label: () => t`Bottom to Top`, value: "UP" },
];

export const themes: SelectOption[] = [
  { label: () => t`August 2023`, value: "august2023" },
  { label: () => t`Light`, value: "original" },
  { label: () => t`Dark`, value: "original-dark" },
  { label: () => t`Excalidraw`, value: "excalidraw" },
  { label: () => t`Playbook`, value: "playbook" },
];
