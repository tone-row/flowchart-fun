import { Core, EdgeSingular, NodeSingular } from "cytoscape";
import { ParseError } from "graph-selector";
import throttle from "lodash.throttle";
import React, {
  memo,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useContextMenu } from "react-contexify";
import { useDebouncedCallback } from "use-debounce";

import { monacoMarkerErrorSeverity } from "../lib/constants";
import { cytoscape } from "../lib/cytoscape";
import { getElements } from "../lib/getElements";
import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import { isError } from "../lib/helpers";
import { getAnimationSettings, useCanEdit } from "../lib/hooks";
import {
  preprocessStyle,
  useCytoscapeStyleImports,
} from "../lib/preprocessStyle";
import { useContextMenuState } from "../lib/useContextMenuState";
import { Doc, useDoc, useParseErrorStore } from "../lib/useDoc";
import {
  moveCursorToLine,
  updateModelMarkers,
  useEditorStore,
} from "../lib/useEditorStore";
import { useGraphStore } from "../lib/useGraphStore";
import { Box } from "../slang";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import styles from "./Graph.module.css";
import { GRAPH_CONTEXT_MENU_ID, GraphContextMenu } from "./GraphContextMenu";
import classNames from "classnames";
import { getThemeEditor, toTheme, useBackground } from "../lib/toTheme";
import equal from "fast-deep-equal";
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

  // Sometimes we want to do things only on the first render
  const isFirstRender = useRef(true);
  const bg = useBackground();

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

  // Initialize Graph and Subscribe to doc for updates
  useEffect(() => {
    const destroy = initializeGraph({ cy, cyErrorCatcher });
    const update = getGraphUpdater({
      cy,
      cyErrorCatcher,
      isFirstRender,
    });
    isFirstRender.current = true;
    const unsubscribe = useDoc.subscribe((doc) => doc, update, {
      fireImmediately: true,
      equalityFn: equal,
    });
    return () => {
      unsubscribe();
      if (destroy) destroy();
    };
  }, []);

  // If we find out canEdit === false
  // then we set autoungrabify to true
  const canEdit = useCanEdit();
  useEffect(() => {
    if (cy.current && !canEdit) {
      cy.current.autoungrabify(true);
      cy.current.autounselectify(true);
    }
  }, [canEdit]);

  const { show } = useContextMenu({ id: GRAPH_CONTEXT_MENU_ID });

  useEffect(() => {
    if (initResizeNumber !== shouldResize) handleResize();
  }, [handleResize, initResizeNumber, shouldResize]);

  // On unmount reset graph store
  useEffect(() => {
    return () => {
      useGraphStore.setState({
        autoFit: true,
        zoom: undefined,
        pan: undefined,
      });
    };
  }, []);

  return (
    <Box
      h="100%"
      overflow="hidden"
      style={{ background: bg }}
      onContextMenu={show}
      className={classNames(styles.GraphContainer, "graph")}
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

function initializeGraph({
  cy,
  cyErrorCatcher,
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  cyErrorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
}) {
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
      zoom: useGraphStore.getState().zoom,
      pan: useGraphStore.getState().pan,
    });
    window.__cy = cy.current;
    const cyCurrent = cy.current;
    const errorCyCurrent = cyErrorCatcher.current;

    // Turn on grid guide
    // @ts-ignore
    // cy.current.gridGuide({
    //   snapToGridDuringDrag: true,
    //   snapToGridOnRelease: false,
    //   gridSpacing: 10,
    //   resize: true,
    // });

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

    // on double click, focus the line number in the editor
    cyCurrent.on(
      "dblclick",
      "node, edge",
      function handleDblClick(this: NodeSingular | EdgeSingular) {
        const { lineNumber } = this.data();
        moveCursorToLine(lineNumber);
      }
    );

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

    document.getElementById("cy")?.addEventListener("mouseout", handleMouseOut);

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
}

/**
 * Returns a debounced function that only relies
 * on the document to update the graph
 */
function getGraphUpdater({
  cy,
  cyErrorCatcher,
  isFirstRender,
}: {
  cy: MutableRefObject<cytoscape.Core | undefined>;
  cyErrorCatcher: MutableRefObject<cytoscape.Core | undefined>;
  isFirstRender: MutableRefObject<boolean>;
}) {
  return throttle((doc: Doc) => {
    if (!cy.current) return;
    if (!cyErrorCatcher.current) return;
    let elements: cytoscape.ElementDefinition[] = [];

    try {
      const themeEditor = getThemeEditor(doc);
      const { layout, style: themeStyle } = toTheme(themeEditor);

      // Eventually, this will become cytoscape again...
      const customCss = (doc.meta.cytoscapeStyle as string) ?? "";

      // Whether or not to only use the custom css
      const customCssOnly = (doc.meta?.customCssOnly as boolean) ?? false;

      const { style } = preprocessStyle(
        customCssOnly ? customCss : [themeStyle, customCss].join("\n")
      );

      elements = getElements(doc.text);

      // Test
      cyErrorCatcher.current.json({ elements, layout, style });

      // Very specific bug wrt to cose layouts
      // If it's the first render, randomize cannot be false
      // Because the graph has no positions yet
      if (layout.name === "fcose") {
        if (isFirstRender.current) {
          // @ts-ignore
          layout.randomize = true;
          // @ts-ignore
          layout.quality = "proof";
        } else {
          // @ts-ignore
          layout.randomize = false;
        }
      }

      // Finally we get rid of layouts when user has dragged
      // Apply the preset layout if nodePositions is defined
      const nodePositions = doc.meta?.nodePositions;
      if (typeof nodePositions === "object") {
        // @ts-ignore
        layout.positions = { ...nodePositions };
        layout.name = "preset";
        // @ts-ignore
        delete layout.spacingFactor;
      }

      cyErrorCatcher.current.layout(layout);

      // Set up a listener to mark the graph as initialized after the first layout run
      if (isFirstRender.current) {
        cy.current.fit(undefined, DEFAULT_GRAPH_PADDING);
        const onLayoutReady = () => {
          isFirstRender.current = false;
          cy.current?.off("layoutstop", onLayoutReady);
        };
        cy.current.on("layoutstop", onLayoutReady);
      }

      // Update
      cy.current.json({ elements, style });

      // Determine whether to animate
      const shouldAnimate =
        !isFirstRender.current && elements.length < 200 && isAnimationEnabled;

      // Determine whether to fit
      const autoFit = useGraphStore.getState().autoFit;

      cy.current
        .layout({
          animate: shouldAnimate,
          animationDuration: shouldAnimate ? 333 : 0,
          ...layout,
          // @ts-ignore
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
  }, 100);
}

function isParseError(e: unknown): e is ParseError {
  return e instanceof Error && e.name === "ParseError";
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
