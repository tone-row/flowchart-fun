import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.DB_SECRET
);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) throw new Error("Missing id");
  const { data, error } = await supabase
    .from("user_charts")
    .select("name,chart,is_public")
    .eq("public_id", id);
  if (error) {
    console.log(error);
    return res.status("400").json({ error: { message: error.message } });
  }
  if (!data.length) {
    console.log("No data found");
    console.log(data);
    return res.status("404").json({ error: { message: "Not found" } });
  }
  if (!data[0].is_public) {
    console.log("Chart is not public");
    return res.status("404").json({ error: { message: "Not found" } });
  }
  return res.json({ data: data[0] });
}
