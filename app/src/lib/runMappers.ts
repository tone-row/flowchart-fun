import type { Core } from "cytoscape";

/**
 * We use mappers to transform certain data-attributes
 * into certain styles. They're shared between all the
 * templates.
 */
export function runMappers(cy: Core) {
  cy.style()
    .selector("node[icon]")
    .style({
      "background-image": (ele: any) => {
        const icon = ele.data("icon");
        return `https://raw.githubusercontent.com/google/material-design-icons/master/src/${icon}/materialicons/24px.svg`;
      },
    });
}
