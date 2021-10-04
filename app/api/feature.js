/**
 * Eventually this handler will be responsible for
 * determining what features a user has access to
 */
export default async function handler(_req, res) {
  let flags = [];
  if (process.env.VERCEL_ENV === "development") {
    flags.push("next");
  }
  res.json(flags);
}
