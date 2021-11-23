import cytoscapeSvg from "@tone-row/cytoscape-svg";
import cytoscape, {
  Core,
  CytoscapeOptions,
  EdgeSingular,
  NodeSingular,
} from "cytoscape";
import dagre from "cytoscape-dagre";
import frontmatter from "gray-matter";
import { compressToEncodedURIComponent as compress } from "lz-string";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useDebouncedCallback } from "use-debounce";

import {
  defaultLayout,
  delimiters,
  GraphOptionsObject,
} from "../lib/constants";
import { GraphThemes, graphThemes } from "../lib/graphThemes";
import { useAnimationSetting, useGetSize, useGraphTheme } from "../lib/hooks";
import { parseText, stripComments } from "../lib/utils";
import { Box } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./Graph.module.css";
import useDownloadHandlers from "./useDownloadHandlers";

declare global {
  interface Window {
    _flowchartFunGraph?: cytoscape.Core;
  }
}

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.use(cytoscapeSvg);
  cytoscape.prototype.hasInitialised = true;
}

const Graph = memo(
  ({
    textToParse,
    setHoverLineNumber,
    shouldResize,
  }: {
    textToParse: string;
    setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
    shouldResize: number;
  }) => {
    const cy = useRef<undefined | Core>();
    const errorCatcher = useRef<undefined | Core>();
    const animate = useAnimationSetting();
    const graphInitialized = useRef(false);
    const { setShareLink, setHasError, setHasStyleError } =
      useContext(AppContext);

    const graphTheme = useGraphTheme();
    const getSize = useGetSize(
      graphThemes[graphTheme].minWidth,
      graphThemes[graphTheme].minHeight
    );

    const handleResize = useCallback(() => {
      if (cy.current) {
        cy.current.resize();
        // cy.current.animate({ fit: { padding: 6 } } as any);
      }
    }, []);

    useEffect(() => {
      handleResize();
    }, [handleResize, shouldResize]);

    const debouncedResize = useDebouncedCallback(handleResize, 250);

    useEffect(() => {
      window.addEventListener("resize", debouncedResize.callback);
      return () =>
        window.removeEventListener("resize", debouncedResize.callback);
    }, [debouncedResize]);

    useDownloadHandlers(textToParse, cy);

    useEffect(() => {
      setShareLink(compress(textToParse));
    }, [setShareLink, textToParse]);

    // Initialize Graph
    useEffect(
      () => initializeGraph(errorCatcher, cy, setHoverLineNumber),
      [setHoverLineNumber]
    );

    const lastValues = useRef<{
      content: string;
      startingLineNumber: number;
      layout: string;
      userStyle: string;
    }>({ content: "", startingLineNumber: 0, layout: "", userStyle: "" });

    const { content, startingLineNumber, layout, userStyle } = useMemo(() => {
      try {
        const { data, content, matter } = frontmatter(
          stripComments(textToParse),
          {
            delimiters,
          }
        );
        const { layout = {}, style: userStyle = [] } =
          data as GraphOptionsObject;
        const startingLineNumber =
          !matter || matter === "" ? 0 : matter.split("\n").length + 1;
        const values = {
          content,
          startingLineNumber,
          layout: JSON.stringify(layout),
          userStyle: JSON.stringify(userStyle),
        };
        lastValues.current = values;
        return values;
      } catch {
        return lastValues.current;
      }
    }, [textToParse]);

    // Update Style
    useEffect(() => {
      updateStyle(cy, userStyle, errorCatcher, setHasStyleError, graphTheme);
    }, [graphTheme, setHasStyleError, userStyle]);

    // Update Graph Nodes
    useEffect(() => {
      updateGraph(
        cy,
        content,
        startingLineNumber,
        layout,
        errorCatcher,
        setHasError,
        graphInitialized,
        animate,
        getSize
      );
    }, [animate, content, getSize, layout, setHasError, startingLineNumber]);

    return (
      <Box
        className={[styles.GraphContainer, "graph"].join(" ")}
        overflow="hidden"
        h="100%"
        style={{ backgroundColor: graphThemes[graphTheme].bg }}
      >
        <Box id="cy" overflow="hidden" />
      </Box>
    );
  }
);

Graph.displayName = "Graph";

export default Graph;

function initializeGraph(
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  setHoverLineNumber: React.Dispatch<React.SetStateAction<number | undefined>>
) {
  errorCatcher.current = cytoscape();
  cy.current = cytoscape({
    container: document.getElementById("cy"), // container to render in
    layout: { ...(defaultLayout as cytoscape.LayoutOptions) },
    elements: [],
    style: getCytoStyle("original"),
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    wheelSensitivity: 0.2,
  });
  window._flowchartFunGraph = cy.current;
  const cyCurrent = cy.current;
  const errorCyCurrent = errorCatcher.current;

  // Hovering Events
  function nodeHighlight(this: NodeSingular) {
    this.addClass("nodeHovered");
    setHoverLineNumber(this.data().lineNumber);
  }
  function edgeHighlight(this: EdgeSingular) {
    this.addClass("edgeHovered");
    setHoverLineNumber(this.data().lineNumber);
  }
  function unhighlight(this: NodeSingular | EdgeSingular) {
    this.removeClass("nodeHovered");
    this.removeClass("edgeHovered");
    setHoverLineNumber(undefined);
  }
  function handleMouseOut() {
    cyCurrent.$(".nodeHovered").removeClass("nodeHovered");
    cyCurrent.$(".edgeHovered").removeClass("edgeHovered");
    setHoverLineNumber(undefined);
  }

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
}

// Update nodes & edges
function updateGraph(
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  content: string,
  startingLineNumber: number,
  layoutString: string,
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  setHasError: React.Dispatch<React.SetStateAction<boolean>>,
  graphInitialized: React.MutableRefObject<boolean>,
  animate: boolean,
  getSize: (label: string) =>
    | {
        width: number;
        height: number;
      }
    | undefined
) {
  if (cy.current) {
    try {
      const layout = JSON.parse(layoutString) as GraphOptionsObject["layout"];

      // Parse
      const elements = parseText(content, getSize, startingLineNumber);

      // Test Error First
      errorCatcher.current?.json({ elements });
      errorCatcher.current?.layout({
        ...(defaultLayout as cytoscape.LayoutOptions),
        ...layout,
      });

      // Real
      cy.current
        .json({
          elements: elements,
        })
        .layout({
          ...defaultLayout,
          ...layout,
          animate: graphInitialized.current
            ? elements.length < 200
              ? animate
              : false
            : false,
        } as any)
        .run();
      cy.current.center();
      graphInitialized.current = true;

      // Reinitialize to avoid missing errors
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      // debugger;
      setHasError(false);
    } catch (e) {
      console.log(e);
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      // debugger;
      setHasError(true);
    }
  }
}

function updateStyle(
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  userStyleString: string,
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  setHasStyleError: React.Dispatch<React.SetStateAction<boolean>>,
  graphTheme: GraphThemes
) {
  if (cy.current) {
    try {
      const userStyle = JSON.parse(
        userStyleString
      ) as GraphOptionsObject["style"];
      // Prepare Styles
      const style = getCytoStyle(graphTheme, userStyle);

      // Test Error First
      errorCatcher.current?.json({ style });

      // Real
      cy.current.json({
        style,
      });

      // Reinitialize to avoid missing errors
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      setHasStyleError(false);
    } catch (e) {
      console.log(e);
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      setHasStyleError(true);
    }
  }
}

function getCytoStyle(
  theme: GraphThemes,
  userStyle: cytoscape.Stylesheet[] = []
): CytoscapeOptions["style"] {
  return [...graphThemes[theme].styles, ...userStyle];
}
