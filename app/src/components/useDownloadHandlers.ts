import { useCallback, useEffect } from "react";
import { saveAs } from "file-saver";
import { useGraphTheme } from "../hooks";
import { graphThemes } from "./graphThemes";

declare global {
  interface Window {
    flowchartFunGetSVG: () => string;
    flowchartFunDownloadSVG: () => void;
    flowchartFunDownloadPNG: () => void;
    flowchartFunDownloadJPG: () => void;
    flowchartFunGetGraphThemeBG: () => string;
  }
}

export default function useDownloadHandlers(
  textToParse: string,
  cy: React.MutableRefObject<cytoscape.Core | undefined>
) {
  const graphTheme = useGraphTheme();
  const { bg } = graphThemes[graphTheme];
  const getSVG = useCallback(() => {
    if (cy.current) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const svgStr = cy.current.svg({
        full: true,
        scale: 1.5,
        quality: 1,
        bg,
      });
      const domparser = new DOMParser();
      const svgEl = domparser.parseFromString(svgStr, "image/svg+xml");
      let squares: Element[] = [
        ...svgEl.children[0].querySelectorAll("path"),
      ].filter(
        (x) =>
          !x.getAttribute("fill") &&
          x.getAttribute("paint-order") === "fill stroke markers"
      );
      squares = [...squares, ...svgEl.children[0].querySelectorAll("rect")];
      squares.forEach((el) => el.setAttribute("fill", bg));

      // Add comment
      const originalTextComment = svgEl.createComment(
        `Original Flowchart Text (flowchart.fun):\n\n${textToParse}\n\n`
      );
      svgEl.children[0].appendChild(originalTextComment);

      svgEl.children[0].setAttribute(
        "viewBox",
        `0 0 ${svgEl.children[0].getAttribute(
          "width"
        )} ${svgEl.children[0].getAttribute("height")}`
      );

      const correctedSvgStr = svgEl.documentElement.outerHTML;
      return correctedSvgStr;
    }
    return "";
    // "cy" is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg, textToParse]);

  const downloadSVG = useCallback(() => {
    const correctedSvgStr = getSVG();
    if (correctedSvgStr)
      saveAs(
        new Blob([correctedSvgStr], {
          type: "image/svg+xml;charset=utf-8",
        }),
        "flowchart.svg"
      );
  }, [getSVG]);

  const downloadPNG = useCallback(() => {
    if (cy.current) {
      const pngStr = cy.current.png({
        full: true,
        scale: 2,
        output: "blob",
      });
      saveAs(
        new Blob([pngStr], {
          type: "image/png",
        }),
        "flowchart.png"
      );
    }
    // cy is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadJPG = useCallback(() => {
    if (cy.current) {
      const jpgStr = cy.current.jpg({
        full: true,
        scale: 2,
        quality: 1,
        output: "blob",
        bg,
      });
      saveAs(
        new Blob([jpgStr], {
          type: "image/jpg",
        }),
        "flowchart.jpg"
      );
    }
    // cy is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg]);

  const getGraphThemeBG = useCallback(() => {
    return graphThemes[graphTheme].bg;
  }, [graphTheme]);

  useEffect(() => {
    window.flowchartFunGetSVG = getSVG;
    window.flowchartFunDownloadSVG = downloadSVG;
    window.flowchartFunDownloadPNG = downloadPNG;
    window.flowchartFunDownloadJPG = downloadJPG;
    window.flowchartFunGetGraphThemeBG = getGraphThemeBG;
  }, [downloadJPG, downloadPNG, downloadSVG, getGraphThemeBG, getSVG]);
}
