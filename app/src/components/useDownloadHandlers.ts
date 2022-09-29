import { saveAs } from "file-saver";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Theme } from "../lib/themes/constants";

// padding, gets divided in half
const PADDING = 60;

declare global {
  interface Window {
    __FF_getSVG: () => Promise<string>;
    __FF_downloadSVG: () => void;
    __FF_downloadPNG: () => void;
    __FF_copyPNG: () => Promise<void>;
    __FF_downloadJPG: () => void;
    __FF_getGraphThemeBG: () => string;
  }
}

export default function useDownloadHandlers(
  cy: React.MutableRefObject<cytoscape.Core | undefined>,
  graphTheme: Theme,
  bg: string
) {
  const { workspace = "" } = useParams<{ workspace?: string }>();
  const filename = workspace || "flowchart";

  useEffect(() => {
    window.__FF_getSVG = async () => {
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

        const pad = PADDING / 2;
        const svgTag = svgEl.children[0];
        const bgRect = svgTag.querySelector("rect");

        // add an attribute to recognize it
        if (bgRect) bgRect.setAttribute("data-bg", "");

        // create a group and move all svg children into it
        const group = svgEl.createElementNS("http://www.w3.org/2000/svg", "g");
        while (svgTag.firstChild) {
          group.appendChild(svgTag.firstChild);
        }
        svgTag.appendChild(group);
        group.setAttribute("transform", `translate(${pad}, ${pad})`);

        // update width to include padding
        const w = parseInt(svgTag.getAttribute("width") || "0", 10);
        const h = parseInt(svgTag.getAttribute("height") || "0", 10);
        const padWidth = w + PADDING;
        const padHeight = h + PADDING;
        svgTag.setAttribute("width", padWidth.toString());
        svgTag.setAttribute("height", padHeight.toString());

        if (bgRect) {
          // move bgRect out of group to the top level
          svgTag.insertBefore(bgRect, group);
          // make full size
          bgRect.setAttribute("width", padWidth.toString());
          bgRect.setAttribute("height", padHeight.toString());
        }

        // Add font file if necessary
        let fontString = "";
        const files = graphTheme.font.files;
        if (files) {
          for (const { url, name } of files) {
            if (!(url in window.__flowchartFunBase64EncodedFonts)) {
              const fontUrl = `/fonts/${url}`;
              const font = await fetch(fontUrl)
                .then((res) => res.arrayBuffer())
                .catch((e) => console.error(e));
              if (!font) continue;
              const base64 = arrayBufferToBase64(font);
              window.__flowchartFunBase64EncodedFonts[url] = base64;
            }
            fontString += `@font-face { font-family: "${name}"; src: url(data:application/x-font-woff2;charset=utf-8;base64,${window.__flowchartFunBase64EncodedFonts[url]}) format("woff2"); }}`;
          }
        }

        if (fontString) {
          const style = document.createElement("style");
          style.innerHTML = fontString;
          svgTag.prepend(style);
        }

        const correctedSvgStr = svgEl.documentElement.outerHTML;
        const { optimize } = await import("svgo/dist/svgo.browser");

        const { data } = optimize(correctedSvgStr, {
          js2svg: { pretty: true, indent: 2 },
          plugins: ["removeDimensions"],
        });
        return data;
      } catch (e) {
        console.error(e);
        return "";
      }
    };
  }, [bg, cy, graphTheme.font.files]);

  useEffect(() => {
    window.__FF_downloadSVG = async () => {
      const svg = await window.__FF_getSVG();
      if (!svg) return;
      saveAs(
        new Blob([svg], {
          type: "image/svg+xml;charset=utf-8",
        }),
        `${filename}.svg`
      );
    };
  }, [filename]);

  const getPNG = useCallback<
    (
      type: "jpg" | "png"
    ) => Promise<{ canvas: HTMLCanvasElement; cleanup: () => void } | undefined>
  >(
    async (type) => {
      if (!cy.current) return;
      const pngStr = await cy.current[type]({
        full: true,
        scale: 3,
        output: "blob-promise",
        bg,
      });

      // Get width and height of flowchart
      const { w, h } = await new Promise<{ w: number; h: number }>(
        (resolve) => {
          try {
            const img = new Image();
            img.src = window.URL.createObjectURL(pngStr);
            let w: number, h: number;
            img.onload = () => {
              w = img.width;
              h = img.height;
              document.body.removeChild(img);
              resolve({ w, h });
            };
            document.body.appendChild(img);
          } catch (e) {
            resolve({ w: 0, h: 0 });
          }
        }
      );

      // Create canvas with size + padding
      const canvas = document.createElement("canvas");
      canvas.width = w + PADDING;
      canvas.height = h + PADDING;

      // add canvas to document and get context
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // draw background on canvas
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // take the blob and draw it on center of canvas
      const img = new Image();
      img.src = window.URL.createObjectURL(pngStr);
      return new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, PADDING / 2, PADDING / 2);
          window.URL.revokeObjectURL(img.src);
          resolve({
            canvas,
            cleanup: () => {
              // throw away canvas
              canvas.remove();
            },
          });
        };
      });
    },
    [bg, cy]
  );

  useEffect(() => {
    window.__FF_downloadPNG = async () => {
      const png = await getPNG("png");
      if (!png) return;
      const { canvas, cleanup } = png;
      saveAs(canvas.toDataURL("image/png"), `${filename}.png`);
      cleanup();
    };
  }, [filename, getPNG]);

  useEffect(() => {
    window.__FF_copyPNG = async () => {
      const png = await getPNG("png");
      if (!png) return;
      const { canvas, cleanup } = png;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
      });
      if (!blob) return; // TODO: show error
      cleanup();
      return navigator.clipboard.write([
        new ClipboardItem({
          [`image/png`]: blob,
        }),
      ]);
    };
  }, [bg, cy, getPNG]);

  useEffect(() => {
    window.__FF_downloadJPG = async () => {
      const img = await getPNG("jpg");
      if (!img) return;
      const { canvas, cleanup } = img;
      saveAs(canvas.toDataURL("image/jpeg"), `${filename}.jpg`);
      cleanup();
    };
  }, [filename, getPNG]);

  useEffect(() => {
    window.__FF_getGraphThemeBG = () => bg;
  }, [bg]);
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
