import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.DB_SECRET
);

export default async function handler(req, res) {
  const publicId = req.query.publicId;
  if (!publicId) throw new Error("Missing publicId");
  const { data, error } = await supabase
    .from("user_charts")
    .select("name,chart,is_public")
    .eq("public_id", publicId);
  if (error)
    return res.status("400").json({ error: { message: error.message } });
  if (!data.length)
    return res.status("404").json({ error: { message: "Not found" } });
  if (!data[0].is_public)
    return res.status("404").json({ error: { message: "Not found" } });
  return res.json({ data: data[0] });
}
