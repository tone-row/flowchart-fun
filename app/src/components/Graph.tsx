import { Core, EdgeSingular, NodeSingular } from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import cytoscapeSvg from "cytoscape-svg";
import { ParseError } from "graph-selector";
import throttle from "lodash.throttle";
import React, {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useContextMenu } from "react-contexify";
import { useDebouncedCallback } from "use-debounce";

import { monacoMarkerErrorSeverity } from "../lib/constants";
import { cytoscape } from "../lib/cytoscape";
import { getElements } from "../lib/getElements";
import { getLayout } from "../lib/getLayout";
import { useCytoscapeStyle } from "../lib/getUserStyle";
import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { useBackgroundColor } from "../lib/graphThemes";
import { isError } from "../lib/helpers";
import { getAnimationSettings } from "../lib/hooks";
import {
  preprocessCytoscapeStyle,
  useCytoscapeStyleImports,
} from "../lib/preprocessCytoscapeStyle";
import { useContextMenuState } from "../lib/useContextMenuState";
import { Doc, useDoc, useParseErrorStore } from "../lib/useDoc";
import { updateModelMarkers, useEditorStore } from "../lib/useEditorStore";
import { useGraphStore } from "../lib/useGraphStore";
import { Box } from "../slang";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import styles from "./Graph.module.css";
import { GRAPH_CONTEXT_MENU_ID, GraphContextMenu } from "./GraphContextMenu";
declare global {
  interface Window {
    __cy?: cytoscape.Core;
  }
}

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.use(klay);
  cytoscape.use(coseBilkent);
  cytoscape.use(cytoscapeSvg);
  cytoscape.prototype.hasInitialised = true;
}

const isAnimationEnabled = getAnimationSettings();

const Graph = memo(function Graph({ shouldResize }: { shouldResize: number }) {
  useCytoscapeStyleImports();
  const [initResizeNumber] = useState(shouldResize);
  const cy = useRef<undefined | Core>();
  const cyErrorCatcher = useRef<undefined | Core>();
  const isGraphInitialized = useRef(false);
  const bg = useBackgroundColor();

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

  // Initialize Graph
  useInitializeGraph({ cy, cyErrorCatcher });

  const throttleStyle = useMemo(
    () => getStyleUpdater({ cy, cyErrorCatcher }),
    []
  );

  // Get style
  const cytoscapeStyle = useCytoscapeStyle();

  // Apply style
  useEffect(() => {
    throttleStyle(cytoscapeStyle);
  }, [cytoscapeStyle, throttleStyle]);

  const throttleUpdate = useMemo(
    () =>
      getGraphUpdater({
        cy,
        cyErrorCatcher,
        isGraphInitialized,
      }),
    []
  );

  useEffect(() => {
    const unsubscribe = useDoc.subscribe(
      (doc) => doc,
      (doc) => {
        throttleUpdate(doc);
      },
      {
        fireImmediately: true,
      }
    );
    return unsubscribe;
  }, [throttleUpdate]);

  // Update Graph when Sponsor Layouts Load
  const sponsorLayoutsLoaded = useGraphStore(
    useCallback((store) => store.sponsorLayoutsLoaded, [])
  );
  useEffect(() => {
    if (sponsorLayoutsLoaded) throttleUpdate();
  }, [throttleUpdate, sponsorLayoutsLoaded]);

  const { show } = useContextMenu({ id: GRAPH_CONTEXT_MENU_ID });

  useEffect(() => {
    if (initResizeNumber !== shouldResize) handleResize();
  }, [handleResize, initResizeNumber, shouldResize]);

  return (
    <Box
      h="100%"
      overflow="hidden"
      style={{ background: bg }}
      onContextMenu={show}
      className={[styles.GraphContainer, "graph"].join(" ")}
    >
      <Box id="cy" overflow="hidden" />
      <GraphContextMenu />
    </Box>
  );
});

export default Graph;

function handleDragFree() {
  const nodePositions = getNodePositionsFromCy();
  useDoc.setState(
    (state) => {
      return {
        ...state,
        meta: {
          ...state.meta,
          nodePositions,
        },
      };
    },
    false,
    "Graph/handleDragFree"
  );
}

/**
 * This function sets up cytoscape and initializes the graph
 * but it doesn't set
 */
function useInitializeGraph({
  cyErrorCatcher,
  cy,
}: {
  cyErrorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
}) {
  useEffect(() => {
    try {
      cyErrorCatcher.current = cytoscape();
      // const bg = (useDoc.getState().meta?.background as string) ?? original.bg;
      cy.current = cytoscape({
        container: document.getElementById("cy"), // container to render in
        elements: [],
        // TODO: shouldn't this load the user's style as well?
        // TODO: not even loading the real theme... this seems sus
        // style: buildStylesForGraph(original, getUserStyle(), bg),
        userZoomingEnabled: true,
        userPanningEnabled: true,
        wheelSensitivity: 0.2,
        boxSelectionEnabled: true,
        // autoungrabify: true,
      });
      window.__cy = cy.current;
      const cyCurrent = cy.current;
      const errorCyCurrent = cyErrorCatcher.current;

      // Hover Events
      const handleMouseOut = () => {
        cyCurrent.$(".nodeHovered").removeClass("nodeHovered");
        cyCurrent.$(".edgeHovered").removeClass("edgeHovered");
        useEditorStore.setState({ hoverLineNumber: undefined });
      };

      cyCurrent.on("mouseover", "node", nodeHighlight);
      cyCurrent.on("mouseover", "edge", edgeHighlight);
      cyCurrent.on("tapstart", "node", nodeHighlight);
      cyCurrent.on("tapstart", "edge", edgeHighlight);
      cyCurrent.on("mouseout", "node, edge", unhighlight);
      cyCurrent.on("tapend", "node, edge", unhighlight);
      cyCurrent.on("cxttap", "node", function handleCtxTap(this: NodeSingular) {
        const { id, lineNumber } = this.data();
        if (id && lineNumber) {
          useContextMenuState.setState({
            active: {
              type: "node",
              id,
              lineNumber,
            },
          });
        }
      });
      cyCurrent.on("cxttap", "edge", function handleCtxTap(this: EdgeSingular) {
        const { id, lineNumber } = this.data();
        if (id && lineNumber) {
          useContextMenuState.setState({
            active: {
              type: "edge",
              id,
              lineNumber,
            },
          });
        }
      });
      // on node tap, if has a href, open it
      cyCurrent.on("tap", "node", function handleTap(this: NodeSingular) {
        const { href } = this.data();
        if (href) {
          window.open(href, "_blank");
        }
      });

      cyCurrent.on("dragfree", handleDragFree);

      document
        .getElementById("cy")
        ?.addEventListener("mouseout", handleMouseOut);

      return () => {
        cyCurrent.destroy();
        errorCyCurrent.destroy();
        cy.current = undefined;
        cyErrorCatcher.current = undefined;
        delete window.__cy;
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
      useEditorStore.setState({ hoverLineNumber: this.data().lineNumber });
    }
    function edgeHighlight(this: EdgeSingular) {
      this.addClass("edgeHovered");
      useEditorStore.setState({ hoverLineNumber: this.data().lineNumber });
    }
    function unhighlight(this: NodeSingular | EdgeSingular) {
      this.removeClass("nodeHovered");
      this.removeClass("edgeHovered");
      useEditorStore.setState({ hoverLineNumber: undefined });
    }
  }, [cy, cyErrorCatcher]);
}

/**
 * Returns a debounced function that only relies
 * on the document to update the graph
 */
function getGraphUpdater({
  cy,
  cyErrorCatcher,
  isGraphInitialized,
}: {
  cy: MutableRefObject<cytoscape.Core | undefined>;
  cyErrorCatcher: MutableRefObject<cytoscape.Core | undefined>;
  isGraphInitialized: MutableRefObject<boolean>;
}) {
  return throttle((_doc?: Doc) => {
    if (!cy.current) return;
    if (!cyErrorCatcher.current) return;
    const doc = _doc || useDoc.getState();
    let elements: cytoscape.ElementDefinition[] = [];

    try {
      const layout = getLayout(doc);
      elements = getElements(doc.text);

      // Test
      cyErrorCatcher.current.json({ elements });
      cyErrorCatcher.current.layout(layout);

      // Set up a listener to mark the graph as initialized after the first layout run
      if (!isGraphInitialized.current) {
        cy.current.fit(undefined, DEFAULT_GRAPH_PADDING);
        const onLayoutReady = () => {
          isGraphInitialized.current = true;
          cy.current?.off("layoutstop", onLayoutReady);
        };
        cy.current.on("layoutstop", onLayoutReady);
      }

      // Update
      cy.current.json({ elements });

      const shouldAnimate =
        isGraphInitialized.current &&
        elements.length < 200 &&
        isAnimationEnabled;
      cy.current
        .layout({
          animate: shouldAnimate,
          animationDuration: shouldAnimate ? 333 : 0,
          ...layout,
          padding: DEFAULT_GRAPH_PADDING,
        })
        .run();

      // Reinitialize to avoid missing errors
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
      // Reset error store
      useParseErrorStore.setState({
        error: "",
        errorFromStyle: "",
        parserErrorCode: "",
      });

      // Remove parse error markers
      useEditorStore.setState({ markers: [] });
      updateModelMarkers();

      // Update Graph Store
      useGraphStore.setState({ layout, elements });
    } catch (e) {
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();

      // Check if it's a parse error and display it in the editor
      if (isParseError(e)) {
        useEditorStore.setState({
          markers: [
            {
              startLineNumber: e.startLineNumber,
              endLineNumber: e.endLineNumber,
              startColumn: e.startColumn,
              endColumn: e.endColumn,
              message: e.message,
              severity: monacoMarkerErrorSeverity,
            },
          ],
        });
        updateModelMarkers();

        // translate the error and set it in the store
        useParseErrorStore.setState({
          parserErrorCode: e.code,
        });
      } else if (isError(e)) {
        useParseErrorStore.setState({
          errorFromStyle: sanitizeMessage(e.message, elements),
        });
      }
    }
    console.log("Graph Rendered");
  }, 333);
}

function isParseError(e: unknown): e is ParseError {
  return e instanceof Error && e.name === "ParseError";
}

function getStyleUpdater({
  cy,
  cyErrorCatcher,
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  cyErrorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
}) {
  return throttle(async (_style: string) => {
    if (!cy.current || !cyErrorCatcher.current) return;
    try {
      const { style } = preprocessCytoscapeStyle(_style);

      // Test Error First
      cyErrorCatcher.current.json({ style });

      // Real
      cy.current.json({
        style,
      });

      // Reinitialize to avoid missing errors
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
      useParseErrorStore.setState({ errorFromStyle: "" });
    } catch (e) {
      console.log(e);
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
      if (isError(e)) {
        useParseErrorStore.setState({
          errorFromStyle: sanitizeStyleMessage(e.message),
        });
      }
    }
  }, 333);
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
