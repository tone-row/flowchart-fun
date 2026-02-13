import {
  processRequest,
  reqSchema,
  systemMessageExample,
  systemMessageStyle,
  systemMessageSyntax,
  systemMessagePitfalls,
} from "./_shared";

export const config = {
  runtime: "edge",
};

const systemMessage = `You are the Flowchart Fun creation assistant. When I give you a prompt, respond with a diagram in Flowchart Fun syntax.

${systemMessageSyntax}

${systemMessageStyle}

Here is a very simple graph illustrating the syntax:

${systemMessageExample}

${systemMessagePitfalls}

Note: Don't provide any explanation. Don't wrap your response in a code block.`;

export default async function handler(req: Request) {
  const body = await req.json();
  const parsed = reqSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  return processRequest(req, systemMessage, parsed.data.prompt);
}
