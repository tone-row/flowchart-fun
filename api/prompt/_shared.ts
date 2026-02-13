import { z } from "zod";
import { streamText } from "ai";
import { stripe } from "../_lib/_stripe";
import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

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
      : Ratelimit.fixedWindow(2, "30d"),
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

export const DEFAULT_MODEL = "openai/gpt-oss-120b";

export const GATEWAY_OPTIONS = {
  gateway: {
    order: ["cerebras"],
  },
};

export async function processRequest(
  req: Request,
  systemMessage: string,
  content: string,
  model: string = DEFAULT_MODEL
) {
  const { isPro, customerId } = await checkUserStatus(req);
  const rateLimitResponse = await handleRateLimit(req, isPro, customerId);
  if (rateLimitResponse) return rateLimitResponse;

  const result = streamText({
    model,
    system: systemMessage,
    temperature: 0.1,
    providerOptions: GATEWAY_OPTIONS,
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

export const systemMessageSyntax = `Flowchart Fun Syntax:
- Indentation creates parent→child edges (tree-shaped graph).
- Text before a colon labels the edge: "yes: Next Step" creates an edge labeled "yes".
- Reference a previously declared node by wrapping its label in parentheses: (Node Name).
- Escape these characters in node/edge labels: ( ) : # . \\
- Style nodes with classes at the end: Node A .color_blue.shape_diamond`;

export const systemMessagePitfalls = `Common mistakes to avoid:
- NEVER start a line with an edge label at the root level (no indentation). "start: Node A" on the first line is invalid because there is no parent node to draw an edge from. Create the source node first, then indent the labeled edge beneath it.
- Only reference nodes that have already been declared above. (Node X) is invalid if Node X has not appeared yet.
- Indentation must be consistent. Use spaces (not tabs). Each indent level adds children to the nearest less-indented node above.
- Do NOT wrap your output in markdown code fences (\`\`\`). Return raw Flowchart Fun syntax only.`;
