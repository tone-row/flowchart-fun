import { VercelApiHandler } from "@vercel/node";

const loopsApiKey = process.env.LOOPS_API_KEY;
if (!loopsApiKey) throw new Error("Missing LOOPS_API_KEY env var");

const handler: VercelApiHandler = async (req, res) => {
  const { body } = req;
  await fetch("https://app.loops.so/api/v1/events/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loopsApiKey}`,
    },
    body: JSON.stringify(body),
  });
  res.status(200).json({ ok: true });
};

export default handler;
