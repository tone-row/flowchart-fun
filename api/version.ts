import { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Return the app package.json version
 */
export default async function version(req: VercelRequest, res: VercelResponse) {
  try {
    const { version } = require("../app/package.json");
    res.json({ version });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
}
