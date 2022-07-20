import { t } from "@lingui/macro";
import { CSSProperties } from "react";
import { OptionTypeBase } from "react-select";

import { TAppContext } from "../components/AppContext";
import { gaJumpToSponsorPage } from "./analytics";

export interface SelectOption extends OptionTypeBase {
  value: string;
  label: () => string;
  /** Whether this option should only be presented to sponsors */
  sponsorOnly?: true;
  /** Whether this option should only be presented to non-sponsors */
  hideIfSponsor?: true;
  /** Alternative on click option */
  handleClick?: (setShowing: TAppContext["setShowing"]) => void;
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
  { label: () => "Disco", value: "elk-disco", sponsorOnly: true },
  { label: () => "Force", value: "elk-force", sponsorOnly: true },
  { label: () => "Layered", value: "elk-layered", sponsorOnly: true },
  { label: () => "Tree", value: "elk-mrtree", sponsorOnly: true },
  { label: () => "Stress", value: "elk-stress", sponsorOnly: true },
  {
    label: () => t`Get More Layouts`,
    value: "more",
    hideIfSponsor: true,
    handleClick: (setShowing) => {
      setShowing("sponsor");
      gaJumpToSponsorPage({ action: "Get More Layouts" });
    },
    style: {
      color: "var(--color-highlightColor)",
      backgroundColor: "hsla(var(--color-brandHsl), 0.2)",
    },
  },
];

export const directions: SelectOption[] = [
  { label: () => t`Top to Bottom`, value: "TB" },
  { label: () => t`Left to Right`, value: "LR" },
  { label: () => t`Right to Left`, value: "RL" },
  { label: () => t`Bottom to Top`, value: "BT" },
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
  {
    label: () => t`Get More Themes`,
    value: "more",
    hideIfSponsor: true,
    handleClick: (setShowing) => {
      setShowing("sponsor");
      gaJumpToSponsorPage({ action: "Get More Themes" });
    },
    style: {
      color: "var(--color-highlightColor)",
      backgroundColor: "hsla(var(--color-brandHsl), 0.2)",
    },
  },
];
