import { z } from "zod";
import { streamText } from "ai";
import { stripe } from "../_lib/_stripe";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { openai } from "@ai-sdk/openai";

export const reqSchema = z.object({
  prompt: z.string().min(1),
  document: z.string(),
});

export async function handleRateLimit(req: Request) {
  const ip = getIp(req);
  let isPro = false,
    customerId: null | string = null;

  const token = req.headers.get("Authorization");

  if (token) {
    const sid = token.split(" ")[1];
    const sub = await stripe.subscriptions.retrieve(sid);
    if (sub.status === "active" || sub.status === "trialing") {
      isPro = true;
      customerId = sub.customer as string;
    }
  }

  const ratelimit = new Ratelimit({
    redis: kv,
    limiter: isPro
      ? Ratelimit.slidingWindow(3, "1m")
      : Ratelimit.fixedWindow(3, "30d"),
  });

  const rateLimitKey = isPro ? `pro_${customerId}` : `unauth_${ip}`;
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

  return null;
}

export async function processRequest(
  req: Request,
  systemMessage: string,
  content: string,
  model: Parameters<typeof openai.chat>[0] = "gpt-4-turbo"
) {
  const rateLimitResponse = await handleRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const result = await streamText({
    model: openai.chat(model),
    system: systemMessage,
    temperature: 1,
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });

  return result.toTextStreamResponse();
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

export const systemMessageStyle = `You can style nodes using classes at the end of a node. Available styles include:
- Colors: .color_blue, .color_red, .color_green, .color_yellow, .color_orange
- Shapes: .shape_circle, .shape_diamond, .shape_ellipse, .shape_right-rhomboid`;

export const systemMessageExample = `Node A
  Node B .shape_circle
  \\(Secret Node)
  Node C
    label from c to d: Node D .color_green.shape_diamond
      label from d to a: (Node A)`;
