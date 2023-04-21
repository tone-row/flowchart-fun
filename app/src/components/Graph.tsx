import { Core, EdgeSingular, NodeSingular } from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import cytoscapeSvg from "cytoscape-svg";
import { operate } from "graph-selector";
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

import { buildStylesForGraph } from "../lib/buildStylesForGraph";
import { cytoscape } from "../lib/cytoscape";
import { getGetSize, TGetSize } from "../lib/getGetSize";
import { getLayout } from "../lib/getLayout";
import { getUserStyle } from "../lib/getUserStyle";
import { DEFAULT_GRAPH_PADDING } from "../lib/graphOptions";
import {
  useBackgroundColor,
  useCurrentTheme,
  useThemeKey,
} from "../lib/graphThemes";
import { isError } from "../lib/helpers";
import { getAnimationSettings } from "../lib/hooks";
import { Parsers, universalParse, useParser } from "../lib/parsers";
import { Theme } from "../lib/themes/constants";
import { useContextMenuState } from "../lib/useContextMenuState";
import { Doc, useDoc, useParseError } from "../lib/useDoc";
import { useGraphStore } from "../lib/useGraphStore";
import { useHoverLine } from "../lib/useHoverLine";
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
  const [initResizeNumber] = useState(shouldResize);
  const cy = useRef<undefined | Core>();
  const cyErrorCatcher = useRef<undefined | Core>();
  const isGraphInitialized = useRef(false);
  const themeKey = useThemeKey();
  const theme = useCurrentTheme(themeKey) as unknown as Theme;
  const bg = useBackgroundColor(theme);

  const getSize = useRef<TGetSize>(getGetSize(theme));
  const parser = useParser();

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
    () => getStyleUpdater({ cy, cyErrorCatcher, bg }),
    [bg]
  );

  // Apply theme
  useEffect(() => {
    throttleStyle(theme);
  }, [theme, throttleStyle]);

  // Update getSize when theme changes
  useEffect(() => {
    getSize.current = getGetSize(theme);
  }, [theme]);

  const throttleUpdate = useMemo(
    () =>
      getGraphUpdater({
        cy,
        cyErrorCatcher,
        isGraphInitialized,
        getSize,
        parser,
      }),
    [parser]
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

function handleDragFree(event: cytoscape.EventObject) {
  const { target } = event;
  const position = target.position() as { x: number; y: number };
  const lineNumber = target.data("lineNumber");
  const text = useDoc.getState().text;

  // add "fixed" class if it doesn't exist
  let newText = operate(text, {
    lineNumber,
    operation: ["addClassesToNode", { classNames: ["fixed"] }],
  });
  // add x and y data attributes
  newText = operate(newText, {
    lineNumber,
    operation: [
      "addDataAttributeToNode",
      { name: "x", value: round(position.x) },
    ],
  });
  newText = operate(newText, {
    lineNumber,
    operation: [
      "addDataAttributeToNode",
      { name: "y", value: round(position.y) },
    ],
  });
  useDoc.setState({ text: newText }, false, "Graph/handleDragFree");
}

/**
 * This function is used to round numbers to 2 decimal places
 */
function round(num: number) {
  return Math.round(num * 100) / 100;
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
        // DEFAULT LAYOUT MUST BE PRESET TO SUPPORT "FIXED" NODES
        layout: {
          name: "preset",
        },
      });
      window.__cy = cy.current;
      const cyCurrent = cy.current;
      const errorCyCurrent = cyErrorCatcher.current;

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
  getSize,
  parser,
}: {
  cy: MutableRefObject<cytoscape.Core | undefined>;
  cyErrorCatcher: MutableRefObject<cytoscape.Core | undefined>;
  isGraphInitialized: MutableRefObject<boolean>;
  getSize: MutableRefObject<TGetSize>;
  parser: Parsers;
}) {
  return throttle((_doc?: Doc) => {
    if (!cy.current) return;
    if (!cyErrorCatcher.current) return;
    const doc = _doc || useDoc.getState();
    let elements: cytoscape.ElementDefinition[] = [];

    try {
      const layout = getLayout(doc);
      elements = universalParse(parser, doc.text, getSize.current);

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
      cy.current.elements;

      cy.current
        .elements("*")
        .difference(".fixed")
        .layout({
          animate: shouldAnimate,
          animationDuration: shouldAnimate ? 333 : 0,
          ...layout,
          padding: DEFAULT_GRAPH_PADDING,
          fit: false,
        })
        .run()
        .listen("layoutstop", () => {
          cy.current?.fit(undefined, DEFAULT_GRAPH_PADDING);
        });

      // Reinitialize to avoid missing errors
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
      useParseError.setState({ error: "", errorFromStyle: "" });

      // Update Graph Store
      useGraphStore.setState({ layout, elements });
    } catch (e) {
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
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
  cyErrorCatcher,
  bg,
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  cyErrorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  bg?: string;
}) {
  return throttle((theme: Theme) => {
    if (!cy.current || !cyErrorCatcher.current) return;
    try {
      // Prepare Styles
      const style = buildStylesForGraph(theme, getUserStyle(), bg);

      // Test Error First
      cyErrorCatcher.current.json({ style });

      // Real
      cy.current.json({
        style,
      });

      // Reinitialize to avoid missing errors
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
      useParseError.setState({ errorFromStyle: "" });
    } catch (e) {
      cyErrorCatcher.current.destroy();
      cyErrorCatcher.current = cytoscape();
      if (isError(e)) {
        useParseError.setState({
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
