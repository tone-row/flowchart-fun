import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const secret = process.env.DB_SECRET;

if (!url || !secret) throw new Error("No Supabase URL or secret provided");

export const supabase = createClient(url, secret);
