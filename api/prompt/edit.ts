import { processRequest, reqSchema } from "./_shared";

export const config = {
  runtime: "edge",
};

const systemMessage = `You are an AI document editor specializing in Flowchart Fun syntax. When given a document and editing instructions, return the same document with only the requested changes. Do not make any additional changes, including whitespace changes, beyond what is explicitly requested. Preserve all original formatting and content except where modifications are necessary.

Flowchart Fun Syntax:
- Use indentation to express a tree-shaped graph.
- Text before a colon represents labels for edges.
- Link back to earlier nodes by referring to their label in parentheses.
- Escape the following characters when used in a node or edge label: (,:,#, and \\.
- Use classes at the end of a node to apply styles. (e.g., .color_blue,.shape_circle)

Example:
    Node A
      Node B .color_blue
      \\(Secret Node)
      Node C
        label from c to d: Node D
          label from d to a: (Node A)

When editing, ensure that the Flowchart Fun syntax remains valid and consistent.`;

export default async function handler(req: Request) {
  const body = await req.json();
  const parsed = reqSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  return processRequest(
    req,
    systemMessage,
    getContent(parsed.data.prompt, parsed.data.document),
    "gpt-4-turbo-2024-04-09"
  );
}

function getContent(prompt: string, document: string): string {
  return `Edit the following document according to these instructions:\n\nInstructions: ${prompt}\n\nDocument:\n${document}`;
}
