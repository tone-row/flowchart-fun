import { t } from "@lingui/macro";
import {
  ArrowsClockwise,
  MagnifyingGlass,
  Minus,
  Plus,
  AlignCenterHorizontal,
  AlignCenterVertical,
  SquaresFour,
} from "phosphor-react";
import { useCallback, useEffect } from "react";
import { FaRegSnowflake } from "react-icons/fa";

import { lockZoomToGraph, useGraphStore } from "../lib/useGraphStore";
import { unfreezeDoc, useIsFrozen } from "../lib/useIsFrozen";
import { resetGraph } from "../lib/useUnmountStore";
import { IconButton2, IconToggleButton, Tooltip2 } from "../ui/Shared";
import {
  alignNodes,
  alignNodesHorizontally,
  alignNodesVertically,
} from "../lib/alignNodes";

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
  const autoFit = useGraphStore((s) => s.autoFit);

  const selectedNodes = useGraphStore((s) => s.selectedNodes);
  const alignButtonsEnabled = isFrozen && selectedNodes.length > 1;

  useEffect(() => {
    if (alignButtonsEnabled) {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "h") {
          alignNodesHorizontally(selectedNodes);
        } else if (event.key === "v") {
          alignNodesVertically(selectedNodes);
        }
      };

      window.addEventListener("keydown", handleKeyPress);

      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [alignButtonsEnabled, selectedNodes]);

  return (
    <div className="absolute bottom-4 right-4 flex bg-white shadow-md rounded-lg overflow-hidden gap-1 p-1 items-center dark:bg-neutral-600">
      <Tooltip2 content={t`Reset`}>
        <IconButton2
          size="xs"
          aria-label={t`Reset`}
          onClick={() => {
            resetGraph().then(() => {
              useGraphStore.setState({
                autoFit: true,
              });
            });
          }}
        >
          <ArrowsClockwise size={16} />
        </IconButton2>
      </Tooltip2>
      <Tooltip2 content={t`Zoom In`}>
        <IconButton2
          size="xs"
          onClick={zoomIn}
          aria-label={t`Zoom In`}
          data-testid="Zoom Out"
        >
          <Plus size={16} />
        </IconButton2>
      </Tooltip2>
      <Tooltip2 content={t`Zoom Out`}>
        <IconButton2
          size="xs"
          onClick={zoomOut}
          aria-label={t`Zoom Out`}
          data-testid="Zoom In"
        >
          <Minus size={16} />
        </IconButton2>
      </Tooltip2>
      <Tooltip2 content={t`Lock Zoom to Graph`}>
        <IconToggleButton
          aria-label={t`Lock Zoom to Graph`}
          size="xs"
          pressed={autoFit}
          onPressedChange={lockZoomToGraph}
        >
          <MagnifyingGlass size={16} />
        </IconToggleButton>
      </Tooltip2>
      <Tooltip2 content={t`Layout Frozen`}>
        <IconToggleButton
          aria-label={t`Layout Frozen`}
          size="xs"
          pressed={isFrozen}
          onPressedChange={(pressed) => {
            if (!pressed) {
              unfreezeDoc();
            }
          }}
        >
          <FaRegSnowflake size={16} />
        </IconToggleButton>
      </Tooltip2>
      <Tooltip2 content={t`Align Nodes`}>
        <IconButton2
          size="xs"
          onClick={alignNodes}
          aria-label={t`Align Nodes`}
          data-testid="Align Nodes"
          data-session-activity="align-nodes"
          disabled={!isFrozen}
        >
          <SquaresFour size={16} />
        </IconButton2>
      </Tooltip2>
      <Tooltip2 content={t`Align Horizontally` + " (h)"}>
        <IconButton2
          size="xs"
          onClick={() => alignNodesHorizontally(selectedNodes)}
          aria-label={t`Align Horizontally`}
          data-testid="Align Horizontally"
          data-session-activity="align-nodes-horizontally"
          disabled={!alignButtonsEnabled}
        >
          <AlignCenterHorizontal size={16} />
        </IconButton2>
      </Tooltip2>
      <Tooltip2 content={t`Align Vertically` + " (v)"}>
        <IconButton2
          size="xs"
          onClick={() => alignNodesVertically(selectedNodes)}
          aria-label={t`Align Vertically`}
          data-testid="Align Vertically"
          data-session-activity="align-nodes-vertically"
          disabled={!alignButtonsEnabled}
        >
          <AlignCenterVertical size={16} />
        </IconButton2>
      </Tooltip2>
    </div>
  );
}
