import { z } from "zod";
import { streamText } from "ai";
import { stripe } from "../_lib/_stripe";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";
import { createOpenAI, type openai as OpenAI } from "@ai-sdk/openai";

export const reqSchema = z.object({
  prompt: z.string().min(1),
  document: z.string(),
});

async function checkUserStatus(req: Request) {
  let isPro = false;
  let customerId: null | string = null;

  const token = req.headers.get("Authorization");

  if (token) {
    const sid = token.split(" ")[1];
    const sub = await stripe.subscriptions.retrieve(sid);
    if (sub.status === "active" || sub.status === "trialing") {
      isPro = true;
      customerId = sub.customer as string;
    }
  }

  return { isPro, customerId };
}

export async function handleRateLimit(
  req: Request,
  isPro: boolean,
  customerId: string | null
) {
  const ip = getIp(req);

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

/**
 * Rate limit for template requests
 */
export async function templateRateLimit(req: Request) {
  const ip = getIp(req);

  const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(3, "1m"),
  });
  const rateLimitKey = `template_${ip}`;
  const { success, limit, reset, remaining } = await ratelimit.limit(
    rateLimitKey
  );

  if (!success) {
    return new Response("You have reached your request limit for templates.", {
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
  model: Parameters<typeof OpenAI.chat>[0] = "gpt-4-turbo"
) {
  const { isPro, customerId } = await checkUserStatus(req);
  const rateLimitResponse = await handleRateLimit(req, isPro, customerId);
  if (rateLimitResponse) return rateLimitResponse;

  const openai = createOpenAI({
    apiKey: getOpenAiApiKey(isPro),
  });

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

/**
 * Returns the right api key depending on the user's subscription
 * so we can track usage. Bear in mind a development key is used for
 * anything that's not production.
 */
function getOpenAiApiKey(isPro: boolean) {
  if (isPro) {
    return process.env.OPENAI_API_KEY_PRO;
  }

  return process.env.OPENAI_API_KEY_FREE;
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
