import { VercelRequest, VercelResponse } from "@vercel/node";
import { getIssues } from "./_lib/_linear";
import { getAreasOfResearchHtml } from "./_lib/_notion";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const [issues, areasOfResearch] = await Promise.all([
    getIssues(),
    getAreasOfResearchHtml(),
  ]);
  res.status(200).json({ issues, areasOfResearch });
}
