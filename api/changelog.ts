import { VercelRequest, VercelResponse } from "@vercel/node";
import { getReleases } from "./_lib/_releases";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const releases = await getReleases();
  res.json(releases);
}
