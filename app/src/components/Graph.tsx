import { Core, CytoscapeOptions, EdgeSingular, NodeSingular } from "cytoscape";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import cytoscapeSvg from "cytoscape-svg";
import throttle from "lodash.throttle";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";
import { useDebouncedCallback } from "use-debounce";

import { defaultLayout } from "../lib/constants";
import { cytoscape } from "../lib/cytoscape";
import { getLayout } from "../lib/getLayout";
import { getUserStyle } from "../lib/getTheme";
import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { useThemeStore } from "../lib/graphThemes";
import { graphUtilityClasses } from "../lib/graphUtilityClasses";
import { isError } from "../lib/helpers";
import { getAnimationSettings } from "../lib/hooks";
import { parseText } from "../lib/parseText";
import { Doc, useDoc, useParseError } from "../lib/prepareChart";
import { Theme } from "../lib/themes/constants";
import original from "../lib/themes/original";
import { TGetSize, useGetSize } from "../lib/useGetSize";
import { useGraphStore } from "../lib/useGraphStore";
import { useHoverLine } from "../lib/useHoverLine";
import { stripComments } from "../lib/utils";
import { Box } from "../slang";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import styles from "./Graph.module.css";
import { GRAPH_CONTEXT_MENU_ID, GraphContextMenu } from "./GraphContextMenu";
import useDownloadHandlers from "./useDownloadHandlers";

declare global {
  interface Window {
    __cy?: cytoscape.Core;
  }
}

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.use(klay);
  cytoscape.use(cytoscapeSvg);
  cytoscape.prototype.hasInitialised = true;
}

const shouldAnimate = getAnimationSettings();

const Graph = memo(function Graph({ shouldResize }: { shouldResize: number }) {
  const [initResizeNumber] = useState(shouldResize);
  const cy = useRef<undefined | Core>();
  const errorCatcher = useRef<undefined | Core>();
  const graphInitialized = useRef(false);
  const theme = useThemeStore();
  const bg = useDoc((state) => state.meta?.background ?? theme.bg) as string;
  const getSize = useGetSize(theme);

  const handleDragFree = useCallback(() => {
    const nodePositions = getNodePositionsFromCy();
    useDoc.setState((state) => {
      return {
        ...state,
        meta: {
          ...state.meta,
          nodePositions,
        },
      };
    });
  }, []);

  const handleResize = useCallback(() => {
    if (!cy.current) return;
    cy.current.resize();
    cy.current.fit(undefined, DEFAULT_GRAPH_PADDING);
  }, []);

  const debouncedResize = useDebouncedCallback(handleResize, 250);

  useEffect(() => {
    window.addEventListener("resize", debouncedResize.callback);
    return () => window.removeEventListener("resize", debouncedResize.callback);
  }, [debouncedResize]);

  useDownloadHandlers(cy, theme, bg);

  // Initialize Graph
  useEffect(() => {
    return initializeGraph({
      errorCatcher,
      cy,
    });
  }, []);

  // bind drag-free event
  useEffect(() => {
    const cyCurrent = cy.current;
    if (cyCurrent) {
      cyCurrent.on("dragfree", handleDragFree);
    }
    return () => {
      if (cyCurrent) {
        cyCurrent.off("dragfree", handleDragFree);
      }
    };
  }, [handleDragFree]);

  // Update Style
  // TODO: will need to re-add user style
  // useEffect(() => {
  //   updateStyle(cy, errorCatcher, theme);
  // }, [theme]);

  const throttleStyleUpdate = useMemo(
    () => getStyleUpdater({ cy, errorCatcher }),
    []
  );

  useEffect(() => {
    throttleStyleUpdate(theme);
  }, [throttleStyleUpdate, theme]);

  const throttleUpdate = useMemo(
    () => getGraphUpdater({ cy, errorCatcher, graphInitialized, getSize }),
    [getSize]
  );

  useEffect(() => {
    throttleUpdate();
    return useDoc.subscribe(throttleUpdate);
  }, [throttleUpdate]);

  const sponsorLayoutsLoaded = useGraphStore(
    useCallback((store) => store.sponsorLayoutsLoaded, [])
  );

  // Update Graph when Sponsor Layouts Load
  useEffect(() => {
    if (sponsorLayoutsLoaded) throttleUpdate();
  }, [throttleUpdate, sponsorLayoutsLoaded]);

  const { show } = useContextMenu({ id: GRAPH_CONTEXT_MENU_ID });
  const handleContextMenu = (e: TriggerEvent) => {
    show(e);
  };

  useEffect(() => {
    if (initResizeNumber !== shouldResize) handleResize();
  }, [handleResize, initResizeNumber, shouldResize]);

  return (
    <Box
      className={[styles.GraphContainer, "graph"].join(" ")}
      overflow="hidden"
      h="100%"
      style={{ background: bg }}
      onContextMenu={handleContextMenu}
    >
      <Box id="cy" overflow="hidden" />
      <GraphContextMenu />
    </Box>
  );
});

export default Graph;

function initializeGraph({
  errorCatcher,
  cy,
}: {
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
}) {
  try {
    errorCatcher.current = cytoscape();
    cy.current = cytoscape({
      container: document.getElementById("cy"), // container to render in
      layout: { ...(defaultLayout as cytoscape.LayoutOptions) },
      elements: [],
      // TODO: shouldn't this load the user's style as well?
      // TODO: not even loading the real theme... this seems sus
      style: getCytoStyle(original),
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      wheelSensitivity: 0.2,
      // autoungrabify: true,
    });
    window.__cy = cy.current;
    const cyCurrent = cy.current;
    const errorCyCurrent = errorCatcher.current;
    // Hover Events
    const handleMouseOut = () => {
      cyCurrent.$(".nodeHovered").removeClass("nodeHovered");
      cyCurrent.$(".edgeHovered").removeClass("edgeHovered");
      useHoverLine.setState({ line: undefined });
    };

    cyCurrent.on("mouseover", "node", nodeHighlight);
    cyCurrent.on("mouseover", "edge", edgeHighlight);
    cyCurrent.on("tapstart", "node", nodeHighlight);
    cyCurrent.on("tapstart", "edge", edgeHighlight);
    cyCurrent.on("mouseout", "node, edge", unhighlight);
    cyCurrent.on("tapend", "node, edge", unhighlight);
    document.getElementById("cy")?.addEventListener("mouseout", handleMouseOut);

    return () => {
      cyCurrent.destroy();
      errorCyCurrent.destroy();
      cy.current = undefined;
      errorCatcher.current = undefined;
      document
        .getElementById("cy")
        ?.removeEventListener("mouseout", handleMouseOut);
    };
  } catch (e) {
    console.error(e);
  }

  // Hover Events that Need "this"
  function nodeHighlight(this: NodeSingular) {
    this.addClass("nodeHovered");
    useHoverLine.setState({ line: this.data().lineNumber });
  }
  function edgeHighlight(this: EdgeSingular) {
    this.addClass("edgeHovered");
    useHoverLine.setState({ line: this.data().lineNumber });
  }
  function unhighlight(this: NodeSingular | EdgeSingular) {
    this.removeClass("nodeHovered");
    this.removeClass("edgeHovered");
    useHoverLine.setState({ line: undefined });
  }
}

/**
 * Returns a debounced function that only relies
 * on the document to update the graph
 */
function getGraphUpdater({
  cy,
  errorCatcher,
  graphInitialized,
  getSize,
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  graphInitialized: React.MutableRefObject<boolean>;
  getSize: TGetSize;
}) {
  return throttle((_doc?: Doc) => {
    if (!cy.current) return;
    if (!errorCatcher.current) return;
    const doc = _doc || useDoc.getState();
    let elements: cytoscape.ElementDefinition[] = [];

    try {
      const layout = getLayout(doc);
      elements = parseText(stripComments(doc.text), getSize);
      // Test
      errorCatcher.current.json({ elements });
      // TODO: what happens if you add animate false and run() here?
      errorCatcher.current.layout(layout);

      // Update
      cy.current.json({ elements });
      if (layout.name !== "preset") {
        cy.current
          .layout({
            ...layout,
            animate: graphInitialized.current
              ? elements.length < 200
                ? shouldAnimate
                : false
              : false,
            animationDuration: shouldAnimate ? 333 : 0,
            padding: DEFAULT_GRAPH_PADDING,
          })
          .run();
        cy.current.fit(undefined, DEFAULT_GRAPH_PADDING);
      } else {
        cy.current.layout({ ...layout, animate: false, fit: false }).run();
      }

      graphInitialized.current = true;

      // Reinitialize to avoid missing errors
      errorCatcher.current.destroy();
      errorCatcher.current = cytoscape();
      useParseError.setState({ error: "", errorFromStyle: "" });

      // Update Graph Store
      useGraphStore.setState({ layout, elements });
    } catch (e) {
      errorCatcher.current.destroy();
      errorCatcher.current = cytoscape();
      if (isError(e)) {
        useParseError.setState({
          errorFromStyle: sanitizeMessage(e.message, elements),
        });
      }
    }
  }, 333);
}

function getStyleUpdater({
  cy,
  errorCatcher,
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
}) {
  return throttle((theme: Theme) => {
    if (!cy.current) return;
    if (!errorCatcher.current) return;
    try {
      // Prepare Styles
      const style = getCytoStyle(theme, getUserStyle());

      // Test Error First
      errorCatcher.current.json({ style });

      // Real
      cy.current.json({
        style,
      });

      // Reinitialize to avoid missing errors
      errorCatcher.current.destroy();
      errorCatcher.current = cytoscape();
      useParseError.setState({ errorFromStyle: "" });
    } catch (e) {
      errorCatcher.current.destroy();
      errorCatcher.current = cytoscape();
      if (isError(e)) {
        useParseError.setState({
          errorFromStyle: sanitizeStyleMessage(e.message),
        });
      }
    }
  }, 333);
}

function getCytoStyle(
  theme: Theme,
  userStyle: cytoscape.Stylesheet[] = []
): CytoscapeOptions["style"] {
  return [...theme.styles, ...userStyle, ...graphUtilityClasses];
}

function sanitizeMessage(
  message: string,
  elements: cytoscape.ElementDefinition[]
) {
  let test = null;
  if ((test = edgeSource.exec(message))) {
    const { edge, source } = test.groups as { edge: string; source: string };
    const edgeElement = elements.find((e) => e.data.id === edge);
    edgeSource.lastIndex = 0;
    return message
      .replace(`\`${edge}\``, `to line ${edgeElement?.data?.lineNumber}`)
      .replace(`\`${source}\``, "")
      .replace("with", "from");
  }
  return message;
}

const edgeSource =
  /Can not create edge `(?<edge>[^`]+)` with nonexistant source `(?<source>[^`]+)`/gm;

function sanitizeStyleMessage(message: string) {
  if (/userStyle is not iterable/gi.test(message)) {
    return "Style object invalid";
  }
  return message;
}
