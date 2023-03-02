import { VercelRequest, VercelResponse } from "@vercel/node";
import { confirmActiveSubscriptionFromToken } from "./_lib/_helpers";
import { supabase } from "./_lib/_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // make sure user is logged in
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  if (!confirmActiveSubscriptionFromToken(token)) {
    return res.status(402).send("Unauthorized");
  }

  // get chartId and userEmail from request body
  const { chartId, userEmail } = req.body;
  if (!chartId || !userEmail) {
    return res.status(400).send("Missing chartId or userEmail");
  }

  const result = await supabase.from("shared_charts").insert([
    {
      flowchart_id: chartId,
      user_email: userEmail,
    },
  ]);

  if (result.error) {
    return res.status(400).send(result.error.message);
  }

  return res.status(200).send("Chart shared successfully");
}
