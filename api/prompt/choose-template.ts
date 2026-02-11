import { z } from "zod";
import { templateRateLimit } from "./_shared";
import { generateText, Output } from "ai";
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

  const result = await generateText({
    model: "openai/gpt-oss-120b",
    output: Output.object({ schema }),
    prompt: getContent(parsed.data.prompt),
    system: systemMessage,
    providerOptions: {
      gateway: {
        order: ["cerebras"],
      },
    },
  });

  const templateChoice = schema.parse(result.output);

  return new Response(JSON.stringify({ template: templateChoice.template }), {
    headers: { "Content-Type": "application/json" },
  });
}

function getContent(prompt: string): string {
  return `Which template would you like to use for the following prompt?\n\n'''${prompt}'''`;
}
