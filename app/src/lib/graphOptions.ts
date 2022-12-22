import { t } from "@lingui/macro";
import { CSSProperties } from "react";
import { OptionTypeBase } from "react-select";

export const DEFAULT_GRAPH_PADDING = 6;

export interface SelectOption extends OptionTypeBase {
  value: string;
  label: () => string;
  /** Whether this option should only be presented to sponsors */
  sponsorOnly?: true;
  /** Style for this particular element */
  style?: CSSProperties;
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
  { label: () => "Box", value: "elk-box", sponsorOnly: true },
  { label: () => "Force", value: "elk-force", sponsorOnly: true },
  { label: () => "Layered", value: "elk-layered", sponsorOnly: true },
  { label: () => "Tree", value: "elk-mrtree", sponsorOnly: true },
  { label: () => "Stress", value: "elk-stress", sponsorOnly: true },
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
  { label: () => t`Light`, value: "original" },
  { label: () => t`Dark`, value: "original-dark" },
  { label: () => t`Eggs`, value: "eggs" },
  { label: () => t`Excalidraw`, value: "excalidraw" },
  { label: () => t`Monospace`, value: "monospace" },
  { label: () => `Blokus`, value: "blokus" },
  { label: () => t`Retro`, value: "retro" },
  { label: () => t`Futuristic`, value: "futuristic" },
  { label: () => t`Comic Book`, value: "comic-book" },
  { label: () => t`Clay`, value: "clay", sponsorOnly: true },
  { label: () => t`Playbook`, value: "playbook", sponsorOnly: true },
  { label: () => t`Museum`, value: "museum", sponsorOnly: true },
];
