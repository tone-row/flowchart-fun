import { Core } from "cytoscape";
import { saveAs } from "file-saver";

import { UNAUTH_IMG_SCALE } from "../lib/constants";
import { cytoscape } from "../lib/cytoscape";
import { getBackground } from "../lib/toTheme";
import {
  WATERMARK_BASE64,
  WATERMARK_ORIGINAL_WIDTH,
  WATERMARK_ORIGINAL_HEIGHT,
  WATERMARK_WIDTH_PERCENTAGE,
  WATERMARK_MARGIN,
} from "../lib/constants";

// padding, gets divided in half
const PADDING = 60;

const MAX_ATTEMPTS = 8;
const SCALE_REDUCTION_FACTOR = 0.75;
const CANVAS_SIZE_ERROR = "`canvas.toBlob()` sent a null value in its callback";

/**
 * Returns the SVG code for the current graph
 */
export async function getSvg({ cy }: { cy: Core }) {
  const bg = getBackground();

  // check if cy has loaded the svg plugin
  // @ts-ignore
  if (!cy.svg) {
    const cytoscapeSvg = await import("cytoscape-svg");
    cytoscape.use(cytoscapeSvg.default);
  }

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
    // let fontString = "";
    // const files = theme.font.files;
    // if (files) {
    //   for (const { url, name } of files) {
    //     if (!(url in window.__flowchartFunBase64EncodedFonts)) {
    //       const fontUrl = `/fonts/${url}`;
    //       const font = await fetch(fontUrl)
    //         .then((res) => res.arrayBuffer())
    //         .catch((e) => console.error(e));
    //       if (!font) continue;
    //       const base64 = arrayBufferToBase64(font);
    //       window.__flowchartFunBase64EncodedFonts[url] = base64;
    //     }
    //     fontString += `@font-face { font-family: "${name}"; src: url(data:application/x-font-woff2;charset=utf-8;base64,${window.__flowchartFunBase64EncodedFonts[url]}) format("woff2"); }}`;
    //   }
    // }

    // if (fontString) {
    //   const style = document.createElement("style");
    //   style.innerHTML = fontString;
    //   svgTag.prepend(style);
    // }

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
  scale = UNAUTH_IMG_SCALE,
  watermark = true,
}: {
  cy: Core;
  type: "jpg" | "png";
  scale?: number;
  watermark?: boolean;
}): Promise<{
  canvas: HTMLCanvasElement;
  type: "jpg" | "png";
  cleanup: () => void;
}> {
  const bg = getBackground();
  let blob: Blob | null = null;
  let currentScale = scale;
  let attempts = 0;

  // Try to create the blob, reducing scale if necessary
  while (attempts < MAX_ATTEMPTS) {
    try {
      blob = await cy[type]({
        full: true,
        scale: currentScale,
        output: "blob-promise",
        bg,
      });
      break; // Success, exit the loop
    } catch (error) {
      if (error instanceof Error && error.message.includes(CANVAS_SIZE_ERROR)) {
        attempts++;
        currentScale *= SCALE_REDUCTION_FACTOR;
        console.warn(
          `Canvas size too large. Reducing scale to ${currentScale}`
        );
      } else {
        throw error; // Rethrow if it's not the expected error
      }
    }
  }

  if (!blob) {
    throw new Error("Failed to create canvas after maximum attempts");
  }

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
    img.onload = async () => {
      ctx.drawImage(img, PADDING / 2, PADDING / 2);
      window.URL.revokeObjectURL(img.src);

      // add watermark if needed
      if (watermark) {
        await addWatermark({
          ctx,
          width: canvas.width,
          height: canvas.height,
        });
      }

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
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
}) {
  return new Promise<void>((resolve) => {
    // Create a new image for the watermark
    const watermarkImage = new Image();

    // Set up image load handler
    watermarkImage.onload = () => {
      // Calculate watermark dimensions
      const targetWidth = Math.floor(width * WATERMARK_WIDTH_PERCENTAGE);
      const scale = targetWidth / WATERMARK_ORIGINAL_WIDTH;
      const targetHeight = Math.floor(WATERMARK_ORIGINAL_HEIGHT * scale);

      // Position watermark in bottom-left corner with margin
      const x = WATERMARK_MARGIN;
      const y = height - targetHeight - WATERMARK_MARGIN;

      // Draw watermark with calculated dimensions
      ctx.globalAlpha = 0.8; // Adjust transparency if needed
      ctx.drawImage(watermarkImage, x, y, targetWidth, targetHeight);
      ctx.globalAlpha = 1.0; // Reset transparency

      resolve();
    };

    // Handle loading errors
    watermarkImage.onerror = () => {
      console.error("Failed to load watermark image");
      resolve(); // Resolve anyway to not block export
    };

    // Set image source from base64
    watermarkImage.src = `data:image/png;base64,${WATERMARK_BASE64}`;
  });
}

export function downloadCanvas({
  canvas,
  type,
  cleanup,
  filename,
}: {
  filename: string;
} & Awaited<ReturnType<typeof getCanvas>>) {
  console.log("downloadCanvas", canvas, type, filename);
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

function _arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
