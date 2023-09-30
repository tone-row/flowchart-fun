import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";
import klay from "cytoscape-klay";
import fcose from "cytoscape-fcose";

// import gridGuide from "cytoscape-grid-guide";

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.use(klay);
  cytoscape.use(coseBilkent);
  cytoscape.use(elk);
  cytoscape.use(fcose);
  // cytoscape.use(gridGuide);
  cytoscape.prototype.hasInitialised = true;
}

export { cytoscape };
