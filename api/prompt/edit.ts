import { VercelApiHandler } from "@vercel/node";
import { llmMany } from "../_lib/_llm";
import { z } from "zod";

const nodeSchema = z.object({
  // id: z.string(),
  // classes: z.string(),
  label: z.string(),
});

const edgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional().default(""),
});

const graphSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

const handler: VercelApiHandler = async (req, res) => {
  const { graph, prompt } = req.body;
  if (!graph || !prompt) {
    throw new Error("Missing graph or prompt");
  }

  const result = await llmMany(
    `You are a one-shot AI flowchart assistant. Help the user with a flowchart or diagram. Here is the current state of the flowchart:
${JSON.stringify(graph, null, 2)}

Here is the user's message:
${prompt}`,
    {
      updateGraph: graphSchema,
    }
  );

  res.json(result);
};

export default handler;
