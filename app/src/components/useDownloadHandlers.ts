import { saveAs } from "file-saver";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";

import { graphThemes } from "../lib/graphThemes";
import { useGraphTheme } from "../lib/hooks";

declare global {
  interface Window {
    flowchartFunGetSVG: () => Promise<string>;
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
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const filename = workspace || "flowchart";
  const graphTheme = useGraphTheme();
  const { bg } = graphThemes[graphTheme];
  window.flowchartFunGetSVG = async () => {
    if (!cy.current) throw new Error("Cytoscape not initialized");

    try {
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

      // Add comment
      const originalTextComment = svgEl.createComment(
        `Original Flowchart Text (flowchart.fun):\n\n${textToParse}\n\n`
      );

      // Fix Viewbox
      svgEl.children[0].appendChild(originalTextComment);
      svgEl.children[0].setAttribute(
        "viewBox",
        `0 0 ${svgEl.children[0].getAttribute(
          "width"
        )} ${svgEl.children[0].getAttribute("height")}`
      );

      const correctedSvgStr = svgEl.documentElement.outerHTML;
      const { optimize } = await import("svgo/dist/svgo.browser");

      const { data } = optimize(correctedSvgStr, {
        js2svg: { pretty: true, indent: 2 },
        plugins: ["removeDimensions"],
      });

      return data;
    } catch (e) {
      return "";
    }
  };

  window.flowchartFunDownloadSVG = async () => {
    const correctedSvgStr = await window.flowchartFunGetSVG();
    if (correctedSvgStr)
      saveAs(
        new Blob([correctedSvgStr], {
          type: "image/svg+xml;charset=utf-8",
        }),
        `${filename}.svg`
      );
  };

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
        `${filename}.png`
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
        `${filename}.jpg`
      );
    }
    // cy is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg]);

  const getGraphThemeBG = useCallback(() => {
    return graphThemes[graphTheme].bg;
  }, [graphTheme]);

  useEffect(() => {
    window.flowchartFunDownloadPNG = downloadPNG;
    window.flowchartFunDownloadJPG = downloadJPG;
    window.flowchartFunGetGraphThemeBG = getGraphThemeBG;
  }, [downloadJPG, downloadPNG, getGraphThemeBG]);
}
