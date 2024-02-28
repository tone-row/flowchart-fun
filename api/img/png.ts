import { VercelApiHandler } from "@vercel/node";
import { supabase } from "../_lib/_supabase";
import { getPng } from "static";
import { parse, toCytoscapeElements } from "graph-selector";

/** 
NEXT STEP
- get cytoscape installed either her or in a third package and render anything
*/

// This handler is going to produce a static png image of a given id
const handler: VercelApiHandler = async (req, res) => {
  // get id from the query
  const id = req.query.id;

  if (!id) {
    res.status(400).send("id is required");
    return;
  }

  // loop up code in database
  const chart = await supabase
    .from("user_charts")
    .select("*")
    .eq("id", id)
    .single();

  if (!isValid(chart)) {
    res.status(404).send("Chart not found");
    return;
  }

  const { content, meta } = parseChart(chart.data.chart);
  console.log(meta);
  const graph = parse(content);
  const elements = toCytoscapeElements(graph);

  const base64Str = await getPng({ elements });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(Buffer.from(base64Str, "base64"));
};

export default handler;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValid(project: any): project is { data: { chart: string } } {
  return (
    typeof project === "object" &&
    project !== null &&
    typeof project?.data === "object" &&
    project?.data !== null &&
    typeof project?.data?.chart === "string"
  );
}

/**
 * Given a chart string, parses it into
 */
function parseChart(chart: string) {
  const [content, metaStr] = chart.split("=====");
  const meta = JSON.parse(metaStr);
  return {
    content,
    meta,
  };
}
