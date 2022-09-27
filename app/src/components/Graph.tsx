import cytoscapeSvg from "@tone-row/cytoscape-svg";
import { Core, CytoscapeOptions, EdgeSingular, NodeSingular } from "cytoscape";
import dagre from "cytoscape-dagre";
import klay from "cytoscape-klay";
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { TriggerEvent, useContextMenu } from "react-contexify";
import { useDebouncedCallback } from "use-debounce";

import { gaChangeGraphOption, gaUseGraphContextMenu } from "../lib/analytics";
import { defaultLayout, GraphOptionsObject } from "../lib/constants";
import { cytoscape } from "../lib/cytoscape";
import { graphUtilityClasses } from "../lib/graphUtilityClasses";
import { HiddenGraphOptions, isError } from "../lib/helpers";
import { useAnimationSetting } from "../lib/hooks";
import { parseText } from "../lib/parseText";
import { prepareLayoutForCyto } from "../lib/prepareLayoutForCyto";
import { Theme } from "../lib/themes/constants";
import original from "../lib/themes/original";
import { UpdateDoc } from "../lib/UpdateDoc";
import { TGetSize, useGetSize } from "../lib/useGetSize";
import { useGraphStore } from "../lib/useGraphStore";
import { Box } from "../slang";
import { AppContext, TAppContext } from "./AppContext";
import { getNodePositionsFromCy } from "./getNodePositionsFromCy";
import styles from "./Graph.module.css";
import { GRAPH_CONTEXT_MENU_ID, GraphContextMenu } from "./GraphContextMenu";
import useDownloadHandlers from "./useDownloadHandlers";
import { UseGraphOptionsReturn } from "./useGraphOptions";

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
    hiddenGraphOptionsText = "{}",
    options,
    update,
    theme,
    bg,
  }: {
    textToParse: string;
    setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
    shouldResize: number;
    hiddenGraphOptionsText: string;
    options: UseGraphOptionsReturn;
    update?: UpdateDoc;
    theme: Theme;
    bg: string;
  }) => {
    const cy = useRef<undefined | Core>();
    const errorCatcher = useRef<undefined | Core>();
    const animate = useAnimationSetting();
    const graphInitialized = useRef(false);
    const { setHasError, setHasStyleError } = useContext(AppContext);
    const layout = JSON.stringify(options.graphOptions.layout || {});
    const userStyle = JSON.stringify(options.graphOptions.style || []);

    const getSize = useGetSize(theme);
    const graphUpdateNumber = useGraphStore(
      useCallback((store) => store.graphUpdateNumber, [])
    );

    const isFirstRender = useRef(true);

    const handleDragFree = useCallback(() => {
      if (!update) return;
      console.log("drag free");

      const nodePositions = getNodePositionsFromCy();
      update({
        options: {
          layout: { name: "preset" },
        },
        hidden: { nodePositions },
      });

      // currently handles the state of the Freeze Layout button
      useGraphStore.setState({ runLayout: false });

      gaChangeGraphOption({ action: "Auto Layout", label: "TOGGLE" });
    }, [update]);

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

    useDownloadHandlers(textToParse, cy, theme, bg);

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

    // Update Style
    useEffect(() => {
      updateStyle(cy, userStyle, errorCatcher, setHasStyleError, theme);
    }, [theme, setHasStyleError, userStyle]);

    const updateTheGraph = useCallback(() => {
      updateGraph({
        cy,
        content: options.content,
        layoutString: layout,
        errorCatcher,
        setHasError,
        graphInitialized,
        animate,
        getSize,
        hiddenGraphOptionsText,
      });
    }, [
      animate,
      getSize,
      hiddenGraphOptionsText,
      layout,
      options.content,
      setHasError,
    ]);

    // Update Graph Nodes
    useEffect(() => {
      updateTheGraph();
    }, [updateTheGraph, graphUpdateNumber]);

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
  hiddenGraphOptionsText = "{}",
}: {
  cy: React.MutableRefObject<cytoscape.Core | undefined>;
  content: string;
  layoutString: string;
  errorCatcher: React.MutableRefObject<cytoscape.Core | undefined>;
  setHasError: TAppContext["setHasError"];
  graphInitialized: React.MutableRefObject<boolean>;
  animate: boolean;
  getSize: TGetSize;
  hiddenGraphOptionsText?: string;
}) {
  if (cy.current) {
    let elements: cytoscape.ElementDefinition[] = [];

    try {
      // Parse Hidden Graph Options
      let hiddenGraphOptions: HiddenGraphOptions = {};
      try {
        hiddenGraphOptions = JSON.parse(hiddenGraphOptionsText);
      } catch (e) {
        console.error(e);
      }

      const layout = prepareLayoutForCyto(
        JSON.parse(layoutString) as GraphOptionsObject["layout"],
        hiddenGraphOptions
      );

      // Parse
      elements = parseText(content, getSize);

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

      if (layout?.name !== "preset") {
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
      } else {
        cy.current
          .layout({
            ...layout,
            animate: false,
            fit: false,
          } as any)
          .run();
      }

      graphInitialized.current = true;

      // Reinitialize to avoid missing errors
      errorCatcher.current?.destroy();
      errorCatcher.current = cytoscape();
      setHasError(false);

      // Update Graph Store
      useGraphStore.setState({ layout, elements });
    } catch (e) {
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
