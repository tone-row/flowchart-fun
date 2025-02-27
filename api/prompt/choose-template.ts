import { z } from "zod";
import { templateRateLimit } from "./_shared";
import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { templates } from "shared";

const schema = z.object({
  template: z.enum(templates),
});

const reqSchema = z.object({
  prompt: z.string(),
});

export const config = {
  runtime: "edge",
};

const systemMessage = `You're the Flowchart Fun Template Picker. From the list of templates, find the most interesting one to use for the user's prompt. Avoid using default.`;

export default async function handler(req: Request) {
  const rateLimitResponse = await templateRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const parsed = reqSchema.safeParse(await req.json());

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY_FREE) {
    throw new Error("No Anthropic API key provided");
  }

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY_FREE,
  });

  const result = await generateObject({
    model: anthropic("claude-3-5-sonnet-latest"),
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
  return `Which template would you like to use for the following prompt?\n\n'''${prompt}'''`;
}
