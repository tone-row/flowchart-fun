import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { Box, Layout, Type } from "@tone-row/slang";
import styles from "./App.module.css";
import { useThrottleCallback } from "@react-hook/throttle";
import cytoscape, { Core, CytoscapeOptions, Layouts } from "cytoscape";
import dagre from "cytoscape-dagre";
import { saveAs } from "file-saver";
import { useDebouncedCallback } from "use-debounce";
import cytoscapeSvg from "cytoscape-svg";
import { Github, Twitter } from "./svgs";
import useLocalStorage from "react-use-localstorage";

cytoscape.use(dagre);
cytoscape.use(cytoscapeSvg);

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
  any text: before a colon+space creates a label
   and: you can link to nodes with their line number in parentheses
    like this: (1)`;

function App() {
  const [textarea, setText] = useLocalStorage("flowcharts.fun", defaultText);
  const [textToParse, setTextToParse] = useReducer(
    (t: string, u: string) => u,
    textarea
  );
  const setTextToParseThrottle = useThrottleCallback(setTextToParse, 2);

  return (
    <Layout className={styles.App}>
      <Layout className={styles.TextareaContainer}>
        <Box
          as="textarea"
          value={textarea}
          placeholder={defaultText}
          onKeyDown={(e: any)=> {
            if (e.keyCode === 9) {
              // Tab Key pressed
              setText(e.target.value + '  ');
              setTextToParseThrottle(e.target.value + '  ');
              e.preventDefault();
              return false;
            }
          }}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
            setTextToParseThrottle(e.target.value);
          }}
        />
        <div className={styles.LineNumbers}>
          {textarea.split("\n").map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </Layout>
      <Graph textToParse={textToParse} />
    </Layout>
  );
}

function Graph({ textToParse }: { textToParse: string }) {
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
    cy.current?.invalidateDimensions();
    cy.current?.layout(LAYOUT as any).run();
    cy.current?.center();
  }, []);

  const debouncedResize = useDebouncedCallback(handleResize, 200);

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
      const correctedSvgStr = svgEl.documentElement.outerHTML;

      saveAs(
        new Blob([correctedSvgStr], {
          type: "image/svg+xml;charset=utf-8",
        })
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

    return () => {
      cy.current?.destroy();
      errorCy.current?.destroy();
      layout.current = undefined;
    };
  }, []);

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
        <Type as="button" onClick={downloadImage}>
          Download SVG
        </Type>
      </Box>
    </Box>
  );
}

export default App;

function parseText(text: string) {
  const matchIndent = new RegExp(/^( )+/g);
  const lines = text.split("\n");
  let elements: CytoscapeOptions["elements"] = [];
  let lineNumber = 1;
  for (const line of lines) {
    let indentMatch = line.match(matchIndent);
    let linkMatch: RegExpMatchArray | null | string = getNodeLabel(line).match(
      /^\((\d+)\)$/
    );
    if (linkMatch) {
      const linkToLine = parseInt(linkMatch[1]);
      linkMatch =
        linkToLine.toString() === linkMatch[1] ? linkToLine.toString() : null; // valid number
    }

    if (indentMatch) {
      const indent = indentMatch[0];
      let parent;
      let checkLine = lineNumber;
      let checkLength = indent.length;
      while (checkLine >= 1) {
        checkLine -= 1;
        let currentLine = lines[checkLine - 1];
        const currentLineIndent = currentLine.match(matchIndent);
        checkLength = currentLineIndent?.[0].length ?? 0;
        if (checkLength < indent.length) {
          parent = checkLine;
          break;
        }
      }
      // If we found a parent
      if (parent) {
        const source = parent.toString();
        const target = linkMatch ? linkMatch : lineNumber.toString();
        elements.push({
          data: {
            id: [source, target].join("_"),
            source,
            target,
            label: getEdgeLabel(line),
          },
        });
      }
    }
    if (!linkMatch) {
      elements.push({
        data: {
          id: lineNumber.toString(),
          label: getNodeLabel(line),
        },
      });
    }
    lineNumber++;
  }

  return elements;
}

function getEdgeLabel(line: string) {
  if (line.indexOf(": ") > -1) {
    return line.split(": ")[0].trim();
  }
  return "";
}
function getNodeLabel(line: string) {
  if (line.indexOf(": ") > -1) {
    return line.split(": ").slice(1).join(": ").trim();
  }
  return line.trim();
}
