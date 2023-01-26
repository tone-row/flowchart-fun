import { VercelRequest, VercelResponse } from "@vercel/node";
import { getIssues } from "./_lib/_linear";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const issues = await getIssues();
  res.status(200).json(issues);
}
