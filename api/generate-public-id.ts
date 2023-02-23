import { VercelRequest, VercelResponse } from "@vercel/node";
import Moniker from "moniker";

const names = Moniker.generator([
  Moniker.adjective,
  Moniker.noun,
  Moniker.verb,
]);

export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  res.json(names.choose());
}
