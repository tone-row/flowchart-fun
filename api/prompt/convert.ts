import { z } from "zod";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

export const config = {
  runtime: "edge",
};

const reqSchema = z.object({
  prompt: z.string().min(1),
});

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export default async function handler(req: Request) {
  const body = await req.json();
  const parsed = reqSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify(parsed.error), { status: 400 });
  }

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    stream: true,
    messages: [
      {
        role: "system",
        content: `You are the Flowchart Fun creation assistant. When I give you a document respond with a diagram in Flowchart Fun syntax. The Flowchart Fun syntax you use indentation to express a tree shaped graph. You use text before a colon to labels to edges. You link back to earlier nodes by referring to their label in parentheses. The following characters must be escaped when used in a node or edge label: (,:,#, and .\n\nHere is a very simple graph illustrating the syntax:

Node A
  Node B
  \\(Secret Node)
  Node C
    label from c to d: Node D
      label from d to a: (Node A)`,
      },
      {
        role: "user",
        content:
          `Create a flowchart using flowchart fun syntax based on the following document:\n\n` +
          parsed.data.prompt,
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
