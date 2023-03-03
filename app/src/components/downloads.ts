import { Core } from "cytoscape";
import { saveAs } from "file-saver";

import { UNAUTH_IMG_SCALE } from "../lib/constants";
import { getBackgroundColor } from "../lib/graphThemes";
import { Theme } from "../lib/themes/constants";

// padding, gets divided in half
const PADDING = 60;

/**
 * Returns the SVG code for the current graph
 */
export async function getSvg({ cy, theme }: { cy: Core; theme: Theme }) {
  const bg = getBackgroundColor(theme);

  try {
    // @ts-ignore
    const svgStr = cy.svg({
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
    const files = theme.font.files;
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
}

export async function downloadSvg({
  svg,
  filename,
}: {
  svg: string;
  filename: string;
}) {
  return saveAs(
    new Blob([svg], {
      type: "image/svg+xml;charset=utf-8",
    }),
    `${filename}.svg`
  );
}

/**
 * Grab the current graph on a canvas with padding
 * and possible watermark for conversion and download
 */
export async function getCanvas({
  cy,
  type,
  theme,
  scale = UNAUTH_IMG_SCALE,
  watermark = true,
}: {
  cy: Core;
  type: "jpg" | "png";
  theme: Theme;
  scale?: number;
  watermark?: boolean;
}): Promise<{
  canvas: HTMLCanvasElement;
  type: "jpg" | "png";
  cleanup: () => void;
}> {
  const bg = getBackgroundColor(theme);
  const blob = await cy[type]({
    full: true,
    scale,
    output: "blob-promise",
    bg,
  });

  // Get width and height of flowchart
  const { w, h } = await new Promise<{ w: number; h: number }>((resolve) => {
    try {
      const img = new Image();
      img.src = window.URL.createObjectURL(blob);
      let w: number, h: number;
      img.onload = () => {
        w = img.naturalWidth;
        h = img.naturalHeight;
        document.body.removeChild(img);
        resolve({ w, h });
      };
      document.body.appendChild(img);
    } catch (e) {
      resolve({ w: 0, h: 0 });
    }
  });

  // Create canvas with size + padding
  const canvas = document.createElement("canvas");
  canvas.width = w + PADDING;
  canvas.height = h + PADDING;

  // add canvas to document and get context
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // draw background on canvas
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // take the blob and draw it on center of canvas
  const img = new Image();
  img.src = window.URL.createObjectURL(blob);
  return new Promise((resolve) => {
    img.onload = () => {
      ctx.drawImage(img, PADDING / 2, PADDING / 2);
      window.URL.revokeObjectURL(img.src);
      // add watermark
      if (watermark)
        addWatermark({
          ctx,
          width: canvas.width,
          height: canvas.height,
          theme,
        });
      resolve({
        canvas,
        type,
        cleanup: () => {
          // throw away canvas
          canvas.remove();
        },
      });
    };
  });
}

async function addWatermark({
  ctx,
  width,
  height,
  theme,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  theme: Theme;
}) {
  const foreground = theme.fg;
  // get a size that is 3% of the canvas height
  const heightRelativeSize = Math.floor(height * 0.03);
  const widthRelativeSize = Math.floor(width * 0.05);
  // take the smaller of the two
  const size = Math.min(heightRelativeSize, widthRelativeSize);
  ctx.font = `${Math.floor(size)}px Helvetica`;
  ctx.fillStyle = foreground;
  ctx.fillText("flowchart.fun", 5, height - size / 2);
}

export function downloadCanvas({
  canvas,
  type,
  cleanup,
  filename,
}: {
  filename: string;
} & Awaited<ReturnType<typeof getCanvas>>) {
  const mime = type === "png" ? "image/png" : "image/jpeg";
  saveAs(canvas.toDataURL(mime), `${filename}.${type}`);
  cleanup();
}

export async function copyCanvas(props: Awaited<ReturnType<typeof getCanvas>>) {
  const { canvas, cleanup, type } = props;
  if (type !== "png") throw new Error("Can only copy png images");
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
