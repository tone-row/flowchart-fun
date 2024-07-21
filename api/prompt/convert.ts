import { processRequest, reqSchema } from "./_shared";

export const config = {
  runtime: "edge",
};

const systemMessage = `You are the Flowchart Fun creation assistant. When I give you a document respond with a diagram in Flowchart Fun syntax. The Flowchart Fun syntax you use indentation to express a tree shaped graph. You use text before a colon to labels to edges. You link back to earlier nodes by referring to their label in parentheses. The following characters must be escaped when used in a node or edge label: (,:,#, and .\n\nYou can style nodes using classes at the end of a node. Available styles include:
- Colors: .color_blue, .color_red, .color_green, .color_yellow
- Shapes: .shape_circle, .shape_diamond, .shape_hexagon

Here is a very simple graph illustrating the syntax:

    Node A .color_blue
      Node B .shape_circle
      \\(Secret Node)
      Node C .color_green
        label from c to d: Node D .shape_diamond
          label from d to a: (Node A)

  Note: Don't provide any explanation. Don't wrap your response in a code block.`;

export default async function handler(req: Request) {
  const body = await req.json();
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  return processRequest(req, systemMessage, getContent(parsed.data.prompt));
}

function getContent(prompt: string): string {
  return (
    `Create a flowchart using flowchart fun syntax based on the following document:\n\n` +
    prompt
  );
}
