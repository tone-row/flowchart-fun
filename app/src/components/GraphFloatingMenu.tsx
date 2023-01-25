import { t } from "@lingui/macro";
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from "phosphor-react";
import { useCallback } from "react";
import { MdFitScreen } from "react-icons/md";

import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import styles from "./GraphFloatingMenu.module.css";
import { Tooltip } from "./Shared";

const ZOOM_STEP = 0.5;

export function GraphFloatingMenu() {
  const zoomIn = useCallback(() => {
    const cy = window.__cy;
    if (!cy) return;
    cy.zoom({
      level: cy.zoom() + ZOOM_STEP,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  }, []);

  const zoomOut = useCallback(() => {
    const cy = window.__cy;
    if (!cy) return;
    cy.zoom({
      level: cy.zoom() - ZOOM_STEP,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  }, []);

  return (
    <div className={styles.graphFloatingMenu}>
      <CustomIconButton
        icon={<MagnifyingGlassMinus />}
        label={t`Zoom Out`}
        onClick={zoomOut}
      />
      <CustomIconButton
        icon={<MagnifyingGlassPlus />}
        label={t`Zoom In`}
        onClick={zoomIn}
      />
      <CustomIconButton
        icon={<MdFitScreen />}
        onClick={fitGraph}
        label={t`Fit Graph`}
      />
    </div>
  );
}

function fitGraph() {
  if (!window.__cy) return;
  window.__cy.fit(undefined, DEFAULT_GRAPH_PADDING);
}

type CustomIconButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode;
  label: string;
};
function CustomIconButton({ icon, label, ...props }: CustomIconButtonProps) {
  return (
    <Tooltip label={label} aria-label={label} className={`slang-type size-0`}>
      <button
        className={styles.CustomIconButton}
        data-testid={label}
        {...props}
      >
        {icon}
      </button>
    </Tooltip>
  );
}
