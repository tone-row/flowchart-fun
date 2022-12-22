import "./GraphFloatingMenu.css";

import { MdFitScreen } from "react-icons/md";

import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { IconButton } from "./IconButton";

export function GraphFloatingMenu() {
  return (
    <div className="graph-floating-menu">
      <IconButton
        icon={MdFitScreen as any}
        onClick={fitGraph}
        label="Fit Graph"
      />
    </div>
  );
}

function fitGraph() {
  if (!window.__cy) return;
  window.__cy.fit(undefined, DEFAULT_GRAPH_PADDING);
}
