import strip from "@tone-row/strip-comments";
import { CytoscapeOptions } from "cytoscape";
import { useLocation } from "react-router-dom";

const idMatch = new RegExp(/^\s*\[(.*)\]/);
export function parseText(text: string) {
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
    // TODO: Widen boxes as box height climbs
    // resizer.style.width = "128px";
    // const initialHeight = resizer.clientHeight;
    // const add = Math.max(0, Math.ceil((initialHeight - 150) / 50)) * 8;
    // resizer.style.width = `${128 + add}px`;
    resizer.innerHTML = preventBreakOnHypen(label);
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
  let value = lineWithoutId.trim();
  if (lineWithoutId.indexOf(": ") > -1) {
    value = lineWithoutId.split(": ").slice(1).join(": ").trim();
  }
  return stripSlashes(value);
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

function stripSlashes(str: string) {
  return str.replace(/\\(.)/gm, "$1");
}

function preventBreakOnHypen(str: string) {
  return str.replace(/-/gm, "&#x2011;");
}

export function useAnimationSetting() {
  let { search } = useLocation();
  const query = new URLSearchParams(search);
  const animation = query.get("animation");
  return animation === "0" ? false : true;
}
