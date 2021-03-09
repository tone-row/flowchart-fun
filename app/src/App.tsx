import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Box, Layout, Type } from "@tone-row/slang";
import styles from "./App.module.css";
import { useThrottleCallback } from "@react-hook/throttle";
import cytoscape, {
  Core,
  CytoscapeOptions,
  EdgeSingular,
  Layouts,
  NodeSingular,
} from "cytoscape";
import dagre from "cytoscape-dagre";
import { saveAs } from "file-saver";
import { useDebouncedCallback } from "use-debounce";
import cytoscapeSvg from "cytoscape-svg";
import { Github, Twitter } from "./svgs";
import useLocalStorage from "react-use-localstorage";
import Editor from "@monaco-editor/react";
import strip from "@tone-row/strip-comments";
import { Resizable } from "re-resizable";

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.use(cytoscapeSvg);
  cytoscape.prototype.hasInitialised = true;
}

const LAYOUT: any = {
  name: "dagre",
  fit: true,
  animate: true,
  rankDir: "LR",
  spacingFactor: 1.25,
};

const lineColor = "#000000";
const textColor = "#000000";

const defaultText = `this app works by typing
  new lines create new nodes
    indentation creates child nodes 
    and any text: before a colon+space creates a label
  [linking] you can link to nodes using their ID in parentheses
    like this: (1)
    lines have a default ID of their line-number
      but you can also supply a custom ID in brackets
        like this: (linking) // use single line comments
/*
or 
multiline 
comments

Have fun! 🎉
*/`;

function App() {
  const [textarea, setText] = useLocalStorage("flowcharts.fun", defaultText);
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    textarea
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);
  const [hoverLineNumber, setHoverLineNumber] = useState<undefined | number>();
  const editorRef = useRef(null);
  const decorations = useRef<any[]>([]);
  const [shouldResize, triggerResize] = useState(0);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      if (typeof hoverLineNumber === "number") {
        //@ts-ignore
        decorations.current = editor.deltaDecorations(
          [],
          [
            {
              range: {
                startLineNumber: hoverLineNumber,
                startColumn: 1,
                endLineNumber: hoverLineNumber,
                endColumn: 1,
              },
              options: {
                isWholeLine: true,
                className: "node-hover",
              },
            },
          ]
        );
      } else {
        // @ts-ignore
        decorations.current = editor.deltaDecorations(decorations.current, []);
      }
    }
  }, [hoverLineNumber]);

  useEffect(() => {
    setTextToParseThrottle(textarea);
  }, [textarea, setTextToParseThrottle]);

  return (
    <Layout className={styles.App}>
      <Resizable
        defaultSize={{
          width: "50%",
          height: "auto",
        }}
        maxWidth="90%"
        minWidth="10%"
        enable={{ right: true }}
        className={styles.TextareaContainer}
        onResizeStop={() => triggerResize((n) => n + 1)}
      >
        <Editor
          defaultValue={textarea}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            tabSize: 2,
            insertSpaces: true,
            wordBasedSuggestions: false,
            occurrencesHighlight: false,
            renderLineHighlight: false,
            highlightActiveIndentGuide: false,
            scrollBeyondLastLine: false,
            renderIndentGuides: false,
            overviewRulerBorder: false,
            lineDecorationsWidth: "10px",
            renderValidationDecorations: "off",
            hideCursorInOverviewRuler: true,
            matchBrackets: "never",
            selectionHighlight: false,
            lineHeight: 28,
          }}
          onChange={(value) => value && setText(value)}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
          }}
        />
      </Resizable>
      <Graph
        textToParse={textToParse}
        setHoverLineNumber={setHoverLineNumber}
        shouldResize={shouldResize}
      />
      <div id="resizer" className={styles.resizer} />
    </Layout>
  );
}

function Graph({
  textToParse,
  setHoverLineNumber,
  shouldResize,
}: {
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
  shouldResize: number;
}) {
  const cy = useRef<undefined | Core>();
  const errorCy = useRef<undefined | Core>();
  const layout = useRef<undefined | Layouts>();

  const updateGraph = useCallback(() => {
    if (cy.current) {
      let error = false;
      let newElements: cytoscape.ElementDefinition[] = [];
      try {
        newElements = parseText(textToParse);
        errorCy.current?.json({ elements: newElements });
      } catch {
        error = true;
        errorCy.current?.destroy();
        errorCy.current = cytoscape();
      }
      if (!error) {
        cy.current.json({ elements: newElements });
        cy.current.layout(LAYOUT as any).run();
        cy.current.center();
      }
    }
  }, [textToParse]);

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
    return () => window.removeEventListener("resize", debouncedResize.callback);
  }, [debouncedResize]);

  const downloadImage = useCallback(() => {
    if (cy.current) {
      // @ts-ignore
      const svgStr = cy.current.svg({ full: true, scale: 1.5 });
      const domparser = new DOMParser();
      let svgEl = domparser.parseFromString(svgStr, "image/svg+xml");
      let squares: Element[] = [
        ...svgEl.children[0].querySelectorAll("path"),
      ].filter(
        (x) =>
          !x.getAttribute("fill") &&
          x.getAttribute("paint-order") === "fill stroke markers"
      );
      squares = [...squares, ...svgEl.children[0].querySelectorAll("rect")];
      squares.forEach((el) => el.setAttribute("fill", "#ffffff"));

      // Add comment
      const originalTextComment = svgEl.createComment(
        `Original Flowchart Text (flowchart.fun):\n\n${textToParse}\n\n`
      );
      svgEl.children[0].appendChild(originalTextComment);
      const correctedSvgStr = svgEl.documentElement.outerHTML;
      saveAs(
        new Blob([correctedSvgStr], {
          type: "image/svg+xml;charset=utf-8",
        }),
        "flowchart.svg"
      );
    }
  }, [textToParse]);

  useEffect(() => {
    errorCy.current = cytoscape();
    cy.current = cytoscape({
      container: document.getElementById("cy"), // container to render in
      layout: LAYOUT,
      elements: [],
      style: [
        {
          selector: "node",
          style: {
            backgroundColor: "#FFFFFF",
            "border-color": lineColor,
            color: textColor,
            label: "data(label)",
            "font-size": 10,
            "text-wrap": "wrap",
            "text-max-width": "80",
            "text-valign": "center",
            "text-halign": "center",
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
            // @ts-ignore
            "loop-direction": "0deg",
            "loop-sweep": "20deg",
            width: 1,
            "text-background-opacity": 1,
            "text-background-color": "#ffffff",
            "line-color": lineColor,
            "target-arrow-color": lineColor,
            "target-arrow-shape": "vee",
            "arrow-scale": 1,
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 10,
            "text-valign": "center",
            "font-family":
              "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
            "text-halign": "center",
            // @ts-ignore
            "edge-text-rotation": "autorotate",
          },
        },
        {
          selector: ".edgeHovered",
          style: {
            "line-color": "#aaaaaa",
            "target-arrow-color": "#aaaaaa",
            color: "#aaaaaa",
          },
        },
        {
          selector: ".nodeHovered",
          style: {
            backgroundColor: "#ededec",
          },
        },
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    // Hovering Events
    function nodeHighlight(this: NodeSingular | EdgeSingular) {
      this.addClass("nodeHovered");
      setHoverLineNumber(this.data().lineNumber);
    }
    function edgeHighlight(this: NodeSingular | EdgeSingular) {
      this.addClass("edgeHovered");
      setHoverLineNumber(this.data().lineNumber);
    }
    function unhighlight(this: NodeSingular | EdgeSingular) {
      this.removeClass("nodeHovered");
      this.removeClass("edgeHovered");
      setHoverLineNumber(undefined);
    }
    cy.current.on("mouseover", "node", nodeHighlight);
    cy.current.on("mouseover", "edge", edgeHighlight);
    cy.current.on("tapstart", "node", nodeHighlight);
    cy.current.on("tapstart", "edge", edgeHighlight);
    cy.current.on("mouseout", "node, edge", unhighlight);
    cy.current.on("tapend", "node, edge", unhighlight);

    return () => {
      cy.current?.destroy();
      errorCy.current?.destroy();
      layout.current = undefined;
    };
  }, [setHoverLineNumber]);

  useEffect(() => {
    updateGraph();
  }, [updateGraph]);

  return (
    <Box className={styles.GraphContainer}>
      <Layout id="cy" />
      <Box className={styles.Buttons} p={1}>
        <div>
          <Type>Tone Row</Type>
          <a href="https://twitter.com/row_tone">
            <Twitter />
          </a>
          <a href="https://github.com/tone-row/flowchart-fun">
            <Github />
          </a>
        </div>
        <Type as="button" onClick={downloadImage} title="Download SVG">
          Download SVG
        </Type>
      </Box>
    </Box>
  );
}

export default App;

const idMatch = new RegExp(/^\s*\[(.*)\]/);
function parseText(text: string) {
  const matchIndent = new RegExp(/^( )+/g);
  const lines = strip(text, { preserveNewlines: true }).split("\n");
  let elements: CytoscapeOptions["elements"] = [];
  let lineNumber = 1;

  // Loop
  for (let line of lines) {
    if (line.trim() === "") {
      lineNumber++;
      continue;
    }
    let indentMatch = line.match(matchIndent);
    let linkMatch: RegExpMatchArray | null | string = getNodeLabel(line).match(
      /^\((.+)\)$/
    );
    if (linkMatch) {
      linkMatch = linkMatch[1];
    }

    if (indentMatch) {
      const indent = indentMatch[0];
      let parent;
      let checkLine = lineNumber;
      let checkLength = indent.length;

      while (checkLine >= 1) {
        checkLine -= 1;
        let currentLine = lines[checkLine - 1];

        /* Determine whether valid line */
        if (currentLine.trim() === "") {
          continue;
        }

        const currentLineIndent = currentLine.match(matchIndent);
        checkLength = currentLineIndent?.[0].length ?? 0;
        if (checkLength < indent.length) {
          parent = checkLine;
          break;
        }
      }
      // If we found a parent
      if (parent) {
        const source = getNodeId(lines[checkLine - 1], checkLine);
        const target = linkMatch ? linkMatch : getNodeId(line, lineNumber);

        // Find a unique id
        let id = `${source}_${target}:0`;
        while (elements.map(({ data: { id } }) => id).includes(id)) {
          let [, count] = id.split(":");
          count = (parseInt(count, 10) + 1).toString();
          id = `${source}_${target}:${count}`;
        }
        elements.push({
          data: {
            id,
            source,
            target,
            label: getEdgeLabel(line),
            lineNumber,
          },
        });
      }
    }
    if (!linkMatch) {
      const label = getNodeLabel(line);

      // Check for custom id
      const hasId = line.match(idMatch);
      elements.push({
        data: {
          id: hasId ? hasId[1] : lineNumber.toString(),
          label,
          lineNumber,
          ...getSize(label),
        },
      });
    }
    lineNumber++;
  }
  return elements;
}

const base = 12.5;
const minWidth = 8 * base;
const minHeight = 6 * base;

function getSize(label: string) {
  const resizer = document.getElementById("resizer");
  if (resizer) {
    // resizer.style.width = "128px";
    // const initialHeight = resizer.clientHeight;
    // const add = Math.max(0, Math.ceil((initialHeight - 150) / 50)) * 8;
    // resizer.style.width = `${128 + add}px`;
    resizer.innerHTML = label;
    if (resizer.firstChild) {
      const range = document.createRange();
      range.selectNodeContents(resizer.firstChild);
      const width = Array.from(range.getClientRects()).reduce(
        (max, { width }) => (width > max ? width : max),
        0
      );
      const finalSize = {
        width: Math.max(minWidth, cleanup(regressionX(width))),
        height: Math.max(minHeight, cleanup(regressionY(resizer.clientHeight))),
      };
      console.log(finalSize);
      return finalSize;
    }
  }
  return undefined;
}

function getEdgeLabel(line: string) {
  const hasId = line.match(idMatch);
  const lineWithoutId = hasId ? line.slice(hasId[0].length) : line;
  if (lineWithoutId.indexOf(": ") > -1) {
    return lineWithoutId.split(": ")[0].trim();
  }
  return "";
}
function getNodeLabel(line: string) {
  const hasId = line.match(idMatch);
  const lineWithoutId = hasId ? line.slice(hasId[0].length) : line;
  if (lineWithoutId.indexOf(": ") > -1) {
    return lineWithoutId.split(": ").slice(1).join(": ").trim();
  }
  return lineWithoutId.trim();
}
function getNodeId(line: string, lineNumber: number) {
  const hasId = line.match(idMatch);
  return hasId ? hasId[1] : lineNumber.toString();
}

// linear regression of text node width to graph node size
function regressionX(x: number) {
  return Math.floor(0.63567 * x + 6);
}
function regressionY(x: number) {
  return Math.floor(0.63567 * x + 20);
}

// put things roughly on the same scale
function cleanup(x: number) {
  return Math.ceil(x / base) * base;
}
