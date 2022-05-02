import cytoscape from "cytoscape";

/* Going to load more layouts from the get-go if the user is logged in */

let loaded = false;
export async function loadSponsorOnlyLayouts() {
  if (loaded) return;
  loaded = true;
  console.log("Loading sponsor-only layouts");
  const elk = await import("cytoscape-elk");
  cytoscape.use(elk.default);
  console.log("Loaded sponsor-only layouts");
}

export { cytoscape };
