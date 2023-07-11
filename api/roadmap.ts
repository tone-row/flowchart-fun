import { VercelRequest, VercelResponse } from "@vercel/node";

import { getAreasOfResearchHtml } from "./_lib/_notion";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const areasOfResearch = await getAreasOfResearchHtml();
  res.status(200).json({ areasOfResearch });
}
