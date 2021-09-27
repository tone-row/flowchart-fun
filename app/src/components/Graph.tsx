import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import cytoscape, {
  Core,
  CytoscapeOptions,
  EdgeSingular,
  NodeSingular,
} from "cytoscape";
import { useDebouncedCallback } from "use-debounce";
import dagre from "cytoscape-dagre";
import cytoscapeSvg from "cytoscape-svg";
import { delimiters, GraphOptionsObject, defaultLayout } from "../constants";
import { parseText, stripComments } from "../utils";
import styles from "./Graph.module.css";
import { Box } from "../slang";
import { compressToEncodedURIComponent as compress } from "lz-string";
import frontmatter from "gray-matter";
import { AppContext } from "./AppContext";
import { colors } from "../slang/config";
import { useAnimationSetting } from "../hooks";
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
    const { theme, setShareLink, setHasError } = useContext(AppContext);
    const themeString = JSON.stringify(theme);

    const handleResize = useCallback(() => {
      if (cy.current) {
        cy.current.resize();
        cy.current.animate({ fit: { padding: 6 } } as any);
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

    // Update
    useEffect(() => {
      updateGraph(
        cy,
        textToParse,
        errorCatcher,
        setHasError,
        graphInitialized,
        animate,
        themeString
      );
    }, [animate, setHasError, textToParse, themeString]);

    return (
      <Box
        className={[styles.GraphContainer, "graph"].join(" ")}
        overflow="hidden"
        h="100%"
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
    layout: { ...defaultLayout },
    elements: [],
    style: getCyStyleFromTheme(colors),
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

function updateGraph(
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  textToParse: string,
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  setHasError: React.Dispatch<React.SetStateAction<boolean>>,
  graphInitialized: React.MutableRefObject<boolean>,
  animate: boolean,
  themeString: string
) {
  if (cy.current) {
    try {
      const { data, content, matter } = frontmatter(
        stripComments(textToParse),
        {
          delimiters,
        }
      );

      const startingLineNumber =
        !matter || matter === "" ? 0 : matter.split("\n").length + 1;
      const { layout = {}, style: userStyle = [] } = data as GraphOptionsObject;

      // Prepare Styles
      const style = getCyStyleFromTheme(JSON.parse(themeString), userStyle);

      // Parse
      const elements = parseText(content, startingLineNumber);

      // Test Error First
      errorCatcher.current?.json({ elements, style });
      errorCatcher.current?.layout({
        ...defaultLayout,
        ...layout,
      });

      // Real
      cy.current
        .json({
          elements: elements,
          style,
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
      setHasError(false);
    } catch (e) {
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      setHasError(true);
    }
  }
}

function getCyStyleFromTheme(
  theme: typeof colors,
  nextUserStyles: cytoscape.Stylesheet[] = []
): CytoscapeOptions["style"] {
  return [
    {
      selector: "node",
      style: {
        backgroundColor: theme.background,
        "border-color": theme.foreground,
        color: theme.foreground,
        label: "data(label)",
        "font-size": 10,
        "text-wrap": "wrap",
        "text-max-width": "80",
        "text-valign": "center",
        "text-halign": "center",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-height": 1.25,
        "border-width": 1,
        shape: "rectangle",
        "font-family":
          "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
        width: "data(width)",
        height: "data(height)",
      },
    },
    {
      selector: "edge",
      style: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "loop-direction": "0deg",
        "loop-sweep": "20deg",
        width: 1,
        "text-background-opacity": 1,
        "text-background-color": theme.background,
        "line-color": theme.foreground,
        "target-arrow-color": theme.foreground,
        "target-arrow-shape": "vee",
        "arrow-scale": 1,
        "curve-style": "bezier",
        label: "data(label)",

        color: theme.foreground,
        "font-size": 10,
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family":
          "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
        "text-halign": "center",
        "edge-text-rotation": "autorotate",
      },
    },
    {
      selector: ".edgeHovered",
      style: {
        "line-color": theme.edgeHover,
        "target-arrow-color": theme.edgeHover,
        color: theme.edgeHover,
      },
    },
    {
      selector: ".nodeHovered",
      style: {
        backgroundColor: theme.nodeHover,
      },
    },
    ...nextUserStyles,
  ];
}
