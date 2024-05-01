import { z } from "zod";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { stripe } from "../_lib/_stripe";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

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
  const ip = getIp(req);

  let isPro = false,
    customerId: null | string = null;

  // Check for auth token
  const token = req.headers.get("Authorization");

  if (token) {
    // get sid from token
    const sid = token.split(" ")[1];

    // check if subscription is active or trialing
    const sub = await stripe.subscriptions.retrieve(sid);
    if (sub.status === "active" || sub.status === "trialing") {
      isPro = true;
      customerId = sub.customer as string;
    }
  }

  // Implement rate-limiting based on IP for unauthorized users and customerId for authorized users
  // Initialize Upstash Ratelimit
  const ratelimit = new Ratelimit({
    redis: kv,
    limiter: isPro
      ? Ratelimit.slidingWindow(3, "1m") // Pro users: 3 requests per minute
      : Ratelimit.fixedWindow(5, "30d"), // Unauthenticated users: 5 requests per month
  });

  // Determine the key for rate limiting
  const rateLimitKey = isPro ? `pro_${customerId}` : `unauth_${ip}`;

  // Check the rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(
    rateLimitKey
  );

  if (!success) {
    return new Response("You have reached your request limit.", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }

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
          label from d to a: (Node A)

  Note: Don't provide any explanation. Don't wrap your response in a code block.`,
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

function getIp(req: Request) {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-client-ip") ||
    req.headers.get("x-cluster-client-ip") ||
    req.headers.get("forwarded-for") ||
    req.headers.get("forwarded") ||
    req.headers.get("via") ||
    req.headers.get("x-forwarded") ||
    req.headers.get
  );
}
