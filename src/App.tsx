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
      <Layout className={styles.TextareaContainer}>
        <Editor
          defaultValue={textarea}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            tabSize: 2,
            insertSpaces: true,
            wordBasedSuggestions: false,
            occurrencesHighlight: false,
          }}
          onChange={(value) => value && setText(value)}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
          }}
        />
      </Layout>
      <Graph
        textToParse={textToParse}
        setHoverLineNumber={setHoverLineNumber}
      />
    </Layout>
  );
}

function Graph({
  textToParse,
  setHoverLineNumber,
}: {
  textToParse: string;
  setHoverLineNumber: Dispatch<SetStateAction<number | undefined>>;
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
        })
      );
    }
  }, [textToParse]);

  const downloadJson = useCallback(() => {
    if (cy.current) {
      saveAs(
        new File([JSON.stringify(cy.current.json())], "flowchart-fun.json")
      );
    }
  }, []);

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
            width: 100,
            height: 75,
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
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    // Hovering Events
    function highlight(this: NodeSingular | EdgeSingular) {
      setHoverLineNumber(this.data().lineNumber);
    }
    function unhighlight() {
      setHoverLineNumber(undefined);
    }
    cy.current.on("mouseover", "node, edge", highlight);
    cy.current.on("tapstart", "node, edge", highlight);
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
        <div className={styles.downloadOptions}>
          <Type as="button" onClick={downloadImage} title="Download SVG">
            Download SVG
          </Type>
          <span>|</span>
          <Type as="button" onClick={downloadJson} title="Download JSON">
            JSON
          </Type>
        </div>
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
      // Check for custom id
      const hasId = line.match(idMatch);
      elements.push({
        data: {
          id: hasId ? hasId[1] : lineNumber.toString(),
          label: getNodeLabel(line),
          lineNumber,
        },
      });
    }
    lineNumber++;
  }
  return elements;
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
