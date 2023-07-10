import { t } from "@lingui/macro";
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from "phosphor-react";
import { useCallback } from "react";
import { FaBomb, FaRegSnowflake } from "react-icons/fa";
import { MdFitScreen } from "react-icons/md";

import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { unfreezeDoc, useIsFrozen } from "../lib/useIsFrozen";
import { useUnmountStore } from "../lib/useUnmountStore";
import { Tooltip2 } from "../ui/Shared";

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

  const isFrozen = useIsFrozen();

  return (
    <div className="absolute bottom-4 left-4 flex bg-white border border-neutral-300 shadow rounded overflow-hidden">
      <CustomIconButton
        icon={<MagnifyingGlassMinus size={28} />}
        label={t`Zoom Out`}
        onClick={zoomOut}
      />
      <CustomIconButton
        icon={<MagnifyingGlassPlus size={28} />}
        label={t`Zoom In`}
        onClick={zoomIn}
      />
      <CustomIconButton
        icon={<MdFitScreen size={28} />}
        onClick={fitGraph}
        label={t`Fit Graph`}
      />
      <CustomIconButton
        icon={<FaBomb size={22} />}
        label={t`Reset`}
        onClick={() => {
          useUnmountStore.setState({
            unmount: true,
          });
        }}
      />
      {isFrozen ? (
        <CustomIconButton
          icon={<FaRegSnowflake size={22} />}
          label={t`Unfreeze`}
          onClick={unfreezeDoc}
        />
      ) : null}
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
    <Tooltip2 content={label} aria-label={label}>
      <button
        className="w-9 h-9 grid content-center justify-center bg-white text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none focus:shadow-none"
        data-testid={label}
        {...props}
      >
        {icon}
      </button>
    </Tooltip2>
  );
}
