import { VercelRequest, VercelResponse } from "@vercel/node";
import { mail } from "./_lib/_mail";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = req.body.email;
  if (!email) return res.status(400).send({ error: "No email provided" });
  try {
    mail
      .send(email)
      .then(() => {
        return res.json({ success: true });
      })
      .catch((error) => {
        throw new Error(error);
      });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
}
