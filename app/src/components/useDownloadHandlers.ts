import { useCallback, useContext, useEffect } from "react";
import { saveAs } from "file-saver";
import { AppContext } from "./AppContext";

declare global {
  interface Window {
    flowchartFunDownloadSVG: () => void;
    flowchartFunDownloadPNG: () => void;
    flowchartFunDownloadJPG: () => void;
  }
}

export default function useDownloadHandlers(
  textToParse: string,
  cy: React.MutableRefObject<cytoscape.Core | undefined>
) {
  const { theme } = useContext(AppContext);
  const downloadSVG = useCallback(() => {
    if (cy.current) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const svgStr = cy.current.svg({
        full: true,
        scale: 1.5,
        quality: 1,
        bg: theme.background === "#ffffff" ? undefined : theme.background,
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
      squares.forEach((el) => el.setAttribute("fill", theme.background));

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
    // cy is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textToParse, theme.background]);

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
        bg: theme.background,
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
  }, [theme.background]);

  useEffect(() => {
    window.flowchartFunDownloadSVG = downloadSVG;
    window.flowchartFunDownloadPNG = downloadPNG;
    window.flowchartFunDownloadJPG = downloadJPG;
  }, [downloadSVG, downloadPNG, downloadJPG]);
}
