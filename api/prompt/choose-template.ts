import { z } from "zod";
import { templateRateLimit } from "./_shared";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

const templateNames = [
  //   "default",
  "flowchart",
  "org-chart",
  "code-flow",
  "mindmap",
  "knowledge-graph",
] as const;

const schema = z.object({
  template: z.enum(templateNames),
});

const reqSchema = z.object({
  prompt: z.string(),
});

export const config = {
  runtime: "edge",
};

const systemMessage = `You are the Flowchart Fun template assistant. When given a prompt, analyze it and choose the most appropriate template from the following options: ${templateNames.join(
  ", "
)}. Respond only with the chosen template name.`;

export default async function handler(req: Request) {
  const rateLimitResponse = await templateRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = reqSchema.safeParse(await req.json());

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  const result = await generateObject({
    model: openai("gpt-3.5-turbo"),
    schema,
    prompt: getContent(parsed.data.prompt),
    system: systemMessage,
  });

  // Parse the result to ensure it matches one of the template options
  const templateChoice = schema.parse(result.object);

  return new Response(JSON.stringify({ template: templateChoice.template }), {
    headers: { "Content-Type": "application/json" },
  });
}

function getContent(prompt: string): string {
  return `Based on the following prompt, choose the most appropriate template (default, cytoscape, or theme):\n\n${prompt}`;
}
