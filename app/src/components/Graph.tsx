import cytoscapeSvg from "@tone-row/cytoscape-svg";
import { Core, CytoscapeOptions, EdgeSingular, NodeSingular } from "cytoscape";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import frontmatter from "gray-matter";
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
import { TriggerEvent, useContextMenu } from "react-contexify";
import { useDebouncedCallback } from "use-debounce";

import { gaChangeGraphOption, gaUseGraphContextMenu } from "../lib/analytics";
import {
  defaultLayout,
  delimiters,
  GraphOptionsObject,
} from "../lib/constants";
import { cytoscape } from "../lib/cytoscape";
import { useBackground, useGraphTheme } from "../lib/graphThemes";
import { graphUtilityClasses } from "../lib/graphUtilityClasses";
import { HiddenGraphOptions, isError } from "../lib/helpers";
import { useAnimationSetting } from "../lib/hooks";
import { parseText } from "../lib/parseText";
import { preprocessGraphLayout } from "../lib/preprocessGraphLayout";
import { StoreGraph, useStoreGraph } from "../lib/store.graph";
import { Theme } from "../lib/themes/constants";
import original from "../lib/themes/original";
import { TGetSize, useGetSize } from "../lib/useGetSize";
import { stripComments } from "../lib/utils";
import { Box } from "../slang";
import { AppContext, TAppContext } from "./AppContext";
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

const Graph = memo(
  ({
    textToParse,
    setHoverLineNumber,
    shouldResize,
    linesOfYaml = 0,
    setHiddenGraphOptions,
    hiddenGraphOptions = {},
  }: {
    textToParse: string;
    linesOfYaml?: number;
    setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
    shouldResize: number;
    setHiddenGraphOptions?: (newOptions: HiddenGraphOptions) => void;
    hiddenGraphOptions?: HiddenGraphOptions;
  }) => {
    const cy = useRef<undefined | Core>();
    const errorCatcher = useRef<undefined | Core>();
    const animate = useAnimationSetting();
    const graphInitialized = useRef(false);
    const { setHasError, setHasStyleError } = useContext(AppContext);

    const theme = useGraphTheme();
    const bg = useBackground();
    const getSize = useGetSize(theme);
    const setLayout = useStoreGraph((store) => store.setLayout);
    const setElements = useStoreGraph((store) => store.setElements);
    const runLayout = useStoreGraph((store) => store.runLayout);
    const setRunLayout = useStoreGraph((store) => store.setRunLayout);
    const graphUpdateNumber = useStoreGraph(
      useCallback((store) => store.graphUpdateNumber, [])
    );

    const isFirstRender = useRef(true);

    // Always begin with the layout running
    useEffect(() => {
      setRunLayout("nodePositions" in hiddenGraphOptions ? false : true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDragFree = useCallback(() => {
      const nodePositions = getNodePositionsFromCy();
      setRunLayout(false);
      setHiddenGraphOptions && setHiddenGraphOptions({ nodePositions });
      gaChangeGraphOption({ action: "Auto Layout", label: "TOGGLE" });
    }, [setHiddenGraphOptions, setRunLayout]);

    const handleResize = useCallback(() => {
      if (cy.current) {
        cy.current.resize();
        if (isFirstRender.current) {
          cy.current.fit(undefined, 6);
          isFirstRender.current = false;
        } else {
          cy.current.animate({ fit: { padding: 6 } } as any);
        }
      }
    }, []);

    const debouncedResize = useDebouncedCallback(handleResize, 250);

    useEffect(() => {
      window.addEventListener("resize", debouncedResize.callback);
      return () =>
        window.removeEventListener("resize", debouncedResize.callback);
    }, [debouncedResize]);

    useDownloadHandlers(textToParse, cy);

    // Initialize Graph
    useEffect(
      () =>
        initializeGraph({
          errorCatcher,
          cy,
          setHoverLineNumber,
        }),
      [setHoverLineNumber]
    );

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

    const lastValues = useRef<{
      content: string;
      layout: string;
      userStyle: string;
    }>({ content: "", layout: "", userStyle: "" });

    const { content, layout, userStyle } = useMemo(() => {
      try {
        const { data, content } = frontmatter(stripComments(textToParse), {
          delimiters,
        });
        const { layout = {}, style: userStyle = [] } =
          data as GraphOptionsObject;
        const values = {
          content,
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
      updateStyle(cy, userStyle, errorCatcher, setHasStyleError, theme);
    }, [theme, setHasStyleError, userStyle]);

    const hiddenGraphOptionsString = JSON.stringify(hiddenGraphOptions);

    // Update Graph Nodes
    useEffect(() => {
      updateGraph({
        cy,
        content,
        layoutString: layout,
        errorCatcher,
        setHasError,
        graphInitialized,
        animate,
        getSize,
        setLayout,
        setElements,
        runLayout,
        lineNumberStart: linesOfYaml,
        hiddenGraphOptionsString,
      });
    }, [
      animate,
      content,
      getSize,
      layout,
      linesOfYaml,
      runLayout,
      setElements,
      setHasError,
      setLayout,
      // Force update on graphUpdateNumber change
      graphUpdateNumber,
      hiddenGraphOptionsString,
    ]);

    const { show } = useContextMenu({ id: GRAPH_CONTEXT_MENU_ID });
    const handleContextMenu = (e: TriggerEvent) => {
      gaUseGraphContextMenu({ action: "SHOW" });
      show(e);
    };

    useEffect(() => {
      handleResize();
    }, [handleResize, shouldResize]);

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
  }
);

Graph.displayName = "Graph";

export default Graph;

function initializeGraph({
  errorCatcher,
  cy,
  setHoverLineNumber,
}: {
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  setHoverLineNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
}) {
  errorCatcher.current = cytoscape();
  cy.current = cytoscape({
    container: document.getElementById("cy"), // container to render in
    layout: { ...(defaultLayout as cytoscape.LayoutOptions) },
    elements: [],
    style: getCytoStyle(original),
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    wheelSensitivity: 0.2,
  });
  window.__cy = cy.current;
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
  // cyCurrent.on("dragfree", "node", handleDrag);
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
function updateGraph({
  cy,
  content,
  layoutString,
  errorCatcher,
  setHasError,
  graphInitialized,
  animate,
  getSize,
  setLayout,
  setElements,
  runLayout = true,
  lineNumberStart = 1,
  hiddenGraphOptionsString = "{}",
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  content: string;
  layoutString: string;
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  setHasError: TAppContext["setHasError"];
  graphInitialized: React.MutableRefObject<boolean>;
  animate: boolean;
  setLayout: StoreGraph["setLayout"];
  setElements: StoreGraph["setElements"];
  getSize: TGetSize;
  runLayout?: boolean;
  lineNumberStart?: number;
  hiddenGraphOptionsString?: string;
}) {
  if (cy.current) {
    let elements: cytoscape.ElementDefinition[] = [];

    try {
      const layout = preprocessGraphLayout(
        JSON.parse(layoutString) as GraphOptionsObject["layout"]
      );

      // Parse
      elements = parseText(content, getSize, lineNumberStart);

      // Parse Hidden Graph Options
      let hiddenGraphOptions: HiddenGraphOptions = {};
      try {
        hiddenGraphOptions = JSON.parse(hiddenGraphOptionsString);
      } catch (e) {
        console.error(e);
      }

      // Add positions if they exist
      const positions = hiddenGraphOptions.nodePositions;
      if (positions) {
        elements = elements.map((element) => {
          const id = element.data.id as string;
          if (id in positions) {
            element.position = positions[id];
          }
          return element;
        });
      }

      // Test Error First
      errorCatcher.current?.json({ elements });
      errorCatcher.current?.layout({
        ...(defaultLayout as cytoscape.LayoutOptions),
        ...layout,
      });

      // Real
      cy.current.json({
        elements: elements,
      });

      if (runLayout) {
        cy.current
          .layout({
            ...defaultLayout,
            ...layout,
            animate: graphInitialized.current
              ? elements.length < 200
                ? animate
                : false
              : false,
            animationDuration: animate ? 333 : 0,
          } as any)
          .run();
        cy.current.center();
      }

      graphInitialized.current = true;

      // Reinitialize to avoid missing errors
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      setHasError(false);

      // Update Graph Store
      setLayout(layout);
      setElements(elements);
    } catch (e) {
      console.log(e);
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      if (isError(e)) {
        setHasError(sanitizeMessage(e.message, elements));
      }
    }
  }
}

function updateStyle(
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  userStyleString: string,
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>,
  setHasStyleError: TAppContext["setHasStyleError"],
  graphTheme: Theme
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
      if (isError(e)) {
        setHasStyleError(sanitizeStyleMessage(e.message));
      }
    }
  }
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
