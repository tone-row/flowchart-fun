import { getPage } from "./src/getPage";
import { readFileSync } from "fs";
import { join } from "path";
import type { ElementDefinition } from "cytoscape";

/**
 * Returns a base64 encoded PNG image of a cytoscape graph
 */
export async function getPng({ elements }: { elements: ElementDefinition[] }) {
  const { page, browser } = await getPage();

  // read the file from "./dist/index.html"
  const indexHtml = join(__dirname, "dist/index.html");
  const html = readFileSync(indexHtml, "utf8");

  // set the page content
  await page.setContent(html);

  // execute code in the browser
  await page.evaluate((elements) => {
    console.log(window.cy);
    // set elements
    window.cy.json({ elements });
    window.cy.layout({ name: "grid" }).run();

    // json stringify the elements, and write them to a fixed position
    // div on the page so we can read them out in the next step
    const elementsDiv = document.createElement("div");
    elementsDiv.id = "elements";
    elementsDiv.style.position = "fixed";
    elementsDiv.style.top = "0";
    elementsDiv.style.left = "0";
    elementsDiv.textContent = JSON.stringify(elements);
    document.body.appendChild(elementsDiv);
  }, elements);

  const screenshot = await page.screenshot({ encoding: "base64" });

  await browser.close();

  return screenshot;
}
