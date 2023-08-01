import { Core, EdgeSingular, NodeSingular } from "cytoscape";
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
import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { useBackgroundColor } from "../lib/graphThemes";
import { isError } from "../lib/helpers";
import { getAnimationSettings } from "../lib/hooks";
import {
  preprocessCytoscapeStyle,
  useCytoscapeStyleImports,
} from "../lib/preprocessCytoscapeStyle";
import { useContextMenuState } from "../lib/useContextMenuState";
import { useCytoscapeStyle } from "../lib/useCytoscapeStyle";
import { Doc, useDoc, useParseErrorStore } from "../lib/useDoc";
import { updateModelMarkers, useEditorStore } from "../lib/useEditorStore";
import { useGraphStore } from "../lib/useGraphStore";
import { Box } from "../slang";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import styles from "./Graph.module.css";
import { GRAPH_CONTEXT_MENU_ID, GraphContextMenu } from "./GraphContextMenu";
import classNames from "classnames";
declare global {
  interface Window {
    __cy?: cytoscape.Core;
  }
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
      className={classNames(styles.GraphContainer, "graph rounded")}
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
        userZoomingEnabled: true,
        userPanningEnabled: true,
        wheelSensitivity: 0.2,
        boxSelectionEnabled: true,
        // autoungrabify: true,
        zoom: useGraphStore.getState().zoom,
        pan: useGraphStore.getState().pan,
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

      // on zoom
      cyCurrent.on("scrollzoom", () => {
        useGraphStore.setState({ autoFit: false });
      });

      // whenever the viewport is changed at all
      cyCurrent.on("viewport", (e) => {
        if (!useGraphStore.getState().autoFit) {
          const zoom = e.target.zoom();
          const pan = e.target.pan();
          useGraphStore.setState({ zoom, pan });
        }
      });

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

      // Determine whether to animate
      const shouldAnimate =
        isGraphInitialized.current &&
        elements.length < 200 &&
        isAnimationEnabled;

      // Determine whether to fit
      const autoFit = useGraphStore.getState().autoFit;

      cy.current
        .layout({
          animate: shouldAnimate,
          animationDuration: shouldAnimate ? 333 : 0,
          ...layout,
          fit: autoFit,
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
