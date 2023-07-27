import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import dagre from "cytoscape-dagre";
import elk from "cytoscape-elk";
import klay from "cytoscape-klay";

if (!cytoscape.prototype.hasInitialised) {
  cytoscape.use(dagre);
  cytoscape.use(klay);
  cytoscape.use(coseBilkent);
  cytoscape.use(elk);
  cytoscape.prototype.hasInitialised = true;
}

export { cytoscape };
