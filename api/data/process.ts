import { VercelRequest, VercelResponse } from "@vercel/node";
import { mapDataToGraph } from "./_mapDataToGraph";
import { stringify } from "graph-selector";

/**
 * Receives text/csv content in post request
 * Needs to parse it then console log it
 * return 200
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    const { mapping, data } = req.body;
    if (!mapping || !data) {
      res.status(400).send("Missing mapping or data");
      return;
    }

    const graph = mapDataToGraph(data, mapping);

    const numNodes = graph.nodes.length;
    const numEdges = graph.edges.length;
    const graphString = stringify(graph);

    res.status(200).send({ numNodes, numEdges, graphString });
  } catch (e) {
    res.status(500).send((e as Error).message);
  }
}
