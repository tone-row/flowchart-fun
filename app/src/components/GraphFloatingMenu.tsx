import { t, Trans } from "@lingui/macro";
import {
  ArrowsClockwise,
  Chat,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Minus,
  PaperPlaneTilt,
  Plus,
  SquareLogo,
} from "phosphor-react";
import { ReactNode, useCallback } from "react";
import { FaRegSnowflake } from "react-icons/fa";
import { MdFitScreen } from "react-icons/md";
import { useHistory } from "react-router-dom";

import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { unfreezeDoc, useIsFrozen } from "../lib/useIsFrozen";
import { useUnmountStore } from "../lib/useUnmountStore";
import { IconButton2, Tooltip2 } from "../ui/Shared";

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

  const { push } = useHistory();

  return (
    <div className="absolute bottom-4 right-4 flex bg-white border border-neutral-300 shadow-sm rounded-lg overflow-hidden gap-1 p-1 items-center dark:bg-neutral-600 dark:border-neutral-600">
      <CustomIconButton label={t`Zoom Out`} onClick={zoomOut}>
        <Minus size={16} />
      </CustomIconButton>
      <CustomIconButton label={t`Zoom In`} onClick={zoomIn}>
        <Plus size={16} />
      </CustomIconButton>
      <CustomIconButton onClick={fitGraph} label={t`Fit Graph`}>
        <SquareLogo size={16} />
      </CustomIconButton>
      <CustomIconButton
        label={t`Reset`}
        onClick={() => {
          useUnmountStore.setState({
            unmount: true,
          });
        }}
      >
        <ArrowsClockwise size={16} />
      </CustomIconButton>
      {isFrozen ? (
        <CustomIconButton label={t`Unfreeze`} onClick={unfreezeDoc}>
          <FaRegSnowflake size={16} />
        </CustomIconButton>
      ) : null}

      <button
        onClick={() => push("/o")}
        className="text-[12px] text-neutral-500 hover:text-neutral-600 cursor-pointer font-bold ml-4 px-2 flex gap-1 hover:scale-105 transition-transform dark:text-neutral-300 dark:hover:text-neutral-200"
      >
        <Trans>Send Feedback</Trans>
      </button>
    </div>
  );
}

function fitGraph() {
  if (!window.__cy) return;
  window.__cy.fit(undefined, DEFAULT_GRAPH_PADDING);
}

function CustomIconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Tooltip2 content={label}>
      <IconButton2 size="xs" onClick={onClick}>
        {children}
      </IconButton2>
    </Tooltip2>
  );
}
